'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface StateUpdate {
  field: string
  value: unknown
  timestamp: string
  context?: string
}

export async function updateCharacterState(
  adventureId: string,
  updates: Record<string, unknown>,
  context?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  try {
    // Verify user owns this adventure
    const { data: adventure, error: adventureError } = await supabase
      .from('adventures')
      .select('id')
      .eq('id', adventureId)
      .eq('user_id', user.id)
      .single()

    if (adventureError || !adventure) {
      throw new Error('Adventure not found or not accessible')
    }

    // Get current character state
    const { data: character, error: characterError } = await supabase
      .from('adventure_characters')
      .select('*')
      .eq('adventure_id', adventureId)
      .single()

    if (characterError || !character) {
      throw new Error('Adventure character not found')
    }

    // Prepare state updates with timestamps
    const timestamp = new Date().toISOString()
    const stateUpdates: Record<string, StateUpdate> = {}

    Object.entries(updates).forEach(([field, value]) => {
      stateUpdates[field] = {
        field,
        value,
        timestamp,
        context: context || `Updated during adventure`
      }
    })

    // Merge with existing state_updates
    const currentStateUpdates = character.state_updates || {}
    const newStateUpdates = {
      ...currentStateUpdates,
      ...stateUpdates
    }

    // Update the character state
    const { error: updateError } = await supabase
      .from('adventure_characters')
      .update({
        state_updates: newStateUpdates,
        updated_at: timestamp
      })
      .eq('adventure_id', adventureId)

    if (updateError) throw updateError

    revalidatePath(`/adventures/${adventureId}/chat`)
    return { success: true, updates: stateUpdates }
  } catch (error) {
    console.error('Error updating character state:', error)
    throw error
  }
}

export async function getCharacterState(adventureId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  try {
    // Get character state
    const { data: character, error: characterError } = await supabase
      .from('adventure_characters')
      .select('*')
      .eq('adventure_id', adventureId)
      .single()

    if (characterError || !character) {
      throw new Error('Adventure character not found')
    }

    // Verify user owns this adventure (through character user_id)
    if (character.user_id !== user.id) {
      throw new Error('Not authorized to access this character')
    }

    return {
      success: true,
      character: {
        ...character,
        state_updates: character.state_updates || {}
      }
    }
  } catch (error) {
    console.error('Error getting character state:', error)
    throw error
  }
}

export async function buildCharacterContext(adventureId: string): Promise<string> {
  try {
    const result = await getCharacterState(adventureId)
    if (!result.success) {
      return ''
    }

    const character = result.character
    const stateUpdates = character.state_updates || {}

    // Build enhanced context string
    let context = `You are ${character.name}.`
    
    if (character.personality) {
      context += ` ${character.personality}`
    }
    
    if (character.background) {
      context += ` ${character.background}`
    }

    // Add current state from updates
    const currentState: string[] = []
    
    Object.entries(stateUpdates).forEach(([key, update]) => {
      if (update && typeof update === 'object' && 'value' in update && update.value) {
        currentState.push(`${key}: ${JSON.stringify(update.value)}`)
      }
    })

    if (currentState.length > 0) {
      context += `\n\nCurrent state: ${currentState.join(', ')}`
    }

    // Add appearance and fragrances if available
    if (character.appearance) {
      const appearance = typeof character.appearance === 'object' 
        ? character.appearance.description || JSON.stringify(character.appearance)
        : character.appearance
      context += `\nAppearance: ${appearance}`
    }

    if (character.fragrances) {
      const fragrances = typeof character.fragrances === 'object'
        ? JSON.stringify(character.fragrances)
        : character.fragrances
      context += `\nScents: ${fragrances}`
    }

    return context.trim()
  } catch (error) {
    console.error('Error building character context:', error)
    return ''
  }
}