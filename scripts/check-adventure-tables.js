#!/usr/bin/env node

/**
 * Script to check if adventure tables exist in the Supabase database
 * Usage: node scripts/check-adventure-tables.js
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 Checking adventure tables in Supabase database...\n')
  
  const tablesToCheck = [
    'adventures',
    'adventure_messages', 
    'adventure_characters'
  ]
  
  const results = {}
  
  for (const tableName of tablesToCheck) {
    try {
      // Try to query the table with a limit of 0 to check if it exists
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0)
      
      if (error) {
        results[tableName] = { exists: false, error: error.message }
      } else {
        results[tableName] = { exists: true, error: null }
      }
    } catch (err) {
      results[tableName] = { exists: false, error: err.message }
    }
  }
  
  // Display results
  console.log('📊 Table Check Results:')
  console.log('='.repeat(50))
  
  let allTablesExist = true
  
  for (const [tableName, result] of Object.entries(results)) {
    const status = result.exists ? '✅ EXISTS' : '❌ MISSING'
    console.log(`${tableName.padEnd(20)} ${status}`)
    
    if (!result.exists) {
      allTablesExist = false
      console.log(`   Error: ${result.error}`)
    }
  }
  
  console.log('='.repeat(50))
  
  if (allTablesExist) {
    console.log('🎉 All adventure tables exist! You can proceed with development.')
  } else {
    console.log('⚠️  Some tables are missing. You need to run migrations.')
    console.log('\nTo run migrations:')
    console.log('1. supabase db push (if using local development)')
    console.log('2. Or run the SQL migrations manually in your Supabase dashboard')
    console.log('\nMigration files are located in:')
    console.log('- supabase/migrations/20250624000001_create_adventure_tables.sql')
    console.log('- supabase/migrations/20250624000002_add_adventure_rls_policies.sql')
  }
  
  // Also check if other required tables exist (characters, locations)
  console.log('\n🔍 Checking dependency tables...')
  
  const dependencyTables = ['characters', 'locations']
  
  for (const tableName of dependencyTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0)
      
      const status = error ? '❌ MISSING' : '✅ EXISTS'
      console.log(`${tableName.padEnd(20)} ${status}`)
      
      if (error && !allTablesExist) {
        console.log(`   Note: ${tableName} table is also needed for adventures`)
      }
    } catch (err) {
      console.log(`${tableName.padEnd(20)} ❌ MISSING`)
    }
  }
}

checkTables().catch(console.error)