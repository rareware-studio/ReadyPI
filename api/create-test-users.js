require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Use the credentials from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function createTestUsers() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to database...');
    
    // Test user 1
    const email1 = `testuser_${crypto.randomBytes(4).toString('hex')}@example.com`;
    const password1Raw = crypto.randomBytes(8).toString('hex');
    const passwordHash1 = await bcrypt.hash(password1Raw, 12);
    
    // Test user 2
    const email2 = `testuser_${crypto.randomBytes(4).toString('hex')}@example.com`;
    const password2Raw = crypto.randomBytes(8).toString('hex');
    const passwordHash2 = await bcrypt.hash(password2Raw, 12);

    console.log('📦 Inserting users...');
    
    // Create users
    const res1 = await client.query(
      `INSERT INTO users (email, password_hash, full_name, plan_tier)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email`,
      [email1, passwordHash1, 'Test User 1', 'free']
    );
    
    const res2 = await client.query(
      `INSERT INTO users (email, password_hash, full_name, plan_tier)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email`,
      [email2, passwordHash2, 'Test User 2', 'free']
    );

    console.log('\n✅ Successfully created 2 test users!\n');
    console.log('--- User 1 ---');
    console.log(`ID (DB):   ${res1.rows[0].id}`);
    console.log(`Email:     ${res1.rows[0].email}`);
    console.log(`Password:  ${password1Raw}`);
    
    console.log('\n--- User 2 ---');
    console.log(`ID (DB):   ${res2.rows[0].id}`);
    console.log(`Email:     ${res2.rows[0].email}`);
    console.log(`Password:  ${password2Raw}`);
    
  } catch (error) {
    console.error('❌ Failed:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createTestUsers();
