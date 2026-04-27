# GET RDS PASSWORD - SIMPLE STEPS

## You need to do this ONE TIME in AWS Console:

### Step 1: Get the Secret Name
1. Open AWS Console
2. Search for "Secrets Manager" in the top search bar
3. Click on "Secrets Manager"
4. Look for a secret named like: `rds!cluster-cul82ke0yunm` or `database-1`
5. Click on that secret name

### Step 2: Get the Password
1. Click "Retrieve secret value" button
2. You'll see JSON like:
   ```json
   {
     "username": "postgres",
     "password": "ACTUAL_PASSWORD_HERE",
     "engine": "postgres",
     "host": "database-1.cluster-cul82ke0yunm.us-east-1.rds.amazonaws.com",
     "port": 5432
   }
   ```
3. Copy the "username" value
4. Copy the "password" value

### Step 3: Update .env File
Open `/Users/ahmedxriyaz/Desktop/ReadyPI/api/.env` and update:
```
DB_USER=<paste username here>
DB_PASSWORD=<paste password here>
```

### Step 4: Tell Me
Just say "updated" and I'll run the migration.

---

## OR EASIER: Give me the JSON
Just copy-paste the entire JSON from Secrets Manager here and I'll update the .env automatically.
