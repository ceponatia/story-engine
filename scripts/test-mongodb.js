#!/usr/bin/env node
// Test MongoDB connectivity and verify collections

const { MongoManager } = require("../lib/postgres/mongodb.ts");

async function testMongoDB() {
  console.log("🧪 Testing MongoDB connectivity...");

  try {
    // Test connection
    const connected = await MongoManager.testConnection();
    if (!connected) {
      console.error("❌ MongoDB connection failed");
      process.exit(1);
    }
    console.log("✅ MongoDB connection successful");

    // Test template retrieval
    console.log("\n📄 Testing template retrieval...");
    const romanceTemplate = await MongoManager.getTemplate("romance");
    console.log("Romance template found:", !!romanceTemplate);
    if (romanceTemplate) {
      console.log("  Type:", romanceTemplate.type);
      console.log("  Label:", romanceTemplate.metadata.label);
      console.log("  Version:", romanceTemplate.metadata.version);
      console.log("  Content length:", romanceTemplate.content.length, "chars");
    }

    const actionTemplate = await MongoManager.getTemplate("action");
    console.log("Action template found:", !!actionTemplate);

    const generalTemplate = await MongoManager.getTemplate("general");
    console.log("General template found:", !!generalTemplate);

    // Test list templates
    console.log("\n📋 Testing template listing...");
    const allTemplates = await MongoManager.listTemplates({ isPublic: true });
    console.log("Public templates found:", allTemplates.length);
    allTemplates.forEach((t) => {
      console.log(`  - ${t.type} (${t.metadata.label}) v${t.metadata.version}`);
    });

    // Test adventure configs
    console.log("\n⚙️ Testing adventure configs...");
    const romanceConfig = await MongoManager.getAdventureConfig("romance_standard");
    console.log("Romance config found:", !!romanceConfig);
    if (romanceConfig) {
      console.log("  Context window:", romanceConfig.config.context_window);
      console.log("  Emotional intensity:", romanceConfig.config.emotional_intensity);
    }

    // Test database stats
    console.log("\n📊 Database statistics...");
    const stats = await MongoManager.getStats();
    if (stats) {
      console.log("Collections:");
      Object.entries(stats.collections).forEach(([name, info]) => {
        console.log(`  - ${name}: ${info.documentCount} documents`);
      });
    }

    console.log("\n🎉 All MongoDB tests passed!");
  } catch (error) {
    console.error("❌ MongoDB test failed:", error);
    process.exit(1);
  } finally {
    await MongoManager.forceShutdown();
  }
}

testMongoDB();
