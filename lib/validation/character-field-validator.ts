/**
 * Character Field Validation Service
 * 
 * Provides comprehensive validation for character field updates with:
 * - JSONB path-based protection rules
 * - Confidence scoring algorithms
 * - Context awareness and rate limiting
 * - Integration with database protection rules
 */

import { getDatabase } from '@/lib/database/pool';
import { UnifiedParserResult } from '@/lib/parsers/unified-parser';

export interface ValidationContext {
  adventureCharacterId: string;
  currentCharacterState: Record<string, any>;
  recentChanges: CharacterFieldChange[];
  adventureHistory: AdventureMessage[];
  establishedTraits: Record<string, EstablishedTrait>;
  messageContext?: string; // The full message context for confidence analysis
}

export interface EstablishedTrait {
  value: any;
  confidence: number;
  establishedAt: Date;
  source: 'manual' | 'llm_extraction' | 'system_default';
}

export interface CharacterFieldChange {
  fieldPath: string;
  previousValue: any;
  newValue: any;
  confidenceScore: number;
  changedAt: Date;
  source: string;
}

export interface AdventureMessage {
  content: string;
  speaker: 'user' | 'character';
  timestamp: Date;
}

export interface ConfidenceFactors {
  explicitMention: number;      // 0.0-1.0: "I dye my hair" vs "blonde hair" 
  actionBased: number;          // 0.0-1.0: "puts on" vs "has"
  temporalMarkers: number;      // 0.0-1.0: "now", "suddenly" vs "always"
  characterAgency: number;      // 0.0-1.0: character vs external description
  contextConsistency: number;   // 0.0-1.0: matches existing state
  sourceReliability: number;    // 0.0-1.0: character speech vs narration
}

export interface ValidationResult {
  allowed: boolean;
  confidence: number;
  reason: string;
  ruleId?: string;
  factors?: ConfidenceFactors;
  suggestedCorrection?: string;
}

export interface FieldUpdateRequest {
  fieldPath: string;
  newValue: any;
  sourceText: string;
  parsedData: UnifiedParserResult;
  messageId?: string;
}

/**
 * Advanced confidence scoring algorithm for character field updates
 */
export class ConfidenceScorer {
  
  /**
   * Calculate confidence score for a field update based on multiple factors
   */
  static calculateConfidence(
    request: FieldUpdateRequest,
    context: ValidationContext
  ): { score: number; factors: ConfidenceFactors } {
    
    const factors: ConfidenceFactors = {
      explicitMention: this.analyzeExplicitMention(request.sourceText, request.fieldPath),
      actionBased: this.analyzeActionBased(request.sourceText, request.fieldPath),
      temporalMarkers: this.analyzeTemporalMarkers(request.sourceText),
      characterAgency: this.analyzeCharacterAgency(request.sourceText, context),
      contextConsistency: this.analyzeContextConsistency(request, context),
      sourceReliability: this.analyzeSourceReliability(request.sourceText, context)
    };

    // Weighted scoring algorithm
    const weights = {
      explicitMention: 0.25,
      actionBased: 0.20,
      temporalMarkers: 0.15,
      characterAgency: 0.15,
      contextConsistency: 0.15,
      sourceReliability: 0.10
    };

    const score = Object.entries(factors).reduce((total, [key, value]) => {
      const weight = weights[key as keyof typeof weights];
      return total + (value * weight);
    }, 0);

    return { score: Math.max(0, Math.min(1, score)), factors };
  }

  /**
   * Analyze if the change is explicitly mentioned vs inferred
   */
  private static analyzeExplicitMention(text: string, fieldPath: string): number {
    const lowerText = text.toLowerCase();
    const [category, attribute] = fieldPath.split('.');
    
    // Explicit action verbs for appearance changes
    const explicitVerbs = [
      'dye', 'cut', 'style', 'wear', 'put on', 'apply', 'remove', 'change',
      'trim', 'grow', 'straighten', 'curl', 'color', 'paint', 'pierce'
    ];
    
    // Check for explicit verbs + field reference
    const hasExplicitVerb = explicitVerbs.some(verb => lowerText.includes(verb));
    const hasFieldReference = lowerText.includes(category) || lowerText.includes(attribute);
    
    if (hasExplicitVerb && hasFieldReference) return 0.9;
    if (hasExplicitVerb) return 0.7;
    if (hasFieldReference) return 0.5;
    
    // Check for possessive/descriptive patterns
    const possessivePatterns = ['my ', 'her ', 'his ', 'their '];
    const hasPossessive = possessivePatterns.some(pattern => lowerText.includes(pattern + category));
    
    return hasPossessive ? 0.3 : 0.1;
  }

  /**
   * Analyze if the text describes an action vs a static description
   */
  private static analyzeActionBased(text: string, fieldPath: string): number {
    const lowerText = text.toLowerCase();
    
    // Action indicators
    const actionWords = [
      'put', 'wear', 'apply', 'remove', 'change', 'adjust', 'fix', 'do', 'make',
      'get', 'take', 'go', 'come', 'move', 'turn', 'look', 'feel', 'become'
    ];
    
    // Present tense action verbs
    const presentTenseActions = actionWords.some(action => 
      lowerText.includes(` ${action} `) || lowerText.includes(`${action}s `)
    );
    
    // Past tense actions
    const pastTenseActions = actionWords.some(action => 
      lowerText.includes(`${action}ed `) || lowerText.includes(`${action}d `)
    );
    
    // Gerund forms (-ing)
    const gerundActions = actionWords.some(action => 
      lowerText.includes(`${action}ing `)
    );
    
    if (presentTenseActions || gerundActions) return 0.8;
    if (pastTenseActions) return 0.6;
    
    // Static descriptive patterns
    const staticPatterns = ['is ', 'are ', 'has ', 'have ', 'looks ', 'appears '];
    const isStatic = staticPatterns.some(pattern => lowerText.includes(pattern));
    
    return isStatic ? 0.2 : 0.4;
  }

  /**
   * Analyze temporal markers indicating change vs permanence
   */
  private static analyzeTemporalMarkers(text: string): number {
    const lowerText = text.toLowerCase();
    
    // Change indicators
    const changeMarkers = [
      'now', 'today', 'currently', 'just', 'recently', 'suddenly', 'then',
      'finally', 'at last', 'this time', 'for once', 'quickly', 'slowly'
    ];
    
    // Permanence indicators
    const permanentMarkers = [
      'always', 'never', 'forever', 'permanently', 'naturally', 'born with',
      'since birth', 'genetic', 'inherited', 'usual', 'typically', 'normally'
    ];
    
    const hasChangeMarker = changeMarkers.some(marker => lowerText.includes(marker));
    const hasPermanentMarker = permanentMarkers.some(marker => lowerText.includes(marker));
    
    if (hasChangeMarker && !hasPermanentMarker) return 0.8;
    if (hasPermanentMarker) return 0.1;
    
    return 0.5; // Neutral
  }

  /**
   * Analyze if the character is the agent of change vs external description
   */
  private static analyzeCharacterAgency(text: string, context: ValidationContext): number {
    const lowerText = text.toLowerCase();
    
    // First person indicators (character speaking)
    const firstPersonPronouns = ['i ', 'my ', 'me ', 'myself '];
    const hasFirstPerson = firstPersonPronouns.some(pronoun => lowerText.includes(pronoun));
    
    // Third person indicators (external description)
    const thirdPersonPronouns = ['she ', 'he ', 'her ', 'his ', 'they ', 'their '];
    const hasThirdPerson = thirdPersonPronouns.some(pronoun => lowerText.includes(pronoun));
    
    // Check context for speaker
    const isCharacterSpeaking = context.messageContext?.includes('"') || 
                               context.messageContext?.includes('says') ||
                               context.messageContext?.includes('tells');
    
    if (hasFirstPerson && isCharacterSpeaking) return 0.9;
    if (hasFirstPerson) return 0.7;
    if (hasThirdPerson && !isCharacterSpeaking) return 0.3;
    
    return 0.5; // Neutral
  }

  /**
   * Analyze consistency with existing character state
   */
  private static analyzeContextConsistency(request: FieldUpdateRequest, context: ValidationContext): number {
    const { fieldPath, newValue } = request;
    
    // Check against established traits
    const established = context.establishedTraits[fieldPath];
    if (established) {
      // If changing an established trait, penalize confidence
      const timeSinceEstablished = Date.now() - established.establishedAt.getTime();
      const daysSinceEstablished = timeSinceEstablished / (1000 * 60 * 60 * 24);
      
      // Recent established traits are harder to change
      if (daysSinceEstablished < 1) return 0.2;
      if (daysSinceEstablished < 7) return 0.4;
      
      // Check if new value is similar to established value
      if (JSON.stringify(newValue) === JSON.stringify(established.value)) {
        return 0.9; // Reinforcing existing trait
      }
    }
    
    // Check for recent changes to the same field
    const recentChanges = context.recentChanges
      .filter(change => change.fieldPath === fieldPath)
      .filter(change => Date.now() - change.changedAt.getTime() < 24 * 60 * 60 * 1000); // Last 24 hours
    
    if (recentChanges.length > 0) {
      // Multiple recent changes to same field reduce confidence
      return Math.max(0.1, 0.8 - (recentChanges.length * 0.2));
    }
    
    return 0.7; // Default positive consistency
  }

  /**
   * Analyze source reliability (character dialogue vs narration)
   */
  private static analyzeSourceReliability(text: string, context: ValidationContext): number {
    const messageContext = context.messageContext || '';
    
    // Check if this is direct character dialogue
    const isDirectDialogue = messageContext.includes('"') && text.includes('"');
    
    // Check if this is character internal thoughts
    const isInternalThought = messageContext.includes('*') && text.includes('*');
    
    // Check if this is third-person narration
    const isNarration = !isDirectDialogue && !isInternalThought;
    
    // Dialogue and thoughts are more reliable for self-description
    if (isDirectDialogue) return 0.8;
    if (isInternalThought) return 0.7;
    if (isNarration) return 0.5;
    
    return 0.6; // Default
  }
}

/**
 * Main character field validation service
 */
export class CharacterFieldValidator {
  
  /**
   * Validate a character field update request
   */
  static async validateFieldUpdate(
    request: FieldUpdateRequest,
    context: ValidationContext
  ): Promise<ValidationResult> {
    
    try {
      // Calculate confidence score
      const { score: confidence, factors } = ConfidenceScorer.calculateConfidence(request, context);
      
      // Get protection rule from database
      const db = await getDatabase();
      const ruleQuery = `
        SELECT * FROM is_field_change_allowed($1, $2, $3, $4, $5)
      `;
      
      const explicitMention = factors.explicitMention > 0.5;
      const characterAgency = factors.characterAgency > 0.5;
      
      const result = await db.query(ruleQuery, [
        context.adventureCharacterId,
        request.fieldPath,
        confidence,
        explicitMention,
        characterAgency
      ]);
      
      if (result.rows.length === 0) {
        return {
          allowed: false,
          confidence,
          reason: 'No protection rule found',
          factors
        };
      }
      
      const ruleResult = result.rows[0];
      
      if (!ruleResult.allowed) {
        return {
          allowed: false,
          confidence,
          reason: ruleResult.reason,
          ruleId: ruleResult.rule_id,
          factors,
          suggestedCorrection: this.generateCorrectionSuggestion(request, ruleResult.reason)
        };
      }
      
      return {
        allowed: true,
        confidence,
        reason: 'Validation passed',
        ruleId: ruleResult.rule_id,
        factors
      };
      
    } catch (error) {
      console.error('Error validating field update:', error);
      return {
        allowed: false,
        confidence: 0,
        reason: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        factors: {
          explicitMention: 0,
          actionBased: 0,
          temporalMarkers: 0,
          characterAgency: 0,
          contextConsistency: 0,
          sourceReliability: 0
        }
      };
    }
  }

  /**
   * Validate multiple field updates in a batch
   */
  static async validateFieldUpdates(
    requests: FieldUpdateRequest[],
    context: ValidationContext
  ): Promise<ValidationResult[]> {
    
    const results = await Promise.all(
      requests.map(request => this.validateFieldUpdate(request, context))
    );
    
    return results;
  }

  /**
   * Record a successful field change in the database
   */
  static async recordFieldChange(
    request: FieldUpdateRequest,
    context: ValidationContext,
    validation: ValidationResult
  ): Promise<string> {
    
    try {
      const db = await getDatabase();
      const recordQuery = `
        SELECT record_field_change($1, $2, $3, $4, $5, $6, $7, $8) as change_id
      `;
      
      // Get previous value from current character state
      const previousValue = this.getValueAtPath(context.currentCharacterState, request.fieldPath);
      
      const result = await db.query(recordQuery, [
        context.adventureCharacterId,
        request.fieldPath,
        JSON.stringify(previousValue),
        JSON.stringify(request.newValue),
        validation.confidence,
        request.sourceText,
        'llm_extraction',
        request.messageId
      ]);
      
      return result.rows[0]?.change_id;
      
    } catch (error) {
      console.error('Error recording field change:', error);
      throw error;
    }
  }

  /**
   * Generate a correction suggestion for blocked updates
   */
  private static generateCorrectionSuggestion(request: FieldUpdateRequest, reason: string): string {
    const [category, attribute] = request.fieldPath.split('.');
    
    if (reason.includes('immutable')) {
      return `${category}.${attribute} cannot be changed. Please rewrite your response without modifying this character trait.`;
    }
    
    if (reason.includes('Confidence score too low')) {
      return `Please be more explicit about changes to ${category}.${attribute}. Use clear action words like "dyes", "cuts", "wears", etc.`;
    }
    
    if (reason.includes('explicit mention')) {
      return `Changes to ${category}.${attribute} must be explicitly mentioned in the text, not just implied.`;
    }
    
    if (reason.includes('character agency')) {
      return `Changes to ${category}.${attribute} must be initiated by the character themselves, not described externally.`;
    }
    
    if (reason.includes('cooldown')) {
      return `${category}.${attribute} was recently changed. Please wait before making another change to this trait.`;
    }
    
    return `Please modify your response to avoid changing ${category}.${attribute}. ${reason}`;
  }

  /**
   * Get value at JSONB path from character state
   */
  private static getValueAtPath(characterState: Record<string, any>, path: string): any {
    const parts = path.split('.');
    let current = characterState;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return current;
  }

  /**
   * Build validation context from adventure character data
   */
  static async buildValidationContext(
    adventureCharacterId: string,
    messageContent?: string
  ): Promise<ValidationContext> {
    
    try {
      const db = await getDatabase();
      
      // Get current character state
      const characterQuery = `
        SELECT ac.*, c.name, c.age, c.gender, c.description, c.background, c.personality, c.appearance, c.scents_aromas
        FROM adventure_characters ac
        JOIN characters c ON ac.character_id = c.id
        WHERE ac.id = $1
      `;
      
      const characterResult = await db.query(characterQuery, [adventureCharacterId]);
      if (characterResult.rows.length === 0) {
        throw new Error(`Adventure character not found: ${adventureCharacterId}`);
      }
      
      const character = characterResult.rows[0];
      
      // Get recent field changes
      const changesQuery = `
        SELECT field_path, previous_value, new_value, confidence_score, changed_at, source_text
        FROM character_field_changes
        WHERE adventure_character_id = $1
        ORDER BY changed_at DESC
        LIMIT 50
      `;
      
      const changesResult = await db.query(changesQuery, [adventureCharacterId]);
      const recentChanges: CharacterFieldChange[] = changesResult.rows.map(row => ({
        fieldPath: row.field_path,
        previousValue: row.previous_value,
        newValue: row.new_value,
        confidenceScore: row.confidence_score,
        changedAt: new Date(row.changed_at),
        source: row.source_text
      }));
      
      // Get adventure message history (simplified for now)
      const adventureHistory: AdventureMessage[] = []; // TODO: Implement when adventure_messages table is available
      
      // Build established traits from character data
      const establishedTraits: Record<string, EstablishedTrait> = {};
      
      // Parse character fields into established traits
      ['appearance', 'personality', 'scents_aromas'].forEach(field => {
        if (character[field] && typeof character[field] === 'object') {
          this.flattenObjectToTraits(character[field], field, establishedTraits);
        }
      });
      
      return {
        adventureCharacterId,
        currentCharacterState: character,
        recentChanges,
        adventureHistory,
        establishedTraits,
        messageContext: messageContent
      };
      
    } catch (error) {
      console.error('Error building validation context:', error);
      throw error;
    }
  }

  /**
   * Helper to flatten nested objects into established traits
   */
  private static flattenObjectToTraits(
    obj: any,
    prefix: string,
    traits: Record<string, EstablishedTrait>,
    depth = 0
  ): void {
    
    if (depth > 3) return; // Prevent infinite recursion
    
    Object.entries(obj).forEach(([key, value]) => {
      const fullPath = `${prefix}.${key}`;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.flattenObjectToTraits(value, fullPath, traits, depth + 1);
      } else {
        traits[fullPath] = {
          value,
          confidence: 0.8, // High confidence for existing data
          establishedAt: new Date(), // TODO: Use actual creation date
          source: 'manual'
        };
      }
    });
  }
}