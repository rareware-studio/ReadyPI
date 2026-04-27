#!/bin/bash

# Modify RDS instance to use self-managed password
# This changes from AWS Secrets Manager to manual password management

echo "🔧 Modifying RDS instance to use self-managed password..."
echo ""

NEW_PASSWORD="ReadyPi2024Secure!"

aws rds modify-db-instance \
  --db-instance-identifier database-1-instance-1 \
  --master-user-password "$NEW_PASSWORD" \
  --apply-immediately \
  --region us-east-1

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ RDS modification initiated successfully!"
  echo ""
  echo "⏳ Wait 2-3 minutes for the change to apply..."
  echo ""
  echo "📝 New credentials:"
  echo "   Username: postgres (or readypi_admin)"
  echo "   Password: $NEW_PASSWORD"
  echo ""
  echo "🔄 Updating .env file..."
  
  # Update .env file
  cd /Users/ahmedxriyaz/Desktop/ReadyPI/api
  sed -i '' "s/^DB_PASSWORD=.*/DB_PASSWORD=$NEW_PASSWORD/" .env
  
  echo "✅ .env file updated!"
  echo ""
  echo "⏰ In 3 minutes, run: cd /Users/ahmedxriyaz/Desktop/ReadyPI/api && node migrate.js"
else
  echo ""
  echo "❌ Failed to modify RDS instance"
  echo ""
  echo "Possible reasons:"
  echo "1. AWS CLI not configured with correct permissions"
  echo "2. Instance identifier is wrong"
  echo "3. Instance is already being modified"
  echo ""
  echo "Manual steps:"
  echo "1. Go to RDS Console → database-1 → Modify"
  echo "2. Change to 'Self managed' password"
  echo "3. Set password: $NEW_PASSWORD"
  echo "4. Apply immediately"
fi
