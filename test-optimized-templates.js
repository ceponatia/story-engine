const { buildOptimizedSystemPrompt, TEMPLATE_METRICS } = require('./lib/prompts/optimized-templates.ts');
const { buildSystemPrompt } = require('./lib/prompts/templates.ts');

// Test context
const testContext = {
  character: {
    name: "Emily",
    age: 25,
    gender: "female",
    personality: { traits: ["curious", "passionate"], emotions: ["excited"] },
    background: "A university student studying literature",
    appearance: { hair: { color: ["brown"], texture: ["long"] }, eyes: { color: ["green"] } },
    scents_aromas: { natural: ["vanilla", "books"] },
    description: "a curious literature student"
  },
  setting: {
    name: "Modern University",
    description: "A prestigious university campus",
    time_period: "2024",
    world_type: "contemporary"
  },
  location: {
    name: "Library",
    description: "A quiet study area with tall bookshelves"
  },
  userName: "Alex",
  adventureTitle: "Study Session Romance"
};

console.log("=== TEMPLATE COMPARISON TEST ===\n");

console.log("📊 METRICS:");
console.log(`Original Romance Template: ~${TEMPLATE_METRICS.original.romance} lines`);
console.log(`Optimized Romance Template: ~${TEMPLATE_METRICS.optimized.romance} lines`);
console.log(`Reduction: ${Math.round((1 - TEMPLATE_METRICS.optimized.romance / TEMPLATE_METRICS.original.romance) * 100)}%\n`);

try {
  console.log("🔍 TESTING OPTIMIZED TEMPLATE:\n");
  const optimizedPrompt = buildOptimizedSystemPrompt('romance', testContext);
  console.log("✅ Optimized template generated successfully");
  console.log(`Length: ${optimizedPrompt.length} characters`);
  console.log(`Lines: ${optimizedPrompt.split('\n').length}\n`);
  
  console.log("📝 OPTIMIZED PROMPT PREVIEW:");
  console.log(optimizedPrompt.substring(0, 300) + "...\n");
  
  console.log("🔍 TESTING ORIGINAL TEMPLATE:\n");
  const originalPrompt = buildSystemPrompt('romance', testContext);
  console.log("✅ Original template generated successfully");
  console.log(`Length: ${originalPrompt.length} characters`);
  console.log(`Lines: ${originalPrompt.split('\n').length}\n`);
  
  console.log("📊 COMPARISON:");
  console.log(`Character reduction: ${Math.round((1 - optimizedPrompt.length / originalPrompt.length) * 100)}%`);
  console.log(`Line reduction: ${Math.round((1 - optimizedPrompt.split('\n').length / originalPrompt.split('\n').length) * 100)}%`);
  
} catch (error) {
  console.error("❌ Error testing templates:", error.message);
}