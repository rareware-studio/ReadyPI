const { Pool } = require('pg');
const { execSync } = require('child_process');

async function setupDatabase() {
  console.log('🔐 Generating IAM authentication token...\n');
  
  const RDSHOST = 'database-1.cluster-cul82ke0yunm.us-east-1.rds.amazonaws.com';
  
  // Generate IAM token
  const token = execSync(
    `aws rds generate-db-auth-token --hostname ${RDSHOST} --port 5432 --username postgres --region us-east-1`,
    { encoding: 'utf8' }
  ).trim();
  
  console.log('✅ Token generated\n');
  console.log('🔌 Connecting to RDS with IAM authentication...\n');
  
  const pool = new Pool({
    host: RDSHOST,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: token,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    // Test connection
    const versionResult = await pool.query('SELECT version()');
    console.log('✅ Connected successfully!\n');
    console.log('PostgreSQL:', versionResult.rows[0].version.split('\n')[0], '\n');
    
    // Check if user exists
    const userCheck = await pool.query(
      "SELECT 1 FROM pg_roles WHERE rolname = 'readypi_user'"
    );
    
    if (userCheck.rows.length > 0) {
      console.log('⚠️  User readypi_user already exists, dropping...');
      await pool.query('DROP USER IF EXISTS readypi_user CASCADE');
    }
    
    // Create new user
    console.log('👤 Creating user: readypi_user');
    await pool.query(`
      CREATE USER readypi_user WITH PASSWORD 'ReadyPi2024Secure!' CREATEDB;
    `);
    console.log('✅ User created\n');
    
    // Check if database exists
    const dbCheck = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'readypi'"
    );
    
    if (dbCheck.rows.length > 0) {
      console.log('⚠️  Database readypi already exists, dropping...');
      await pool.query('DROP DATABASE IF EXISTS readypi');
    }
    
    // Create database
    console.log('🗄️  Creating database: readypi');
    await pool.query(`CREATE DATABASE readypi OWNER readypi_user`);
    console.log('✅ Database created\n');
    
    // Grant privileges
    console.log('🔑 Granting privileges...');
    await pool.query(`GRANT ALL PRIVILEGES ON DATABASE readypi TO readypi_user`);
    console.log('✅ Privileges granted\n');
    
    console.log('🎉 Setup complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('New credentials:');
    console.log('  Username: readypi_user');
    console.log('  Password: ReadyPi2024Secure!');
    console.log('  Database: readypi');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await pool.end();
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    console.log('Error code:', error.code);
    await pool.end();
    return false;
  }
}

setupDatabase().then(success => {
  if (success) {
    console.log('📝 Updating .env file...');
    const fs = require('fs');
    const envPath = '/Users/ahmedxriyaz/Desktop/ReadyPI/api/.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/DB_USER=.*/g, 'DB_USER=readypi_user');
    envContent = envContent.replace(/DB_PASSWORD=.*/g, 'DB_PASSWORD=ReadyPi2024Secure!');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env updated!\n');
    console.log('🚀 Next: Running migration...\n');
    
    // Run migration
    require('./migrate.js');
  } else {
    process.exit(1);
  }
});
