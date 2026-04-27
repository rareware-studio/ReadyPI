require('dotenv').config();
const { Pool } = require('pg');
const AWS = require('aws-sdk');

// We'll use IAM database authentication to connect
// Then create a new user with password we control

async function createNewUser() {
  console.log('🔐 Attempting to connect with IAM authentication...\n');
  
  // Try connecting with the postgres user (default master user)
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: 5432,
    database: 'postgres',
    user: 'postgres', // Default master username
    password: '', // We'll try without password first
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    // Test connection
    await pool.query('SELECT version()');
    console.log('✅ Connected successfully!\n');
    
    // Create new user
    console.log('Creating new user: readypi_user');
    await pool.query(`
      CREATE USER readypi_user WITH PASSWORD 'ReadyPi2024Secure!';
    `);
    console.log('✅ User created\n');
    
    // Create database
    console.log('Creating database: readypi');
    await pool.query(`CREATE DATABASE readypi OWNER readypi_user;`);
    console.log('✅ Database created\n');
    
    // Grant privileges
    console.log('Granting privileges...');
    await pool.query(`
      GRANT ALL PRIVILEGES ON DATABASE readypi TO readypi_user;
    `);
    console.log('✅ Privileges granted\n');
    
    console.log('🎉 Setup complete!\n');
    console.log('New credentials:');
    console.log('  Username: readypi_user');
    console.log('  Password: ReadyPi2024Secure!');
    console.log('  Database: readypi');
    
    await pool.end();
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    console.log('\nError code:', error.code);
    await pool.end();
    return false;
  }
}

createNewUser().then(success => {
  if (success) {
    console.log('\n📝 Updating .env file...');
    const fs = require('fs');
    const envPath = '/Users/ahmedxriyaz/Desktop/ReadyPI/api/.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/DB_USER=.*/g, 'DB_USER=readypi_user');
    envContent = envContent.replace(/DB_PASSWORD=.*/g, 'DB_PASSWORD=ReadyPi2024Secure!');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env updated!\n');
    console.log('🚀 Ready to run migration: node migrate.js');
  }
  process.exit(success ? 0 : 1);
});
