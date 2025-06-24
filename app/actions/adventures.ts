'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createAdventure(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const title = formData.get('title') as string
  const characterId = formData.get('characterId') as string
  const locationId = formData.get('locationId') as string
  const settingDescription = formData.get('settingDescription') as string

  if (!title || !characterId) {
    throw new Error('Title and character are required')
  }

  try {
    // Get the selected character data
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .eq('created_by', user.id)
      .single()

    if (characterError || !character) {
      throw new Error('Character not found or not accessible')
    }

    // Create the adventure
    const { data: adventure, error: adventureError } = await supabase
      .from('adventures')
      .insert({
        title,
        character_id: characterId,
        location_id: (locationId && locationId !== 'none') ? locationId : null,
        setting_description: settingDescription || null,
        user_id: user.id,
      })
      .select()
      .single()

    if (adventureError) throw adventureError

    // Map character data to adventure_characters schema
    const adventureCharacterData = {
      adventure_id: adventure.id,
      original_character_id: character.id,
      name: character.name,
      age: character.age,
      gender: character.gender,
      tags: character.tags ? [character.tags] : null, // Convert text to array
      appearance: character.appearance ? { description: character.appearance } : null, // Convert to jsonb
      fragrances: character.scents_aromas ? { scents: character.scents_aromas } : null, // Map scents_aromas to fragrances
      personality: character.personality,
      background: character.background,
      avatar_url: character.image_url, // Map image_url to avatar_url
      user_id: user.id,
    }

    // Copy character to adventure_characters
    const { error: characterCopyError } = await supabase
      .from('adventure_characters')
      .insert(adventureCharacterData)

    if (characterCopyError) throw characterCopyError

    // Create system prompt
    const systemPrompt = `You are ${character.name}. ${character.personality || ''} ${character.background || ''}`.trim()
    
    const { error: updateError } = await supabase
      .from('adventures')
      .update({ system_prompt: systemPrompt })
      .eq('id', adventure.id)

    if (updateError) throw updateError

    revalidatePath('/')
    redirect(`/adventures/${adventure.id}/chat`)
  } catch (error) {
    console.error('Error creating adventure:', error)
    throw error
  }
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const adventureId = formData.get('adventureId') as string
  const content = formData.get('content') as string

  if (!adventureId || !content) {
    throw new Error('Adventure ID and content are required')
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

    // Save user message
    const { data: newMessage, error: messageError } = await supabase
      .from('adventure_messages')
      .insert({
        adventure_id: adventureId,
        role: 'user',
        content: content.trim(),
        user_id: user.id,
      })
      .select()
      .single()

    if (messageError) throw messageError

    revalidatePath(`/adventures/${adventureId}/chat`)
    return { success: true, message: newMessage }
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}