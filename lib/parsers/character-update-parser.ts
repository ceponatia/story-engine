import { UnifiedParserResult } from './unified-parser';
import { 
  parseAppearanceText, 
  appearanceToText, 
  parsePersonalityText, 
  personalityToText, 
  parseScentsText, 
  scentsToText, 
  type ParsedAppearance, 
  type ParsedPersonality, 
  type ParsedScents 
} from './unified-parser';

// Helper function to detect field type from text or field name
export function getFieldType(text: string): 'appearance' | 'personality' | 'scents' | 'other' {
  const lower = text.toLowerCase()
  
  // Appearance indicators
  if (lower.includes('hair') || lower.includes('eye') || lower.includes('skin') || 
      lower.includes('height') || lower.includes('build') || lower.includes('clothes') ||
      lower.includes('appearance') || lower.includes('looks') || lower.includes('face')) {
    return 'appearance'
  }
  
  // Personality indicators
  if (lower.includes('personality') || lower.includes('trait') || lower.includes('behavior') ||
      lower.includes('mood') || lower.includes('emotion') || lower.includes('feel')) {
    return 'personality'
  }
  
  // Scents indicators
  if (lower.includes('smell') || lower.includes('scent') || lower.includes('aroma') || 
      lower.includes('fragrance') || lower.includes('perfume')) {
    return 'scents'
  }
  
  return 'other'
}

/**
 * Parse natural language character updates into structured JSONB
 * This function helps convert LLM responses like "My hair is now blonde" 
 * into structured data for the database
 */
export function parseCharacterUpdate(text: string, fieldType: 'appearance' | 'personality' | 'scents' | 'auto'): {
  fieldType: 'appearance' | 'personality' | 'scents'
  parsedData: UnifiedParserResult
  naturalText: string
} | null {
  if (!text || text.trim() === '') {
    return null
  }

  // Auto-detect field type if not specified
  let detectedType: 'appearance' | 'personality' | 'scents' = fieldType === 'auto' ? 'appearance' : fieldType
  if (fieldType === 'auto') {
    const autoDetected = getFieldType(text)
    if (autoDetected === 'other') {
      // Default to appearance for ambiguous text
      detectedType = 'appearance'
    } else {
      detectedType = autoDetected
    }
  }

  try {
    let parsedData: ParsedAppearance | ParsedPersonality | ParsedScents
    let naturalText: string

    switch (detectedType) {
      case 'appearance':
        parsedData = parseAppearanceText(text)
        naturalText = appearanceToText(parsedData)
        break
      case 'personality':
        parsedData = parsePersonalityText(text)
        naturalText = personalityToText(parsedData)
        break
      case 'scents':
        parsedData = parseScentsText(text)
        naturalText = scentsToText(parsedData)
        break
      default:
        return null
    }

    // Only return if we actually parsed something meaningful
    if (Object.keys(parsedData).length > 0) {
      return {
        fieldType: detectedType,
        parsedData,
        naturalText
      }
    }
  } catch (error) {
    console.error(`Error parsing character update for ${detectedType}:`, error)
  }

  return null
}