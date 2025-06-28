# Character Function Calling Implementation Plan

## Current State Analysis

### ✅ Existing Infrastructure (90% Complete)

#### **Parsing System**
- **Location**: `lib/parsers/unified-parser.ts`
- **Capabilities**:
  - Parses natural language → structured JSONB (`parseScentsText()`, `parseAppearanceText()`, `parsePersonalityText()`)
  - Handles category normalization (`foot` → `feet`, removes redundant suffixes)
  - Sub-type inference (size, color, style, scents, fragrance, etc.)
  - Converts back to natural language for display (`attributeToText()`)

#### **Character State Management**
- **Location**: `app/actions/character-state.ts`
- **Functions Available**:
  - `updateCharacterStateFromText()` - Accepts natural language, parses to JSONB, updates DB
  - `updateCharacterState()` - Direct structured data updates
  - `getCharacterState()` - Retrieve current state
  - `buildCharacterContext()` - Convert JSONB back to natural language for LLM context

#### **Database Layer**
- **Location**: `lib/database/queries.ts`
- **Capabilities**:
  - `updateAdventureCharacterState()` - Direct database updates
  - `getAdventureCharacterState()` - State retrieval
  - Proper JSONB handling with timestamps and context

#### **Post-Processing System**
- **Location**: `lib/ai/functions/`
- **Current Approach**: Text analysis after LLM response generation
- **Components**:
  - `state-extractor.ts` - Regex patterns for state change detection
  - `character-tracker.ts` - Processes extracted changes
  - `processLLMResponse()` - Main integration function

#### **AI Client Infrastructure**
- **Location**: `lib/ai/ollama/client.ts`
- **Capabilities**:
  - Function calling support exists but unused (`functions?: any[]` parameter)
  - `OllamaFunction` and `FunctionCall` types defined
  - Ready for tool calling integration

---

## ❌ Missing Components (10% Gap)

### **1. Function Schema Definitions**
**Need**: Define function schemas that the LLM can call during response generation

**Required File**: `lib/ai/functions/character-schemas.ts`
```typescript
export const CHARACTER_FUNCTIONS = [
  {
    name: "update_character_scents",
    description: "Update character scents/aromas when actions affect smell",
    parameters: {
      type: "object",
      properties: {
        scent_text: {
          type: "string", 
          description: "Natural language describing new scents (e.g., 'feet: clean, fresh')"
        },
        context: {
          type: "string",
          description: "What caused this change (e.g., 'took a shower')"
        }
      },
      required: ["scent_text"]
    }
  },
  {
    name: "update_character_appearance", 
    description: "Update character appearance when actions change how they look",
    parameters: {
      type: "object",
      properties: {
        appearance_text: {
          type: "string",
          description: "Natural language describing appearance changes"
        },
        context: { type: "string" }
      },
      required: ["appearance_text"]
    }
  }
  // ... more functions for personality, etc.
]
```

### **2. Function Execution Handlers**
**Need**: Bridge between LLM function calls and existing state management

**Required File**: `lib/ai/functions/character-handlers.ts`
```typescript
export async function handleCharacterFunction(
  functionName: string,
  parameters: Record<string, any>,
  adventureId: string
): Promise<{ success: boolean; result?: any; error?: string }> {
  
  switch (functionName) {
    case 'update_character_scents':
      return await updateCharacterStateFromText(adventureId, {
        scents_aromas: parameters.scent_text
      }, parameters.context);
      
    case 'update_character_appearance':
      return await updateCharacterStateFromText(adventureId, {
        appearance: parameters.appearance_text  
      }, parameters.context);
      
    // ... other handlers
  }
}
```

### **3. LLM Integration Modifications**
**Need**: Modify LLM generation to include function calling

**File to Update**: `app/actions/llm.ts`
- Add function schemas to LLM requests
- Handle function call responses
- Execute functions during generation
- Continue conversation flow after function execution

### **4. Prompt Engineering Updates**
**Need**: Instruct LLM when and how to use character functions

**Files to Update**: `lib/prompts/templates.ts` or `lib/prompts/optimized-templates.ts`
- Add instructions about function calling
- Specify when to update character state
- Provide examples of proper function usage

---

## 🎯 Implementation Plan

### **Phase 1: Function Schema & Handlers (2-3 hours)**
1. Create `lib/ai/functions/character-schemas.ts`
   - Define function schemas for scents, appearance, personality updates
   - Include comprehensive parameter descriptions
   - Add validation schemas

2. Create `lib/ai/functions/character-handlers.ts`
   - Implement function execution logic
   - Connect to existing `updateCharacterStateFromText()`
   - Add error handling and validation
   - Return structured responses

### **Phase 2: LLM Integration (3-4 hours)**
1. Update `lib/ai/ollama/client.ts`
   - Ensure function calling is properly exposed
   - Handle function call parsing from LLM responses
   - Manage function execution flow

2. Update `app/actions/llm.ts`
   - Include character functions in LLM requests
   - Parse function calls from responses
   - Execute functions via handlers
   - Continue conversation after function execution

### **Phase 3: Prompt Engineering (1-2 hours)**
1. Update system prompts to include:
   - Function calling instructions
   - When to update character state
   - Examples of proper function usage
   - Guidelines for state change detection

### **Phase 4: Testing & Validation (2-3 hours)**
1. Test function calling flow:
   - Verify LLM calls functions appropriately
   - Confirm state updates work correctly
   - Check error handling
   - Validate conversation continuity

2. Test edge cases:
   - Multiple state changes in one response
   - Invalid function parameters
   - Database errors during updates
   - Function call failures

---

## 🔄 Desired Function Calling Flow

### **Example: Feet Cleaning Scenario**

1. **User Message**: "I should clean my feet"

2. **LLM Generation Process**:
   ```
   LLM thinks: "Nikki is about to clean her feet. This will change her foot scents from stinky to clean."
   
   LLM calls: update_character_scents({
     scent_text: "feet: clean, fresh, soapy",
     context: "cleaned feet after shower"
   })
   
   Function executes → Database updated → Success response
   
   LLM continues: "I went to the bathroom and thoroughly cleaned my feet. They smell much better now - fresh and soapy instead of stinky."
   ```

3. **Result**: 
   - Nikki's response reflects the action
   - Database updated: `feet.scents: ["Clean", "Fresh", "Soapy"]`
   - Future conversations use updated state

### **Real-Time vs Post-Processing Comparison**

| Aspect | Current (Post-Processing) | Desired (Function Calling) |
|--------|---------------------------|----------------------------|
| **Timing** | After response generation | During response generation |
| **Accuracy** | Text analysis dependent | LLM-driven decisions |
| **Consistency** | May miss subtle changes | LLM understands context |
| **Reliability** | High (text always available) | Medium (depends on LLM) |
| **Performance** | Slower (extra processing) | Faster (real-time) |
| **User Experience** | Delayed state updates | Immediate state reflection |

---

## 🚧 Potential Challenges

### **1. LLM Function Calling Reliability**
- **Issue**: LLM might not call functions when it should
- **Solution**: Comprehensive prompt engineering + fallback to post-processing

### **2. Function Parameter Validation**
- **Issue**: LLM might provide invalid parameters
- **Solution**: Robust validation in handlers + error recovery

### **3. Performance Impact**
- **Issue**: Function calls may slow response generation
- **Solution**: Async function execution where possible

### **4. Error Handling**
- **Issue**: Function failures could break conversation flow
- **Solution**: Graceful degradation + error logging

---

## 🎯 Success Metrics

### **Functional Requirements**
- ✅ LLM successfully calls character update functions
- ✅ Character state updates reflected in real-time
- ✅ Conversation flow continues naturally after function calls
- ✅ Database maintains consistency and timestamps

### **Quality Requirements**
- ✅ Function calling accuracy > 90% for obvious state changes
- ✅ No false positive function calls
- ✅ Graceful handling of function failures
- ✅ Backwards compatibility with existing post-processing system

### **Performance Requirements**
- ✅ Function execution adds < 500ms to response time
- ✅ Database updates complete successfully > 99% of time
- ✅ Memory usage remains within acceptable limits

---

## 📋 Implementation Checklist

### **Pre-Implementation**
- [ ] Review existing codebase for any conflicts
- [ ] Confirm Ollama/Mistral function calling capabilities
- [ ] Test current state management system thoroughly

### **Implementation**
- [ ] Create function schema definitions
- [ ] Implement function execution handlers
- [ ] Update LLM client for function calling
- [ ] Modify LLM generation flow
- [ ] Update system prompts
- [ ] Add comprehensive error handling

### **Testing**
- [ ] Unit tests for function handlers
- [ ] Integration tests for LLM → function → database flow
- [ ] End-to-end testing with real conversations
- [ ] Performance testing under load
- [ ] Error scenario testing

### **Documentation**
- [ ] Document function calling system
- [ ] Update API documentation
- [ ] Create developer guidelines for adding new functions
- [ ] Update user-facing documentation if needed

---

*Created: 2025-06-27*
*Status: Planning Phase*
*Priority: High - Core feature for enhanced character interaction*