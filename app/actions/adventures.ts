'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { 
  createAdventure as dbCreateAdventure,
  createAdventureCharacter,
  updateAdventureSystemPrompt,
  getCharacterById,
  createAdventureMessage,
  getAdventureById
} from '@/lib/database/queries'
import { requireAuth } from '@/lib/auth-helper'
import { buildSystemPrompt } from '@/lib/prompts/templates'
import { buildOptimizedSystemPrompt } from '@/lib/prompts/optimized-templates'
import { getAIConfig } from '@/lib/config/validation'

export async function createAdventure(formData: FormData) {
  const { user } = await requireAuth()

  const title = formData.get('title') as string
  const characterId = formData.get('characterId') as string
  const locationId = formData.get('locationId') as string
  const settingId = formData.get('settingId') as string
  const name = formData.get('name') as string
  const adventureType = formData.get('adventureType') as string
  const initialMessage = formData.get('initialMessage') as string

  if (!title || !characterId || !name || !adventureType || !initialMessage) {
    throw new Error('Title, character, name, adventure type, and initial message are required')
  }

  try {
    // Step 1: Validate character access (required first)
    const character = await getCharacterById(characterId, user.id)
    
    if (!character) {
      throw new Error('Character not found or not accessible')
    }

    // Step 2: Create adventure and character copy in parallel
    const [adventure] = await Promise.all([
      dbCreateAdventure(
        title,
        characterId,
        (locationId && locationId !== 'none') ? locationId : null,
        (settingId && settingId !== 'none') ? settingId : null,
        user.id,
        name,
        adventureType
      )
    ])

    // Step 3: Create adventure character (depends on adventure.id)
    await createAdventureCharacter(
      adventure.id,
      character.id,
      {
        name: character.name,
        age: character.age,
        gender: character.gender,
        appearance: character.appearance,
        scents_aromas: character.scents_aromas,
        personality: character.personality,
        background: character.background,
        avatar_url: character.avatar_url
      },
      user.id
    )

    // Step 4: Parallelize final operations (system prompt, speakers, initial message)
    const aiConfig = getAIConfig()
    const promptContext = {
      character: {
        name: character.name,
        age: character.age,
        gender: character.gender,
        personality: character.personality,
        background: character.background,
        appearance: character.appearance,
        scents_aromas: character.scents_aromas,
        description: character.description
      },
      setting: null, // TODO: Get setting data if provided
      location: null, // TODO: Get location data if provided  
      userName: name,
      adventureTitle: title
    }
    
    // Use optimized templates if feature flag is enabled
    const systemPrompt = aiConfig.useOptimizedTemplates 
      ? buildOptimizedSystemPrompt(adventureType as 'romance' | 'action', promptContext)
      : buildSystemPrompt(adventureType as 'romance' | 'action' | 'adventure' | 'mystery', promptContext)
    
    // Update system prompt
    await updateAdventureSystemPrompt(adventure.id, systemPrompt)

    // Step 5: Create initial message
    await createAdventureMessage(
      adventure.id,
      'assistant', // Character's message
      initialMessage,
      user.id // Adventure creator's user ID for tracking
    )

    revalidatePath('/')
    redirect(`/adventures/${adventure.id}/chat`)
  } catch (error) {
    console.error('Error creating adventure:', error)
    throw error
  }
}

export async function sendMessage(formData: FormData) {
  const { user } = await requireAuth()

  const adventureId = formData.get('adventureId') as string
  const content = formData.get('content') as string

  if (!adventureId || !content) {
    throw new Error('Adventure ID and content are required')
  }

  try {
    // Verify user owns this adventure
    const adventure = await getAdventureById(adventureId, user.id)

    if (!adventure) {
      throw new Error('Adventure not found or not accessible')
    }

    // Save user message
    const newMessage = await createAdventureMessage(
      adventureId,
      'user',
      content.trim(),
      user.id
    )

    revalidatePath(`/adventures/${adventureId}/chat`)
    return { success: true, message: newMessage }
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}