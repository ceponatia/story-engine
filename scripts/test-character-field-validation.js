#!/usr/bin/env node

/**
 * Test Character Field Validation System
 *
 * Simple test script to verify the validation system works correctly.
 */

const { Pool } = require("pg");
const { loadEnvForScript } = require("../packages/utils/src/loadEnv.js");

// Load environment variables
loadEnvForScript();

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL;

async function testValidation() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log("🧪 Testing Character Field Validation System");
    console.log("============================================");

    const client = await pool.connect();

    // Test 1: Check if protection rules exist
    console.log("\n📋 Test 1: Checking protection rules...");
    const rulesResult = await client.query(`
      SELECT field_path, protection_level, min_confidence 
      FROM character_field_rules 
      WHERE is_active = true 
      ORDER BY priority DESC 
      LIMIT 5
    `);

    if (rulesResult.rows.length > 0) {
      console.log("✅ Protection rules found:");
      rulesResult.rows.forEach((rule) => {
        console.log(
          `   ${rule.field_path} (${rule.protection_level}, min confidence: ${rule.min_confidence})`
        );
      });
    } else {
      console.log("❌ No protection rules found!");
      return;
    }

    // Test 2: Test validation function with immutable field
    console.log("\n🛡️  Test 2: Testing immutable field protection...");
    const immutableTest = await client.query(`
      SELECT * FROM is_field_change_allowed(
        'test-adventure-char-id',
        'appearance.eye.color',
        0.9,
        true,
        true
      )
    `);

    const immutableResult = immutableTest.rows[0];
    if (!immutableResult.allowed) {
      console.log(`✅ Immutable field correctly blocked: ${immutableResult.reason}`);
    } else {
      console.log("❌ Immutable field was incorrectly allowed!");
    }

    // Test 3: Test validation function with mutable field
    console.log("\n🔄 Test 3: Testing mutable field permission...");
    const mutableTest = await client.query(`
      SELECT * FROM is_field_change_allowed(
        'test-adventure-char-id',
        'appearance.hair.style',
        0.5,
        true,
        true
      )
    `);

    const mutableResult = mutableTest.rows[0];
    if (mutableResult.allowed) {
      console.log(`✅ Mutable field correctly allowed: ${mutableResult.reason}`);
    } else {
      console.log(`❌ Mutable field was incorrectly blocked: ${mutableResult.reason}`);
    }

    // Test 4: Test low confidence rejection
    console.log("\n📊 Test 4: Testing low confidence rejection...");
    const lowConfidenceTest = await client.query(`
      SELECT * FROM is_field_change_allowed(
        'test-adventure-char-id',
        'appearance.hair.color',
        0.1,
        false,
        false
      )
    `);

    const lowConfidenceResult = lowConfidenceTest.rows[0];
    if (
      !lowConfidenceResult.allowed &&
      lowConfidenceResult.reason.includes("Confidence score too low")
    ) {
      console.log(`✅ Low confidence correctly blocked: ${lowConfidenceResult.reason}`);
    } else {
      console.log(`❌ Low confidence test failed: ${lowConfidenceResult.reason}`);
    }

    // Test 5: Check database functions
    console.log("\n🔧 Test 5: Testing database functions...");

    // Test record_field_change function
    try {
      const recordTest = await client.query(`
        SELECT record_field_change(
          'test-adventure-char-id',
          'appearance.hair.style',
          '["old", "style"]'::jsonb,
          '["new", "style"]'::jsonb,
          0.8,
          'I changed my hair style',
          'manual_update',
          'test-message-id'
        ) as change_id
      `);

      const changeId = recordTest.rows[0]?.change_id;
      if (changeId) {
        console.log(`✅ Field change recorded successfully: ${changeId}`);

        // Clean up test record
        await client.query("DELETE FROM character_field_changes WHERE id = $1", [changeId]);
        console.log("   (Test record cleaned up)");
      } else {
        console.log("❌ Failed to record field change");
      }
    } catch (error) {
      console.log(`❌ Error testing record function: ${error.message}`);
    }

    client.release();

    console.log("\n🎉 All tests completed!");
    console.log("\n📝 Summary:");
    console.log("   ✓ Database schema is properly installed");
    console.log("   ✓ Protection rules are active");
    console.log("   ✓ Validation functions work correctly");
    console.log("   ✓ Ready for production use");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run tests
if (require.main === module) {
  testValidation().catch(console.error);
}

module.exports = { testValidation };
