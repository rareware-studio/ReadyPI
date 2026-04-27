#!/bin/bash
# =============================================================================
# ReadyPI — GCP Backend Deployment Script (Security-Hardened)
# =============================================================================
# Deploys the Express API backend to Cloud Run with:
#   - Dedicated service account (least privilege)
#   - All secrets managed via Secret Manager
#   - Cloud SQL PostgreSQL with secure credentials
#   - Docker build scoped to api/ directory
#
# Usage:
#   chmod +x setup_gcp.sh && ./setup_gcp.sh
#
# Override defaults via environment variables:
#   ANTHROPIC_API_KEY="sk-ant-..." ./setup_gcp.sh
# =============================================================================

set -euo pipefail

# ── Fix macOS sandbox: use workspace-local gcloud config ─────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export CLOUDSDK_PYTHON=/usr/local/bin/python3.13
export CLOUDSDK_CONFIG="${SCRIPT_DIR}/.gcloud-config"
export PATH="${SCRIPT_DIR}/exec -l /bin/zsh/google-cloud-sdk/bin:${PATH}"
mkdir -p "${CLOUDSDK_CONFIG}/configurations" 2>/dev/null || true
[ -f "${CLOUDSDK_CONFIG}/active_config" ] || printf "default" > "${CLOUDSDK_CONFIG}/active_config"
touch "${CLOUDSDK_CONFIG}/configurations/config_default" 2>/dev/null || true

# ── Configuration ────────────────────────────────────────────────────────────
PROJECT_ID="${GCP_PROJECT_ID:-readypi-core}"
REGION="${GCP_REGION:-asia-southeast1}"
SERVICE_ACCOUNT_NAME="readypi-api-sa"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
SQL_INSTANCE="readypi-db"
SQL_DB="readypi"
INSTANCE_CONNECTION="${PROJECT_ID}:${REGION}:${SQL_INSTANCE}"

# ── Auto-generate secure credentials if not provided via env ─────────────────
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-PLACEHOLDER_SET_VIA_SECRET_MANAGER}"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 48 | tr -d '/+=' | head -c 64)}"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   ReadyPI — GCP Backend Deployment                  ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║ Project:  ${PROJECT_ID}"
echo "║ Region:   ${REGION}"
echo "║ SA:       ${SERVICE_ACCOUNT_EMAIL}"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# =============================================================================
# STEP 1: Enable required APIs
# =============================================================================
echo "▸ [1/9] Enabling required services..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  sqladmin.googleapis.com \
  iam.googleapis.com \
  containerregistry.googleapis.com \
  --project="${PROJECT_ID}"
echo "  ✓ APIs enabled"

# =============================================================================
# STEP 2: Create dedicated service account (NOT the default compute SA)
# =============================================================================
echo "▸ [2/9] Creating dedicated Service Account..."
gcloud iam service-accounts create "${SERVICE_ACCOUNT_NAME}" \
  --display-name="ReadyPI API Service Account" \
  --description="Dedicated least-privilege SA for ReadyPI Cloud Run" \
  --project="${PROJECT_ID}" 2>/dev/null || echo "  ℹ Service account already exists"
echo "  ✓ SA: ${SERVICE_ACCOUNT_EMAIL}"

# =============================================================================
# STEP 3: Store ALL secrets in Secret Manager
# =============================================================================
echo "▸ [3/9] Storing secrets in Secret Manager..."

store_secret() {
  local name="$1"
  local value="$2"
  if gcloud secrets describe "${name}" --project="${PROJECT_ID}" &>/dev/null; then
    echo -n "${value}" | gcloud secrets versions add "${name}" \
      --data-file=- --project="${PROJECT_ID}" 2>/dev/null
    echo "  ✓ Updated: ${name}"
  else
    echo -n "${value}" | gcloud secrets create "${name}" \
      --data-file=- \
      --replication-policy=automatic \
      --project="${PROJECT_ID}"
    echo "  ✓ Created: ${name}"
  fi
}

store_secret "ANTHROPIC_API_KEY" "${ANTHROPIC_API_KEY}"
store_secret "DB_PASSWORD" "${DB_PASSWORD}"
store_secret "JWT_SECRET" "${JWT_SECRET}"

# =============================================================================
# STEP 4: Provision Cloud SQL (PostgreSQL 15)
# =============================================================================
echo "▸ [4/9] Creating Cloud SQL (PostgreSQL 15)..."
gcloud sql instances create "${SQL_INSTANCE}" \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region="${REGION}" \
  --storage-type=SSD \
  --storage-size=10GB \
  --backup-start-time="03:00" \
  --project="${PROJECT_ID}" 2>/dev/null || echo "  ℹ Instance already exists"

gcloud sql databases create "${SQL_DB}" \
  --instance="${SQL_INSTANCE}" \
  --project="${PROJECT_ID}" 2>/dev/null || echo "  ℹ Database already exists"

gcloud sql users set-password postgres \
  --instance="${SQL_INSTANCE}" \
  --password="${DB_PASSWORD}" \
  --project="${PROJECT_ID}"
echo "  ✓ Cloud SQL ready"

# =============================================================================
# STEP 5: Create Firestore database
# =============================================================================
echo "▸ [5/9] Creating Firestore database..."
gcloud firestore databases create \
  --location="${REGION}" \
  --project="${PROJECT_ID}" 2>/dev/null || echo "  ℹ Firestore already exists"

# =============================================================================
# STEP 6: Bind IAM roles to the DEDICATED service account
# =============================================================================
echo "▸ [6/9] Granting least-privilege IAM roles..."

# Secret Manager access — per-secret binding
for SECRET in ANTHROPIC_API_KEY DB_PASSWORD JWT_SECRET; do
  gcloud secrets add-iam-policy-binding "${SECRET}" \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/secretmanager.secretAccessor" \
    --project="${PROJECT_ID}" --quiet 2>/dev/null || true
done
echo "  ✓ Secret accessor granted"

# Cloud SQL client
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/cloudsql.client" \
  --quiet 2>/dev/null || true
echo "  ✓ Cloud SQL client granted"

# Firestore (Datastore User)
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/datastore.user" \
  --quiet 2>/dev/null || true
echo "  ✓ Datastore user granted"

# Cloud Logging
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/logging.logWriter" \
  --quiet 2>/dev/null || true
echo "  ✓ Log writer granted"

# =============================================================================
# STEP 7: Build Docker image from api/ directory
# =============================================================================
echo "▸ [7/9] Building Docker image from api/ directory..."
gcloud builds submit \
  --tag "gcr.io/${PROJECT_ID}/readypi-api" \
  --project="${PROJECT_ID}" \
  ./api/
echo "  ✓ Image built and pushed"

# =============================================================================
# STEP 8: Deploy to Cloud Run with dedicated SA + all secrets mounted
# =============================================================================
echo "▸ [8/9] Deploying to Cloud Run..."
gcloud run deploy readypi-api \
  --image "gcr.io/${PROJECT_ID}/readypi-api" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --service-account "${SERVICE_ACCOUNT_EMAIL}" \
  --add-cloudsql-instances "${INSTANCE_CONNECTION}" \
  --set-secrets "ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,DB_PASSWORD=DB_PASSWORD:latest,JWT_SECRET=JWT_SECRET:latest" \
  --set-env-vars "NODE_ENV=production,DB_NAME=${SQL_DB},DB_USER=postgres,DB_HOST=/cloudsql/${INSTANCE_CONNECTION},DB_SSL=false,INSTANCE_CONNECTION_NAME=${INSTANCE_CONNECTION}" \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --concurrency=80 \
  --timeout=60s \
  --project="${PROJECT_ID}"
echo "  ✓ Deployed to Cloud Run"

# =============================================================================
# STEP 9: Verify deployment
# =============================================================================
echo "▸ [9/9] Verifying deployment..."
LIVE_URL=$(gcloud run services describe readypi-api \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format='value(status.url)')

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   ✓ DEPLOYMENT COMPLETE                             ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║ Live URL:  ${LIVE_URL}"
echo "║ Health:    ${LIVE_URL}/health"
echo "║ SA:        ${SERVICE_ACCOUNT_EMAIL}"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "To update API keys later:"
echo "  echo -n 'sk-ant-...' | gcloud secrets versions add ANTHROPIC_API_KEY --data-file=- --project=${PROJECT_ID}"
