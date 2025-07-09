# Context-Aware Character Data Retrieval

## Overview

The context analyzer provides intelligent character data retrieval based on conversation context. Instead of loading all character data for every interaction, it analyzes recent messages to determine which specific attributes are being referenced and retrieves only the relevant data.

## Key Features

- **Natural Language Understanding**: Maps conversational text to specific JSONB paths
- **Active Character Tracking**: Maintains conversation focus on specific characters
- **Confidence-Based Fallbacks**: Returns full character data when confidence is low
- **Configurable Schema**: Easy-to-maintain attribute mappings in JSON config
- **Performance Optimized**: Reduces token usage and database load

## Usage

### Basic Usage

```typescript
import { getContextualCharacterInfo, ConversationContext } from "@/lib/ai/functions";

const context: ConversationContext = {
  messages: [
    { role: "user", content: "What color are her eyes?", timestamp: new Date() },
    {
      role: "assistant",
      content: "I need to check her appearance details.",
      timestamp: new Date(),
    },
  ],
  adventureId: "adventure_123", // adventures.id
  activeAdventureCharacterId: "adv_char_456", // adventure_characters.id (optional)
};

const result = await getContextualCharacterInfo(context);

console.log("Retrieved data:", result.data);
console.log("Analysis log:", result.analysis.analysisLog);
```

### Integration with Existing LLM Pipeline

```typescript
// In your LLM action/function
import { getContextualCharacterInfo } from "@/lib/ai/functions";

export async function generateLLMResponse(
  messages: Message[],
  adventureId: string,
  userId: string
) {
  // Analyze conversation context for character data needs
  const context: ConversationContext = {
    messages: messages.slice(-5), // Last 5 messages
    adventureId,
    activeAdventureCharacterId: await getActiveAdventureCharacterForAdventure(adventureId),
  };

  const { data: relevantCharacterData, analysis } = await getContextualCharacterInfo(context);

  // Include only relevant character data in LLM context
  const prompt = buildPrompt({
    messages,
    characterData: relevantCharacterData, // Only specific attributes
    adventureContext: await getAdventureContext(adventureId),
  });

  const response = await callLLM(prompt);

  // Log what data was retrieved for debugging
  console.log("Context analysis:", {
    confidence: analysis.confidence,
    queries: analysis.queries.length,
    fallback: analysis.fallbackToFullData,
  });

  return response;
}
```

## Configuration

### Schema Configuration

The attribute schema is defined in `schema-config.json` and can be easily extended:

```json
{
  "attributes": {
    "appearance": {
      "new_attribute": {
        "path": "custom.field",
        "keywords": ["custom", "field", "related", "terms"],
        "aliases": ["alternative names"],
        "description": "Description of the new attribute",
        "examples": ["example usage in conversation"]
      }
    }
  }
}
```

### Runtime Options

```typescript
const options = {
  lookbackMessages: 5, // Number of recent messages to analyze
  confidenceThreshold: 0.6, // Minimum confidence for attribute matching
  enableEmbeddingSimilarity: false, // Future: semantic similarity matching
};

const result = await analyzeConversationContext(context, options);
```

## Supported Attribute Categories

### Appearance

- Hair (color, style, length)
- Eyes (color)
- Body (height, build)
- Skin (tone, complexion)

### Scents & Aromas

- Feet scents
- Body scents
- Hair scents
- Clothing scents

### Personality

- Core traits
- Emotional state
- Behavioral patterns
- Social style

### Background

- Personal history
- Occupation
- Education
- Relationships

## How It Works

1. **Context Analysis**: Analyzes recent conversation messages for character references
2. **Keyword Matching**: Matches natural language to attribute schema using keywords and aliases
3. **Confidence Scoring**: Calculates confidence based on keyword matches and context
4. **Query Generation**: Creates specific database queries for high-confidence matches
5. **Fallback Strategy**: Returns full character data if confidence is too low

## Performance Benefits

- **Reduced Token Usage**: Only includes relevant character data in LLM context
- **Faster Responses**: Smaller context windows process faster
- **Lower Database Load**: Targeted queries instead of full character retrieval
- **Better Accuracy**: More focused context reduces hallucination risk

## Example Conversation Analysis

**Input Messages:**

```
User: "What does her hair smell like?"
Assistant: "I should check her hair scent details."
```

**Analysis Result:**

```json
{
  "queries": [
    {
      "column": "scents_aromas",
      "path": "hair.scents",
      "confidence": 0.85,
      "matchedKeywords": ["hair", "smell"],
      "queryReason": "Keyword match: hair, smell"
    }
  ],
  "confidence": "high",
  "fallbackToFullData": false
}
```

**Retrieved Data:**

```json
{
  "scents_aromas.hair.scents": {
    "primary": "vanilla shampoo",
    "secondary": "light floral conditioner",
    "intensity": "subtle"
  }
}
```

## Future Enhancements

- **Embedding Similarity**: Semantic matching for complex references
- **Multi-Character Support**: Handle conversations with multiple active characters
- **Learning System**: Adapt keyword mappings based on usage patterns
- **Caching Layer**: Cache frequently accessed attribute combinations
- **NER Integration**: Better character name and reference extraction

## Troubleshooting

### Low Confidence Matches

- Review keyword mappings in schema-config.json
- Add more aliases for common phrasings
- Lower confidence threshold for testing

### Missing Attributes

- Ensure JSONB paths exist in database schema
- Add new attributes to schema-config.json
- Verify column names match database structure

### Performance Issues

- Reduce lookbackMessages for faster processing
- Increase confidence threshold to reduce query count
- Consider caching for frequently accessed attributes
