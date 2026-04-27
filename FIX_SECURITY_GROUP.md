# FIX RDS CONNECTION - 2 THINGS TO CHECK

## Issue: Connection timeout means security group is blocking us

## Fix 1: Enable IAM Database Authentication

1. Go to RDS Console → Databases → database-1
2. Click "Modify"
3. Scroll to "Additional credentials settings"
4. Check ✅ "IAM database authentication"
5. Continue → Apply immediately → Modify

## Fix 2: Open Security Group (CRITICAL)

1. In RDS Console, click on "database-1"
2. Go to "Connectivity & security" tab
3. Under "Security", click on the security group link (looks like: sg-xxxxx)
4. Click "Edit inbound rules"
5. Click "Add rule"
6. Set:
   - Type: PostgreSQL
   - Port: 5432
   - Source: My IP (or 0.0.0.0/0 for testing)
7. Click "Save rules"

## After both fixes:

Just type "ready" and I'll automatically:
1. Connect with IAM auth
2. Create readypi_user with password
3. Create readypi database
4. Update .env file
5. Run migration
6. Verify all tables

---

## Quick check - Is your IP allowed?

Your current IP needs to be in the security group inbound rules.
The security group is blocking port 5432 from your machine.
