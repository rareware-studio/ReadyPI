require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Support both DATABASE_URL and individual env vars
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to Neon PostgreSQL...');
    
    // Test connection
    const timeResult = await client.query('SELECT NOW()');
    console.log('✅ Connected! Server time:', timeResult.rows[0].now);

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove trailing COMMIT if there's no matching BEGIN
    schema = schema.replace(/\nCOMMIT;\s*$/, '');

    console.log('📦 Running schema migration...');
    await client.query(schema);
    console.log('✅ Schema migration completed!');

    // Verify tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log('\n📋 Tables created:');
    tables.rows.forEach((r, i) => console.log(`   ${i + 1}. ${r.table_name}`));

    // Verify model pricing seed data
    const models = await client.query('SELECT model_name, display_name, provider FROM model_pricing ORDER BY cost_per_1m_tokens_bdt');
    console.log('\n🤖 AI Models seeded:');
    models.rows.forEach(r => console.log(`   • ${r.display_name} (${r.provider}) → ${r.model_name}`));

    console.log('\n🎉 ReadyPi database is LIVE on Neon!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.position) {
      console.error('   At position:', error.position);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
