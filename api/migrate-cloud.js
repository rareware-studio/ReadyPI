/**
 * Cloud SQL Schema Migration Script
 * Reads database/schema.sql and executes it against the Cloud SQL instance.
 */
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function migrate() {
  console.log('🔌 Connecting to Cloud SQL...');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   User: ${process.env.DB_USER}`);

  const client = await pool.connect();

  try {
    // Test connection
    const res = await client.query('SELECT NOW()');
    console.log(`✅ Connected! Server time: ${res.rows[0].now}`);

    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // Remove the final COMMIT since we're not in an explicit transaction block
    schema = schema.replace(/^COMMIT;\s*$/m, '');

    console.log('📦 Applying schema...');

    // Split by semicolons but respect $$ blocks (for functions)
    // We'll execute the whole thing as one statement block
    await client.query(schema);

    console.log('✅ Schema applied successfully!');

    // Verify tables were created
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('\n📊 Tables created:');
    tables.rows.forEach(r => console.log(`   ✓ ${r.table_name}`));

    // Verify model pricing data
    const models = await client.query('SELECT COUNT(*) as count FROM model_pricing');
    console.log(`\n🤖 Model pricing entries: ${models.rows[0].count}`);

    console.log('\n🎉 Migration complete! ReadyPI database is ready.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // If tables already exist, that's okay
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Some tables already exist. Checking current state...');
      
      const tables = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      console.log('\n📊 Existing tables:');
      tables.rows.forEach(r => console.log(`   ✓ ${r.table_name}`));
      
      if (tables.rows.length >= 7) {
        console.log('\n✅ Database looks good! All required tables exist.');
      }
    } else {
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
