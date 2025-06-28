#!/usr/bin/env node

/**
 * Apply Character Field Rules Schema
 * 
 * Applies the character field protection rules schema to the database.
 * Run this script to set up the validation system.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://claude:yurikml2@localhost:5432/storyengine';

async function applySchema() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    
    console.log('📖 Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'database', 'character_field_rules.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🚀 Applying character field rules schema...');
    await client.query(schema);
    
    console.log('✅ Schema applied successfully!');
    
    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('character_field_rules', 'character_field_changes')
      ORDER BY table_name;
    `);
    
    console.log('📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    // Check default rules were inserted
    const rulesResult = await client.query('SELECT COUNT(*) as count FROM character_field_rules');
    console.log(`📝 Inserted ${rulesResult.rows[0].count} default protection rules`);
    
    // Show some example rules
    const exampleRules = await client.query(`
      SELECT field_path, protection_level, min_confidence, protection_reason
      FROM character_field_rules 
      ORDER BY priority DESC, field_path 
      LIMIT 5
    `);
    
    console.log('🛡️  Example protection rules:');
    exampleRules.rows.forEach(rule => {
      console.log(`  ${rule.field_path} (${rule.protection_level}, confidence: ${rule.min_confidence})`);
      console.log(`    └── ${rule.protection_reason}`);
    });
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error applying schema:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function checkExisting() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'character_field_rules'
      );
    `);
    
    client.release();
    await pool.end();
    
    return result.rows[0].exists;
    
  } catch (error) {
    console.error('❌ Error checking existing tables:', error);
    await pool.end();
    return false;
  }
}

// Main execution
async function main() {
  console.log('🎭 Character Field Rules Schema Setup');
  console.log('=====================================');
  
  const exists = await checkExisting();
  
  if (exists) {
    console.log('⚠️  Character field rules table already exists.');
    console.log('   This script will add any missing rules and update the schema.');
    console.log('   Existing data will be preserved.');
    console.log('');
  }
  
  await applySchema();
  
  console.log('');
  console.log('🎉 Character field protection system is ready!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Restart your application to use the new validation system');
  console.log('2. Monitor the application logs for validation activity');
  console.log('3. Adjust protection rules in the database as needed');
  console.log('');
  console.log('To view protection rules:');
  console.log('  SELECT * FROM character_field_rules ORDER BY priority DESC;');
  console.log('');
  console.log('To view field changes:');
  console.log('  SELECT * FROM character_field_changes ORDER BY changed_at DESC LIMIT 10;');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applySchema, checkExisting };