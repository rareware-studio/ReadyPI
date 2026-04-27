#!/bin/bash

echo "🚀 Quick Setup for GCP Secrets & API Keys"
echo "----------------------------------------"

PROJECT_ID="readypi-core"

# Function to safely create a secret and add a version
create_secret() {
    local SECRET_NAME=$1
    local SECRET_VALUE=$2
    
    echo "Creating secret: $SECRET_NAME..."
    # Create the secret if it doesn't exist
    gcloud secrets create "$SECRET_NAME" \
        --replication-policy="automatic" \
        --project="$PROJECT_ID" 2>/dev/null || true
        
    # Add the value
    echo -n "$SECRET_VALUE" | gcloud secrets versions add "$SECRET_NAME" \
        --data-file=- \
        --project="$PROJECT_ID"
        
    echo "✅ $SECRET_NAME configured."
}

# Prompt user for keys
echo "Please enter your API keys (leave blank to skip if you don't have it yet):"

read -p "OPENAI_API_KEY: " OPENAI_KEY
if [ ! -z "$OPENAI_KEY" ]; then create_secret "OPENAI_API_KEY" "$OPENAI_KEY"; fi

read -p "GROQ_API_KEY: " GROQ_KEY
if [ ! -z "$GROQ_KEY" ]; then create_secret "GROQ_API_KEY" "$GROQ_KEY"; fi

read -p "GOOGLE_API_KEY (Gemini): " GOOGLE_KEY
if [ ! -z "$GOOGLE_KEY" ]; then create_secret "GOOGLE_API_KEY" "$GOOGLE_KEY"; fi

read -p "ANTHROPIC_API_KEY: " ANTHROPIC_KEY
if [ ! -z "$ANTHROPIC_KEY" ]; then create_secret "ANTHROPIC_API_KEY" "$ANTHROPIC_KEY"; fi

echo ""
echo "🎉 All provided secrets have been securely stored in GCP Secret Manager!"
echo "Your Cloud Run backend will now automatically use them."
