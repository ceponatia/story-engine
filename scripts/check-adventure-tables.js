#!/usr/bin/env node

/**
 * Script to check if adventure tables exist in the PostgreSQL database
 * Usage: node scripts/check-adventure-tables.js
 */

// TODO: Replace with PostgreSQL connection
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ Missing DATABASE_URL environment variable");
  console.error("Make sure DATABASE_URL is set in .env.local");
  process.exit(1);
}

// TODO: Initialize PostgreSQL connection
const db = null; // Placeholder for PostgreSQL client

async function checkTables() {
  console.log("🔍 Checking adventure tables in PostgreSQL database...\n");

  const tablesToCheck = ["adventures", "adventure_messages", "adventure_characters"];

  const results = {};

  for (const tableName of tablesToCheck) {
    try {
      // TODO: Replace with PostgreSQL query to check if table exists
      // Example: SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tableName')

      // Placeholder logic - mark all as missing since we don't have real DB connection
      results[tableName] = { exists: false, error: "PostgreSQL connection not implemented" };
    } catch (err) {
      results[tableName] = { exists: false, error: err.message };
    }
  }

  // Display results
  console.log("📊 Table Check Results:");
  console.log("=".repeat(50));

  let allTablesExist = true;

  for (const [tableName, result] of Object.entries(results)) {
    const status = result.exists ? "✅ EXISTS" : "❌ MISSING";
    console.log(`${tableName.padEnd(20)} ${status}`);

    if (!result.exists) {
      allTablesExist = false;
      console.log(`   Error: ${result.error}`);
    }
  }

  console.log("=".repeat(50));

  if (allTablesExist) {
    console.log("🎉 All adventure tables exist! You can proceed with development.");
  } else {
    console.log("⚠️  Some tables are missing. You need to run migrations.");
    console.log("\nTo run migrations:");
    console.log("1. Use your PostgreSQL migration tool (e.g., psql, pgAdmin)");
    console.log("2. Or run the SQL migrations manually in your database");
    console.log("\nMigration files are located in:");
    console.log("- database/migrations/create_adventure_tables.sql");
    console.log("- database/migrations/add_adventure_policies.sql");
  }

  // Also check if other required tables exist (characters, locations)
  console.log("\n🔍 Checking dependency tables...");

  const dependencyTables = ["characters", "locations"];

  for (const tableName of dependencyTables) {
    try {
      // TODO: Replace with PostgreSQL query
      const status = "❌ MISSING"; // Placeholder
      console.log(`${tableName.padEnd(20)} ${status}`);

      if (!allTablesExist) {
        console.log(`   Note: ${tableName} table is also needed for adventures`);
      }
    } catch (err) {
      console.log(`${tableName.padEnd(20)} ❌ MISSING`);
    }
  }
}

checkTables().catch(console.error);
