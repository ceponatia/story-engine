// MongoDB initialization script for Story Engine
// Creates collections and indexes for Phase 3: Document Storage

print("=== Story Engine MongoDB Initialization ===");

// Switch to the storyengine database
db = db.getSiblingDB("storyengine");

// Create collections for Phase 3: Document Storage
print("Creating collections...");

// 1. Templates Collection - Store dynamic prompt templates
db.createCollection("templates", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["type", "content", "metadata", "created_at"],
      properties: {
        type: {
          bsonType: "string",
          description: "Template type (romance, action, etc.)",
        },
        content: {
          bsonType: "string",
          description: "Template content with handlebars syntax",
        },
        metadata: {
          bsonType: "object",
          required: ["label", "version"],
          properties: {
            label: { bsonType: "string" },
            description: { bsonType: "string" },
            tags: { bsonType: "array" },
            version: { bsonType: "string" },
          },
        },
        is_public: {
          bsonType: "bool",
          description: "Whether template is publicly available",
        },
        user_id: {
          bsonType: "string",
          description: "User who created the template (null for system templates)",
        },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" },
      },
    },
  },
});

// 2. User Preferences Collection - Store personalized settings
db.createCollection("user_preferences", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "created_at"],
      properties: {
        user_id: {
          bsonType: "string",
          description: "User ID from PostgreSQL",
        },
        template_preferences: {
          bsonType: "object",
          description: "User template customizations",
        },
        ui_preferences: {
          bsonType: "object",
          description: "UI and display preferences",
        },
        adventure_defaults: {
          bsonType: "object",
          description: "Default adventure settings",
        },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" },
      },
    },
  },
});

// 3. Adventure Configurations Collection - Dynamic adventure settings
db.createCollection("adventure_configs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "config", "created_at"],
      properties: {
        name: {
          bsonType: "string",
          description: "Configuration name",
        },
        config: {
          bsonType: "object",
          description: "Adventure configuration object",
        },
        user_id: {
          bsonType: "string",
          description: "User who created the config (null for system configs)",
        },
        is_public: {
          bsonType: "bool",
          description: "Whether config is publicly available",
        },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" },
      },
    },
  },
});

// 4. Template Versions Collection - Version history and rollback
db.createCollection("template_versions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["template_id", "version", "content", "created_at"],
      properties: {
        template_id: {
          bsonType: "objectId",
          description: "Reference to templates collection",
        },
        version: {
          bsonType: "string",
          description: "Version number (semver)",
        },
        content: {
          bsonType: "string",
          description: "Template content for this version",
        },
        metadata: {
          bsonType: "object",
          description: "Metadata for this version",
        },
        change_log: {
          bsonType: "string",
          description: "Description of changes in this version",
        },
        created_by: {
          bsonType: "string",
          description: "User who created this version",
        },
        created_at: { bsonType: "date" },
      },
    },
  },
});

print("Collections created successfully");

// Create indexes for optimal performance
print("Creating indexes...");

// Templates indexes
db.templates.createIndex({ type: 1 });
db.templates.createIndex({ user_id: 1 });
db.templates.createIndex({ is_public: 1 });
db.templates.createIndex({ "metadata.tags": 1 });
db.templates.createIndex({ type: 1, user_id: 1 }, { unique: true });

// User preferences indexes
db.user_preferences.createIndex({ user_id: 1 }, { unique: true });

// Adventure configs indexes
db.adventure_configs.createIndex({ name: 1 });
db.adventure_configs.createIndex({ user_id: 1 });
db.adventure_configs.createIndex({ is_public: 1 });
db.adventure_configs.createIndex({ name: 1, user_id: 1 }, { unique: true });

// Template versions indexes
db.template_versions.createIndex({ template_id: 1 });
db.template_versions.createIndex({ template_id: 1, version: 1 });
db.template_versions.createIndex({ created_at: -1 });

print("Indexes created successfully");

// Insert default system templates
print("Inserting default system templates...");

const now = new Date();

// Romance template
db.templates.insertOne({
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
db.templates.insertOne({
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
db.templates.insertOne({
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

print("Default templates inserted successfully");

// Insert default adventure configurations
print("Inserting default adventure configurations...");

db.adventure_configs.insertOne({
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
});

db.adventure_configs.insertOne({
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
});

db.adventure_configs.insertOne({
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
});

print("Default adventure configurations inserted successfully");

print("=== MongoDB initialization completed successfully ===");
print("Collections created: templates, user_preferences, adventure_configs, template_versions");
print("Indexes created for optimal query performance");
print("Default system templates and configurations inserted");
