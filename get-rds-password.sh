#!/bin/bash

# Get RDS credentials from AWS Secrets Manager
# The secret name is usually: rds!cluster-{cluster-id}

echo "🔍 Searching for RDS secrets in AWS Secrets Manager..."
echo ""

# List all secrets related to RDS
aws secretsmanager list-secrets --query "SecretList[?contains(Name, 'database-1')].Name" --output table

echo ""
echo "📋 To get the actual credentials, run:"
echo "aws secretsmanager get-secret-value --secret-id <SECRET_NAME> --query SecretString --output text | jq ."
echo ""
echo "Or use this one-liner to get it directly:"
echo "aws secretsmanager get-secret-value --secret-id rds\!cluster-<ID> --query SecretString --output text | jq -r '.password'"
