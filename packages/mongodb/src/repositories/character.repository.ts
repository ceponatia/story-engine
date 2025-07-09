import { getMongoConnection } from "../connection";
import {
  Character,
  CharacterFormData,
  CharacterDocument,
  IMongoCharacterRepository,
} from "@story-engine/types";
import { parseAppearanceText, parsePersonalityText, parseScentsText } from "@story-engine/utils";
import { parseTagsFromString, BaseRepositoryImpl } from "@story-engine/utils";
import { ObjectId } from "mongodb";

/**
 * MongoDB Character Repository
 *
 * Handles all database operations for Character entities using MongoDB.
 * Implements ICharacterRepository interface for seamless compatibility.
 * Eliminates PostgreSQL JSONB parsing complexity with native MongoDB document structure.
 */

export class MongoCharacterRepository
  extends BaseRepositoryImpl<Character, CharacterFormData, CharacterDocument>
  implements IMongoCharacterRepository
{
  protected collectionName = "characters";
  async getByUser(userId: string): Promise<Character[]> {
    const collection = getMongoConnection().getCollection<CharacterDocument>(this.collectionName);
    const docs = await collection.find({ user_id: userId }).sort({ created_at: -1 }).toArray();

    return docs.map(this.mapDocumentToEntity);
  }

  async getById(id: string, userId: string): Promise<Character | null> {
    const objectId = this.safeObjectId(id);
    if (!objectId) {
      return null;
    }

    const collection = getMongoConnection().getCollection<CharacterDocument>(this.collectionName);
    const doc = await collection.findOne({
      _id: objectId,
      user_id: userId,
    });

    if (!doc) {
      return null;
    }

    return this.mapDocumentToEntity(doc);
  }

  async create(data: CharacterFormData, userId: string): Promise<Character> {
    const collection = getMongoConnection().getCollection<CharacterDocument>(this.collectionName);
    const now = this.getCurrentTimestamp();

    // Parse appearance into structured object
    const parsedAppearance = data.appearance ? parseAppearanceText(data.appearance) : {};

    // Parse personality into structured object
    const parsedPersonality = data.personality ? parsePersonalityText(data.personality) : {};

    // Parse scents & fragrances into structured object
    const parsedScents = data.scents_aromas ? parseScentsText(data.scents_aromas) : {};

    // Handle tags if provided
    const tagNames = data.tags ? parseTagsFromString(data.tags) : [];

    const document: Omit<CharacterDocument, "_id"> = {
      name: data.name,
      age: data.age || undefined,
      gender: data.gender || undefined,
      appearance: parsedAppearance,
      scents_aromas: parsedScents,
      personality: parsedPersonality,
      background: data.background || undefined,
      avatar_url: data.avatar_url || undefined,
      tags: tagNames,
      user_id: userId,
      created_at: now,
      updated_at: now,
    };

    const result = await collection.insertOne(document);
    return this.mapDocumentToEntity({ ...document, _id: result.insertedId });
  }

  async update(id: string, data: CharacterFormData, userId: string): Promise<Character | null> {
    const objectId = this.safeObjectId(id);
    if (!objectId) {
      return null;
    }

    const collection = getMongoConnection().getCollection<CharacterDocument>(this.collectionName);
    const now = this.getCurrentTimestamp();

    // Parse appearance into structured object
    const parsedAppearance = data.appearance ? parseAppearanceText(data.appearance) : {};

    // Parse personality into structured object
    const parsedPersonality = data.personality ? parsePersonalityText(data.personality) : {};

    // Parse scents & fragrances into structured object
    const parsedScents = data.scents_aromas ? parseScentsText(data.scents_aromas) : {};

    // Handle tags if provided
    const tagNames = data.tags ? parseTagsFromString(data.tags) : [];

    const updateDocument: Partial<CharacterDocument> = {
      name: data.name,
      age: data.age || undefined,
      gender: data.gender || undefined,
      appearance: parsedAppearance,
      scents_aromas: parsedScents,
      personality: parsedPersonality,
      background: data.background || undefined,
      avatar_url: data.avatar_url || undefined,
      tags: tagNames,
      updated_at: now,
    };

    const result = await collection.findOneAndUpdate(
      { _id: objectId, user_id: userId },
      { $set: updateDocument },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return null;
    }

    return this.mapDocumentToEntity(result.value);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const objectId = this.safeObjectId(id);
    if (!objectId) {
      return false;
    }

    const collection = getMongoConnection().getCollection<CharacterDocument>(this.collectionName);
    const result = await collection.deleteOne({
      _id: objectId,
      user_id: userId,
    });

    return result.deletedCount > 0;
  }

  async getTags(characterId: string): Promise<string[]> {
    const objectId = this.safeObjectId(characterId);
    if (!objectId) {
      return [];
    }

    const collection = getMongoConnection().getCollection<CharacterDocument>(this.collectionName);
    const doc = await collection.findOne({ _id: objectId });

    return doc?.tags || [];
  }

  async updateTags(characterId: string, tagNames: string[]): Promise<void> {
    const objectId = this.safeObjectId(characterId);
    if (!objectId) {
      return;
    }

    const collection = getMongoConnection().getCollection<CharacterDocument>(this.collectionName);
    await collection.updateOne(
      { _id: objectId },
      { $set: { tags: tagNames, updated_at: this.getCurrentTimestamp() } }
    );
  }

  private mapDocumentToEntity(doc: CharacterDocument): Character {
    return {
      id: doc._id!.toHexString(),
      name: doc.name,
      age: doc.age,
      gender: doc.gender,
      appearance: doc.appearance,
      scents_aromas: doc.scents_aromas,
      personality: doc.personality,
      background: doc.background,
      avatar_url: doc.avatar_url,
      tags: doc.tags ? doc.tags.join(", ") : "", // Convert tags array to comma-separated string for form compatibility
      private: false, // Default value for compatibility
      created_by: doc.user_id, // Map user_id back to created_by field name
      user_id: doc.user_id,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }
}
