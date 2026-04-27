# USE RDS QUERY EDITOR - BYPASSES ALL SECURITY ISSUES

## Step 1: Open Query Editor
Go to: https://us-east-1.console.aws.amazon.com/rds/home?region=us-east-1#query-editor:

## Step 2: Connect to Database
- Click "Connect to database"
- Choose: database-1
- Database name: postgres
- Authentication: Connect with Secrets Manager (it will auto-select the secret)
- Click "Connect"

## Step 3: Run These SQL Commands (one by one)

```sql
-- 1. Create user
CREATE USER readypi_user WITH PASSWORD 'ReadyPi2024Secure!' CREATEDB;
```

Click "Run" and wait for success ✅

```sql
-- 2. Create database
CREATE DATABASE readypi OWNER readypi_user;
```

Click "Run" and wait for success ✅

```sql
-- 3. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE readypi TO readypi_user;
```

Click "Run" and wait for success ✅

```sql
-- 4. Verify (optional)
SELECT usename FROM pg_user WHERE usename = 'readypi_user';
```

Should show: readypi_user

## Step 4: Tell Me
Type "done" and I'll:
1. Update .env with new credentials
2. Test connection from local machine
3. Run migration
4. Verify all tables

---

**This is the easiest way - Query Editor works from AWS Console, no security group needed!**
