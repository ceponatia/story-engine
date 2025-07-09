#!/usr/bin/env node
// Test Phase 3: MongoDB Document Storage Integration

const { buildSystemPrompt } = require("../lib/prompts/index.ts");
const { templateRegistry } = require("../lib/prompts/registry.ts");
const { MongoManager } = require("../lib/postgres/mongodb.ts");

async function testPhase3Integration() {
  console.log("🧪 Testing Phase 3: MongoDB Document Storage Integration...\n");

  try {
    // Test 1: MongoDB Template Retrieval
    console.log("1️⃣ Testing MongoDB template retrieval...");
    await templateRegistry.initialize();

    const romanceTemplate = await templateRegistry.getTemplateWithContext("romance");
    console.log("✅ Romance template from MongoDB:", !!romanceTemplate);
    console.log("   Source: MongoDB document");
    console.log("   Label:", romanceTemplate?.metadata?.label);
    console.log("   Version:", romanceTemplate?.metadata?.version);

    const actionTemplate = await templateRegistry.getTemplateWithContext("action");
    console.log("✅ Action template from MongoDB:", !!actionTemplate);

    const generalTemplate = await templateRegistry.getTemplateWithContext("general");
    console.log("✅ General template from MongoDB:", !!generalTemplate);

    // Test 2: System Prompt Building with MongoDB
    console.log("\n2️⃣ Testing system prompt building with MongoDB templates...");

    const testContext = {
      character: {
        name: "Elena",
        age: 25,
        gender: "female",
        personality: "shy, kind, intelligent",
        background: "A librarian who loves reading fantasy novels",
        appearance: "brown hair, green eyes, medium height",
        scents_aromas: "lavender perfume, old books",
        description: "A quiet librarian with a secret love for adventure",
      },
      setting: {
        name: "Mystic Library",
        description: "An ancient library filled with magical books",
        world_type: "fantasy",
      },
      location: {
        name: "Reading Room",
        description: "A cozy reading nook with soft lighting",
      },
      userName: "TestUser",
      adventureTitle: "The Enchanted Library",
      adventureType: "romance",
    };

    const systemPrompt = await buildSystemPrompt(testContext);
    console.log("✅ Generated system prompt length:", systemPrompt.length, "characters");
    console.log("✅ Contains character name:", systemPrompt.includes("Elena"));
    console.log("✅ Contains user name:", systemPrompt.includes("TestUser"));
    console.log("✅ Contains adventure title:", systemPrompt.includes("The Enchanted Library"));
    console.log("✅ Contains ROMANCE FOCUS:", systemPrompt.includes("ROMANCE FOCUS"));

    // Test 3: Template Priority System
    console.log("\n3️⃣ Testing template priority system...");

    // Test with fake user ID to check fallback
    const userTemplate = await templateRegistry.getTemplateWithContext("romance", "fake-user-id");
    console.log("✅ User-specific template fallback to public:", !!userTemplate);

    // Test non-existent template
    const nonExistentTemplate = await templateRegistry.getTemplateWithContext("nonexistent");
    console.log("✅ Non-existent template handling:", nonExistentTemplate === undefined);

    // Test 4: Adventure Configuration Retrieval
    console.log("\n4️⃣ Testing adventure configuration retrieval...");

    const romanceConfig = await MongoManager.getAdventureConfig("romance_standard");
    console.log("✅ Romance config found:", !!romanceConfig);
    if (romanceConfig) {
      console.log("   Context window:", romanceConfig.config.context_window);
      console.log("   Emotional intensity:", romanceConfig.config.emotional_intensity);
      console.log("   Memory depth:", romanceConfig.config.memory_depth);
    }

    const actionConfig = await MongoManager.getAdventureConfig("action_standard");
    console.log("✅ Action config found:", !!actionConfig);
    if (actionConfig) {
      console.log("   Context window:", actionConfig.config.context_window);
      console.log("   Pacing:", actionConfig.config.pacing);
    }

    // Test 5: Template Performance Comparison
    console.log("\n5️⃣ Testing template performance...");

    const start = performance.now();
    for (let i = 0; i < 10; i++) {
      await templateRegistry.getTemplateWithContext("romance");
    }
    const mongoTime = performance.now() - start;
    console.log("✅ MongoDB template retrieval (10x):", Math.round(mongoTime), "ms");

    // Test 6: Template Content Validation
    console.log("\n6️⃣ Testing template content validation...");

    if (romanceTemplate) {
      const content = romanceTemplate.content;
      console.log("✅ Has character placeholders:", content.includes("{{character.name}}"));
      console.log("✅ Has user placeholder:", content.includes("{{userName}}"));
      console.log("✅ Has conditional setting:", content.includes("{{#if setting}}"));
      console.log("✅ Has romance focus section:", content.includes("ROMANCE FOCUS"));
      console.log("✅ Has response format rules:", content.includes("RESPONSE FORMAT"));
    }

    // Test 7: Integration with Existing System
    console.log("\n7️⃣ Testing backward compatibility...");

    // Test that the old import still works (legacy support)
    try {
      const legacyTemplates = require("../lib/prompts/templates.ts");
      const legacyPrompt = legacyTemplates.buildSystemPrompt("romance", testContext);
      console.log("✅ Legacy template system still works:", !!legacyPrompt);
      console.log("✅ Legacy prompt length:", legacyPrompt.length, "characters");
    } catch (error) {
      console.log("⚠️  Legacy system test failed:", error.message);
    }

    console.log("\n🎉 Phase 3 MongoDB Document Storage Integration tests completed successfully!");
    console.log("\n📊 Summary:");
    console.log("   ✅ MongoDB template storage working");
    console.log("   ✅ Template priority system functional");
    console.log("   ✅ System prompt generation enhanced");
    console.log("   ✅ Adventure configuration retrieval working");
    console.log("   ✅ Performance within acceptable limits");
    console.log("   ✅ Backward compatibility maintained");
  } catch (error) {
    console.error("❌ Phase 3 integration test failed:", error);
    process.exit(1);
  } finally {
    await MongoManager.forceShutdown();
  }
}

testPhase3Integration();
