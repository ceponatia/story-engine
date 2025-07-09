#!/usr/bin/env node

/**
 * Test script for Ollama integration
 * Run with: npm run dev:ollama-test
 */

import { OllamaClient } from "./client";
import { OllamaSetup } from "./setup";
import { DEFAULT_MODEL, SYSTEM_PROMPTS, GENERATION_PRESETS } from "../config/ollama";

async function testOllamaIntegration() {
  console.log("🚀 Testing Ollama Integration for Story Engine\n");

  const setup = new OllamaSetup();
  const client = new OllamaClient();

  try {
    // Test 1: Check if Ollama is running
    console.log("1. Checking Ollama server status...");
    const isRunning = await client.healthCheck();
    if (!isRunning) {
      console.log("❌ Ollama server is not running");
      console.log("Please start it with: ollama serve");
      return;
    }
    console.log("✅ Ollama server is running\n");

    // Test 2: List available models
    console.log("2. Listing available models...");
    const models = await client.listModels();
    if (models.length === 0) {
      console.log("❌ No models installed");
      console.log("Please install a model with: ollama pull mistral:7b-instruct-v0.1-q4_0");
      return;
    }

    console.log("✅ Available models:");
    models.forEach((model) => {
      console.log(`   - ${model.name} (${(model.size / 1024 / 1024 / 1024).toFixed(1)}GB)`);
    });
    console.log();

    // Test 3: Check if recommended model is available
    console.log("3. Checking for recommended model...");
    const hasRecommendedModel = models.some((m) => m.name === DEFAULT_MODEL);
    const testModel = hasRecommendedModel ? DEFAULT_MODEL : models[0].name;

    if (hasRecommendedModel) {
      console.log(`✅ Recommended model ${DEFAULT_MODEL} is available`);
    } else {
      console.log(`⚠️  Using ${testModel} instead of recommended ${DEFAULT_MODEL}`);
    }
    console.log();

    // Test 4: Simple generation test
    console.log("4. Testing text generation...");
    const simpleResponse = await client.generate(
      testModel,
      "Hello! Please respond with a brief greeting.",
      { max_tokens: 50, temperature: 0.7 }
    );

    if (simpleResponse.response) {
      console.log("✅ Simple generation test passed");
      console.log(`Response: ${simpleResponse.response.trim()}`);
    } else {
      console.log("❌ Simple generation test failed");
      return;
    }
    console.log();

    // Test 5: Story generation test
    console.log("5. Testing story generation with system prompt...");
    const storyResponse = await client.generate(
      testModel,
      "Create a brief character description for a fantasy story protagonist.",
      {
        system: SYSTEM_PROMPTS.character_developer,
        ...GENERATION_PRESETS.creative,
        max_tokens: 150,
      }
    );

    if (storyResponse.response) {
      console.log("✅ Story generation test passed");
      console.log(`Character: ${storyResponse.response.trim()}`);
    } else {
      console.log("❌ Story generation test failed");
    }
    console.log();

    // Test 6: Chat interface test
    console.log("6. Testing chat interface...");
    const chatResponse = await client.chat(
      testModel,
      [
        { role: "system", content: SYSTEM_PROMPTS.story_writer },
        { role: "user", content: "What makes a compelling story opening?" },
      ],
      {
        ...GENERATION_PRESETS.balanced,
        max_tokens: 100,
      }
    );

    if (chatResponse.message?.content) {
      console.log("✅ Chat interface test passed");
      console.log(`Response: ${chatResponse.message.content.trim()}`);
    } else {
      console.log("❌ Chat interface test failed");
    }
    console.log();

    // Test 7: Performance metrics
    console.log("7. Performance metrics from last generation:");
    if (chatResponse.total_duration) {
      const totalTime = (chatResponse.total_duration / 1000000).toFixed(0); // Convert to ms
      console.log(`   Total time: ${totalTime}ms`);
    }
    if (chatResponse.eval_count && chatResponse.eval_duration) {
      const tokensPerSecond = (
        chatResponse.eval_count /
        (chatResponse.eval_duration / 1000000000)
      ).toFixed(1);
      console.log(`   Tokens per second: ${tokensPerSecond}`);
    }
    console.log();

    // Test 8: System info
    console.log("8. System information:");
    const systemInfo = await setup.getSystemInfo();
    console.log(`   GPU: ${systemInfo.gpu}`);
    if (systemInfo.cudaVersion) {
      console.log(`   CUDA Version: ${systemInfo.cudaVersion}`);
    }
    if (systemInfo.rocmVersion) {
      console.log(`   ROCm Version: ${systemInfo.rocmVersion}`);
    }

    console.log("\n🎉 All tests completed successfully!");
    console.log("\nOllama is ready for Story Engine integration.");
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.log("\nTroubleshooting steps:");
    console.log("1. Make sure Ollama is running: ollama serve");
    console.log("2. Install a model: ollama pull mistral:7b-instruct-v0.1-q4_0");
    console.log("3. Check GPU drivers if using GPU acceleration");
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testOllamaIntegration();
}

export { testOllamaIntegration };
