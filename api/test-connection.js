require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  console.log('🔍 Testing AWS RDS Connection...\n');
  console.log('Configuration:');
  console.log('  Host:', process.env.DB_HOST);
  console.log('  Port:', process.env.DB_PORT);
  console.log('  User:', process.env.DB_USER);
  console.log('  Database:', process.env.DB_NAME);
  console.log('  SSL:', process.env.DB_SSL);
  console.log('');

  // Test 1: Try connecting to 'readypi' database
  console.log('Test 1: Connecting to "readypi" database...');
  const pool1 = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    const res = await pool1.query('SELECT current_database(), version()');
    console.log('✅ SUCCESS - Connected to:', res.rows[0].current_database);
    console.log('   PostgreSQL:', res.rows[0].version.split('\n')[0]);
    await pool1.end();
    return true;
  } catch (err) {
    console.log('❌ FAILED');
    console.log('   Error Code:', err.code);
    console.log('   Error:', err.message);
    await pool1.end();
  }

  // Test 2: Try connecting to default 'postgres' database
  console.log('\nTest 2: Connecting to default "postgres" database...');
  const pool2 = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    const res = await pool2.query('SELECT current_database(), version()');
    console.log('✅ SUCCESS - Connected to:', res.rows[0].current_database);
    console.log('   PostgreSQL:', res.rows[0].version.split('\n')[0]);
    
    // Check if readypi database exists
    const dbCheck = await pool2.query(
      "SELECT datname FROM pg_database WHERE datname = 'readypi'"
    );
    
    if (dbCheck.rows.length > 0) {
      console.log('   ℹ️  Database "readypi" exists');
    } else {
      console.log('   ⚠️  Database "readypi" does NOT exist - needs to be created');
      console.log('\n📝 To create it, run:');
      console.log('   CREATE DATABASE readypi;');
    }
    
    await pool2.end();
    return true;
  } catch (err) {
    console.log('❌ FAILED');
    console.log('   Error Code:', err.code);
    console.log('   Error:', err.message);
    await pool2.end();
  }

  console.log('\n🛑 DIAGNOSIS:');
  console.log('   Error 28P01 = Password authentication failed');
  console.log('\n   Possible causes:');
  console.log('   1. Wrong password in .env file');
  console.log('   2. Wrong username (check RDS master username)');
  console.log('   3. RDS security group blocking connection');
  console.log('\n   Next steps:');
  console.log('   1. Verify master username in AWS RDS Console');
  console.log('   2. Reset master password if needed');
  console.log('   3. Check security group allows 0.0.0.0/0 on port 5432');
  
  return false;
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
