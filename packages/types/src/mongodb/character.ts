import { ObjectId } from "mongodb";
import { Character, CharacterFormData } from "../entities/character";

// MongoDB-specific Character document type
export interface CharacterDocument {
  _id?: ObjectId;
  name: string;
  age?: number;
  gender?: string;
  appearance?: Record<string, any>;
  scents_aromas?: Record<string, any>;
  personality?: Record<string, any>;
  background?: string;
  avatar_url?: string;
  tags?: string[];
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

// MongoDB-specific Character repository interface
export interface IMongoCharacterRepository {
  getByUser(userId: string): Promise<Character[]>;
  getById(id: string, userId: string): Promise<Character | null>;
  create(data: CharacterFormData, userId: string): Promise<Character>;
  update(id: string, data: CharacterFormData, userId: string): Promise<Character | null>;
  delete(id: string, userId: string): Promise<boolean>;
  getTags(characterId: string): Promise<string[]>;
  updateTags(characterId: string, tagNames: string[]): Promise<void>;
}
