// Database-agnostic Character entity types

export interface Character {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  appearance?: Record<string, any>;
  scents_aromas?: Record<string, any>;
  personality?: Record<string, any>;
  background?: string;
  avatar_url?: string;
  tags: string;
  private: boolean;
  created_by: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CharacterFormData {
  name: string;
  age?: number;
  gender?: string;
  appearance?: string;
  scents_aromas?: string;
  personality?: string;
  background?: string;
  avatar_url?: string;
  tags?: string;
}
