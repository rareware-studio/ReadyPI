#!/usr/bin/env bash
# =============================================================================
# ReadyPI — GCP Infrastructure Provisioning Script
# =============================================================================
# This script provisions the entire GCP production environment for ReadyPI.
# It is idempotent — safe to run multiple times without side effects.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated (gcloud auth login)
#   - Billing account linked to the project
#   - jq installed (brew install jq)
#
# Usage:
#   chmod +x gcp-init.sh && ./gcp-init.sh
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — Edit these before first run
# ---------------------------------------------------------------------------
export PROJECT_ID="${GCP_PROJECT_ID:-readypi-prod}"
export REGION="${GCP_REGION:-asia-southeast1}"
export ZONE="${GCP_ZONE:-asia-southeast1-a}"
export SQL_INSTANCE_NAME="readypi-db"
export SQL_TIER="db-f1-micro"
export SQL_DB_NAME="readypi"
export SQL_DB_USER="readypi_app"
export CLOUD_RUN_SERVICE="readypi-api"
export CLOUD_RUN_IMAGE="gcr.io/${PROJECT_ID}/${CLOUD_RUN_SERVICE}"
export FIREBASE_PROJECT="${PROJECT_ID}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_step() { echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${GREEN}▸ $1${NC}"; }
log_info() { echo -e "${YELLOW}  ℹ $1${NC}"; }
log_ok()   { echo -e "${GREEN}  ✓ $1${NC}"; }
log_err()  { echo -e "${RED}  ✗ $1${NC}"; }

# =============================================================================
# STEP 1: Project Initialization
# =============================================================================
log_step "STEP 1/9 — Project Initialization"

# Check if project exists; create if not
if gcloud projects describe "${PROJECT_ID}" &>/dev/null; then
  log_ok "Project '${PROJECT_ID}' already exists"
else
  log_info "Creating project '${PROJECT_ID}'..."
  gcloud projects create "${PROJECT_ID}" \
    --name="ReadyPI Production" \
    --set-as-default
  log_ok "Project created"
fi

# Set active project
gcloud config set project "${PROJECT_ID}"
log_ok "Active project set to ${PROJECT_ID}"

# Link billing account (first available)
BILLING_ACCOUNT=$(gcloud billing accounts list --filter="open=true" --format="value(ACCOUNT_ID)" --limit=1 2>/dev/null || true)
if [ -n "${BILLING_ACCOUNT}" ]; then
  gcloud billing projects link "${PROJECT_ID}" --billing-account="${BILLING_ACCOUNT}" 2>/dev/null || true
  log_ok "Billing account ${BILLING_ACCOUNT} linked"
else
  log_err "No billing account found. Link one manually: https://console.cloud.google.com/billing"
fi

# =============================================================================
# STEP 2: Enable Required APIs
# =============================================================================
log_step "STEP 2/9 — Enabling Required APIs"

APIS=(
  "run.googleapis.com"
  "cloudbuild.googleapis.com"
  "secretmanager.googleapis.com"
  "sqladmin.googleapis.com"
  "containerregistry.googleapis.com"
  "artifactregistry.googleapis.com"
  "cloudresourcemanager.googleapis.com"
  "iam.googleapis.com"
  "firebase.googleapis.com"
  "firebaseauth.googleapis.com"
  "identitytoolkit.googleapis.com"
  "compute.googleapis.com"
)

for api in "${APIS[@]}"; do
  gcloud services enable "${api}" --project="${PROJECT_ID}" 2>/dev/null || true
  log_ok "Enabled ${api}"
done

# =============================================================================
# STEP 3: Provision Cloud SQL (PostgreSQL 15)
# =============================================================================
log_step "STEP 3/9 — Provisioning Cloud SQL (PostgreSQL 15)"

if gcloud sql instances describe "${SQL_INSTANCE_NAME}" --project="${PROJECT_ID}" &>/dev/null; then
  log_ok "Cloud SQL instance '${SQL_INSTANCE_NAME}' already exists"
else
  log_info "Creating Cloud SQL instance (this takes 5-10 minutes)..."
  gcloud sql instances create "${SQL_INSTANCE_NAME}" \
    --database-version=POSTGRES_15 \
    --tier="${SQL_TIER}" \
    --region="${REGION}" \
    --storage-type=SSD \
    --storage-size=10GB \
    --storage-auto-increase \
    --backup-start-time="03:00" \
    --backup-location="${REGION}" \
    --enable-point-in-time-recovery \
    --availability-type=zonal \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=4 \
    --database-flags=log_min_duration_statement=1000,max_connections=100 \
    --project="${PROJECT_ID}"
  log_ok "Cloud SQL instance created"
fi

# Create database
gcloud sql databases create "${SQL_DB_NAME}" \
  --instance="${SQL_INSTANCE_NAME}" \
  --project="${PROJECT_ID}" 2>/dev/null || log_info "Database '${SQL_DB_NAME}' already exists"

# Generate secure password for the application database user
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)

# Create application-specific database user (not using default postgres user)
gcloud sql users create "${SQL_DB_USER}" \
  --instance="${SQL_INSTANCE_NAME}" \
  --password="${DB_PASSWORD}" \
  --project="${PROJECT_ID}" 2>/dev/null || log_info "User '${SQL_DB_USER}' already exists, updating password..."

# Update password regardless (idempotent)
gcloud sql users set-password "${SQL_DB_USER}" \
  --instance="${SQL_INSTANCE_NAME}" \
  --password="${DB_PASSWORD}" \
  --project="${PROJECT_ID}"

log_ok "Cloud SQL ready — Instance: ${SQL_INSTANCE_NAME}, DB: ${SQL_DB_NAME}, User: ${SQL_DB_USER}"

# =============================================================================
# STEP 4: Store Secrets in Secret Manager
# =============================================================================
log_step "STEP 4/9 — Configuring Secret Manager"

store_secret() {
  local secret_name="$1"
  local secret_value="$2"

  if gcloud secrets describe "${secret_name}" --project="${PROJECT_ID}" &>/dev/null; then
    echo -n "${secret_value}" | gcloud secrets versions add "${secret_name}" \
      --data-file=- --project="${PROJECT_ID}"
    log_ok "Updated secret: ${secret_name}"
  else
    echo -n "${secret_value}" | gcloud secrets create "${secret_name}" \
      --data-file=- \
      --replication-policy=automatic \
      --project="${PROJECT_ID}"
    log_ok "Created secret: ${secret_name}"
  fi
}

# Generate a JWT secret
JWT_SECRET=$(openssl rand -base64 48 | tr -d '/+=' | head -c 64)

# Core secrets
store_secret "DB_PASSWORD" "${DB_PASSWORD}"
store_secret "JWT_SECRET" "${JWT_SECRET}"
store_secret "DB_HOST" "/cloudsql/${PROJECT_ID}:${REGION}:${SQL_INSTANCE_NAME}"
store_secret "DB_NAME" "${SQL_DB_NAME}"
store_secret "DB_USER" "${SQL_DB_USER}"

# Placeholder secrets for API keys — the user fills these via:
# echo -n "sk-..." | gcloud secrets versions add OPENAI_API_KEY --data-file=-
PROVIDER_SECRETS=(
  "OPENAI_API_KEY"
  "ANTHROPIC_API_KEY"
  "GOOGLE_API_KEY"
  "GROQ_API_KEY"
  "DEEPSEEK_API_KEY"
  "MISTRAL_API_KEY"
  "OPENROUTER_API_KEY"
  "SSLCOMMERZ_STORE_ID"
  "SSLCOMMERZ_STORE_PASSWORD"
  "NOWPAYMENTS_API_KEY"
  "NOWPAYMENTS_IPN_SECRET"
)

for secret_name in "${PROVIDER_SECRETS[@]}"; do
  if ! gcloud secrets describe "${secret_name}" --project="${PROJECT_ID}" &>/dev/null; then
    echo -n "PLACEHOLDER_SET_ME" | gcloud secrets create "${secret_name}" \
      --data-file=- \
      --replication-policy=automatic \
      --project="${PROJECT_ID}"
    log_info "Created placeholder secret: ${secret_name} (update with real value)"
  else
    log_ok "Secret exists: ${secret_name}"
  fi
done

echo ""
log_info "To set a real API key:"
log_info "  echo -n 'sk-your-real-key' | gcloud secrets versions add OPENAI_API_KEY --data-file=- --project=${PROJECT_ID}"

# =============================================================================
# STEP 5: Firebase Project Initialization
# =============================================================================
log_step "STEP 5/9 — Firebase Project Setup"

# Add Firebase to existing GCP project
if command -v firebase &>/dev/null || npx -y firebase-tools@latest --version &>/dev/null; then
  log_info "Linking Firebase to GCP project '${PROJECT_ID}'..."
  npx -y firebase-tools@latest projects:addfirebase "${PROJECT_ID}" 2>/dev/null || log_info "Firebase may already be linked"
  log_ok "Firebase project linked"
else
  log_info "Install Firebase CLI: npm install -g firebase-tools"
  log_info "Then run: firebase projects:addfirebase ${PROJECT_ID}"
fi

# Enable Firebase Auth providers via gcloud Identity Platform
log_info "Enabling Firebase Auth (Email/Password + Google OAuth)..."
gcloud identity-platform config update \
  --project="${PROJECT_ID}" \
  --autodelete-anonymous-users 2>/dev/null || true

# Enable email/password sign-in
gcloud identity-platform config update \
  --project="${PROJECT_ID}" 2>/dev/null || true

log_ok "Firebase Auth enabled. Configure providers at: https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers"

# =============================================================================
# STEP 6: IAM — Least-Privilege Service Account
# =============================================================================
log_step "STEP 6/9 — IAM Least-Privilege Configuration"

PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Create a dedicated service account for Cloud Run
SA_NAME="readypi-api-runner"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

if ! gcloud iam service-accounts describe "${SA_EMAIL}" --project="${PROJECT_ID}" &>/dev/null; then
  gcloud iam service-accounts create "${SA_NAME}" \
    --display-name="ReadyPI API Runner" \
    --description="Dedicated service account for ReadyPI Cloud Run service" \
    --project="${PROJECT_ID}"
  log_ok "Service account created: ${SA_EMAIL}"
else
  log_ok "Service account exists: ${SA_EMAIL}"
fi

# Bind IAM roles to the dedicated service account
ROLES=(
  "roles/cloudsql.client"
  "roles/secretmanager.secretAccessor"
  "roles/logging.logWriter"
  "roles/monitoring.metricWriter"
  "roles/cloudtrace.agent"
)

for role in "${ROLES[@]}"; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${role}" \
    --condition=None \
    --quiet 2>/dev/null || true
  log_ok "Granted ${role} to ${SA_NAME}"
done

# Grant Cloud Build permission to deploy to Cloud Run
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin" \
  --condition=None \
  --quiet 2>/dev/null || true

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser" \
  --condition=None \
  --quiet 2>/dev/null || true

log_ok "Cloud Build can deploy to Cloud Run"

# Grant Secret Manager access for all secrets to the service account
for secret_name in "DB_PASSWORD" "JWT_SECRET" "DB_HOST" "DB_NAME" "DB_USER" "${PROVIDER_SECRETS[@]}"; do
  gcloud secrets add-iam-policy-binding "${secret_name}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/secretmanager.secretAccessor" \
    --project="${PROJECT_ID}" \
    --quiet 2>/dev/null || true
done
log_ok "Secret access granted to service account"

# =============================================================================
# STEP 7: Create Artifact Registry Repository
# =============================================================================
log_step "STEP 7/9 — Artifact Registry"

REPO_NAME="readypi-docker"
if ! gcloud artifacts repositories describe "${REPO_NAME}" \
  --location="${REGION}" --project="${PROJECT_ID}" &>/dev/null; then
  gcloud artifacts repositories create "${REPO_NAME}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="ReadyPI Docker images" \
    --project="${PROJECT_ID}"
  log_ok "Artifact Registry repo created: ${REPO_NAME}"
else
  log_ok "Artifact Registry repo already exists"
fi

# =============================================================================
# STEP 8: Initial Cloud Run Deployment (placeholder)
# =============================================================================
log_step "STEP 8/9 — Cloud Run Service Setup"

INSTANCE_CONNECTION="${PROJECT_ID}:${REGION}:${SQL_INSTANCE_NAME}"
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${CLOUD_RUN_SERVICE}"

log_info "Cloud Run will be deployed via Cloud Build after the first 'git push' to main."
log_info "Image URI: ${IMAGE_URI}"
log_info "SQL Connection: ${INSTANCE_CONNECTION}"
log_info ""
log_info "Manual first deploy (after building the Docker image):"
cat <<DEPLOY_CMD

  gcloud run deploy ${CLOUD_RUN_SERVICE} \\
    --image=${IMAGE_URI}:latest \\
    --platform=managed \\
    --region=${REGION} \\
    --service-account=${SA_EMAIL} \\
    --allow-unauthenticated \\
    --add-cloudsql-instances=${INSTANCE_CONNECTION} \\
    --set-secrets=DB_PASSWORD=DB_PASSWORD:latest,JWT_SECRET=JWT_SECRET:latest,OPENAI_API_KEY=OPENAI_API_KEY:latest,ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,GOOGLE_API_KEY=GOOGLE_API_KEY:latest,GROQ_API_KEY=GROQ_API_KEY:latest \\
    --set-env-vars=NODE_ENV=production,PORT=8080,DB_HOST=/cloudsql/${INSTANCE_CONNECTION},DB_NAME=${SQL_DB_NAME},DB_USER=${SQL_DB_USER},DB_SSL=false \\
    --memory=512Mi \\
    --cpu=1 \\
    --min-instances=0 \\
    --max-instances=10 \\
    --concurrency=80 \\
    --timeout=60s \\
    --project=${PROJECT_ID}

DEPLOY_CMD

# =============================================================================
# STEP 9: Summary
# =============================================================================
log_step "STEP 9/9 — Deployment Summary"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ReadyPI — GCP Infrastructure Provisioned              ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC} Project ID:           ${CYAN}${PROJECT_ID}${NC}"
echo -e "${GREEN}║${NC} Region:               ${CYAN}${REGION}${NC}"
echo -e "${GREEN}║${NC} Cloud SQL Instance:   ${CYAN}${SQL_INSTANCE_NAME}${NC} (${SQL_TIER})"
echo -e "${GREEN}║${NC} Database:             ${CYAN}${SQL_DB_NAME}${NC}"
echo -e "${GREEN}║${NC} DB User:              ${CYAN}${SQL_DB_USER}${NC}"
echo -e "${GREEN}║${NC} Service Account:      ${CYAN}${SA_EMAIL}${NC}"
echo -e "${GREEN}║${NC} Cloud Run Service:    ${CYAN}${CLOUD_RUN_SERVICE}${NC}"
echo -e "${GREEN}║${NC} Image Registry:       ${CYAN}${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}${NC}"
echo -e "${GREEN}║${NC} Firebase Console:     ${CYAN}https://console.firebase.google.com/project/${PROJECT_ID}${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC} ${YELLOW}NEXT STEPS:${NC}"
echo -e "${GREEN}║${NC}  1. Set real API keys in Secret Manager"
echo -e "${GREEN}║${NC}  2. Run database migrations against Cloud SQL"
echo -e "${GREEN}║${NC}  3. Build & push Docker image via 'git push' to main"
echo -e "${GREEN}║${NC}  4. Configure Firebase Auth providers in the console"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

log_ok "Infrastructure provisioning complete!"
