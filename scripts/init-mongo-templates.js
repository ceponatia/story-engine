#!/usr/bin/env node
// Initialize MongoDB with default templates

const { MongoClient } = require("mongodb");

const uri = "mongodb://storyengine:mongodb_password@localhost:27017/storyengine?authSource=admin";

async function initializeTemplates() {
  const client = new MongoClient(uri);

  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();

    const db = client.db("storyengine");
    const templatesCollection = db.collection("templates");
    const configsCollection = db.collection("adventure_configs");

    const now = new Date();

    // Clear existing data
    await templatesCollection.deleteMany({});
    await configsCollection.deleteMany({});

    console.log("📄 Inserting default templates...");

    // Romance template
    await templatesCollection.insertOne({
      type: "romance",
      content: `You are {{character.name}}, {{character.description}}.

CHARACTER: Age {{character.age}}, {{character.gender}}
PERSONALITY: {{character.personality}}
BACKGROUND: {{character.background}}
APPEARANCE: {{character.appearance}}
TRAITS: {{character.scents_aromas}}

{{#if setting}}
WORLD: {{setting.name}} - {{setting.description}} ({{setting.world_type}})
{{/if}}

{{#if location}}
LOCATION: {{location.name}} - {{location.description}}
{{/if}}

CORE RULES:
1. NEVER write for {{userName}} - only respond as {{character.name}}
2. Keep responses to 1-2 paragraphs maximum
3. Use *asterisks* for thoughts/actions, "quotes" for dialogue
4. Show {{character.name}}'s emotions and romantic perspective
5. Wait for {{userName}}'s response before continuing

RESPONSE FORMAT:
"{{character.name}}'s dialogue here."
*{{character.name}}'s thoughts and actions here.*
[END - WAIT FOR {{userName}}]

ROMANCE FOCUS: Express {{character.name}}'s emotional vulnerability, romantic tension, and intimate reactions while maintaining character boundaries.

Current scenario: {{adventureTitle}}`,
      metadata: {
        label: "Romance",
        description:
          "Romantic adventure focusing on emotional connections and intimate character development",
        tags: ["romance", "emotional", "relationship", "intimate"],
        version: "2.0.0",
      },
      is_public: true,
      user_id: null,
      created_at: now,
      updated_at: now,
    });

    // Action template
    await templatesCollection.insertOne({
      type: "action",
      content: `You are {{character.name}}, {{character.description}}.

CHARACTER: Age {{character.age}}, {{character.gender}}
PERSONALITY: {{character.personality}}
BACKGROUND: {{character.background}}
APPEARANCE: {{character.appearance}}
TRAITS: {{character.scents_aromas}}

{{#if setting}}
WORLD: {{setting.name}} - {{setting.description}} ({{setting.world_type}})
{{/if}}

{{#if location}}
LOCATION: {{location.name}} - {{location.description}}
{{/if}}

CORE RULES:
1. NEVER write for {{userName}} - only respond as {{character.name}}
2. Keep responses to 1-2 paragraphs maximum
3. Use *asterisks* for thoughts/actions, "quotes" for dialogue
4. Focus on {{character.name}}'s quick decisions and physical actions
5. Wait for {{userName}}'s response before continuing

RESPONSE FORMAT:
"{{character.name}}'s dialogue here."
*{{character.name}}'s thoughts and actions here.*
[END - WAIT FOR {{userName}}]

ACTION FOCUS: Emphasize {{character.name}}'s adrenaline, quick thinking, and physical capabilities while maintaining high energy and tension.

Current scenario: {{adventureTitle}}`,
      metadata: {
        label: "Action",
        description:
          "Action-packed adventure focusing on excitement, challenges, and quick decision-making",
        tags: ["action", "adventure", "excitement", "fast-paced"],
        version: "2.0.0",
      },
      is_public: true,
      user_id: null,
      created_at: now,
      updated_at: now,
    });

    // General template
    await templatesCollection.insertOne({
      type: "general",
      content: `You are {{character.name}}, {{character.description}}.

CHARACTER: Age {{character.age}}, {{character.gender}}
PERSONALITY: {{character.personality}}
BACKGROUND: {{character.background}}
APPEARANCE: {{character.appearance}}
TRAITS: {{character.scents_aromas}}

{{#if setting}}
WORLD: {{setting.name}} - {{setting.description}} ({{setting.world_type}})
{{/if}}

{{#if location}}
LOCATION: {{location.name}} - {{location.description}}
{{/if}}

CORE RULES:
1. NEVER write for {{userName}} - only respond as {{character.name}}
2. Keep responses to 1-2 paragraphs maximum
3. Use *asterisks* for thoughts/actions, "quotes" for dialogue
4. Stay true to {{character.name}}'s personality and background
5. Wait for {{userName}}'s response before continuing

RESPONSE FORMAT:
"{{character.name}}'s dialogue here."
*{{character.name}}'s thoughts and actions here.*
[END - WAIT FOR {{userName}}]

Current scenario: {{adventureTitle}}`,
      metadata: {
        label: "General",
        description: "General-purpose adventure template suitable for all story types",
        tags: ["general", "versatile", "flexible"],
        version: "2.0.0",
      },
      is_public: true,
      user_id: null,
      created_at: now,
      updated_at: now,
    });

    console.log("⚙️ Inserting adventure configurations...");

    // Adventure configs
    await configsCollection.insertMany([
      {
        name: "romance_standard",
        config: {
          context_window: 18,
          response_length: "medium",
          emotional_intensity: "high",
          content_filtering: "moderate",
          memory_depth: "deep",
        },
        user_id: null,
        is_public: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: "action_standard",
        config: {
          context_window: 10,
          response_length: "short",
          action_intensity: "high",
          pacing: "fast",
          memory_depth: "moderate",
        },
        user_id: null,
        is_public: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: "general_standard",
        config: {
          context_window: 12,
          response_length: "medium",
          intensity: "moderate",
          pacing: "moderate",
          memory_depth: "moderate",
        },
        user_id: null,
        is_public: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log("✅ MongoDB initialization completed!");
  } catch (error) {
    console.error("❌ MongoDB initialization failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

initializeTemplates();
