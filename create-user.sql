-- RUN THESE COMMANDS IN RDS QUERY EDITOR
-- Go to: RDS Console → Query Editor → Connect to database-1

-- Step 1: Create new user with password
CREATE USER readypi_user WITH PASSWORD 'ReadyPi2024Secure!';

-- Step 2: Create database
CREATE DATABASE readypi OWNER readypi_user;

-- Step 3: Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE readypi TO readypi_user;

-- Step 4: Verify
\du

-- Done! Now use these credentials:
-- Username: readypi_user
-- Password: ReadyPi2024Secure!
-- Database: readypi
