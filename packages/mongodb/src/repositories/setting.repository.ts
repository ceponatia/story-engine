import { getMongoConnection } from "../connection";
import {
  Setting,
  SettingFormData,
  SettingDocument,
  IMongoSettingRepository,
} from "@story-engine/types";
import { parseTagsFromString, BaseRepositoryImpl } from "@story-engine/utils";
import { ObjectId } from "mongodb";

/**
 * MongoDB Setting Repository
 *
 * Handles all database operations for Setting entities using MongoDB.
 * Implements SettingRepository interface for seamless compatibility.
 * Eliminates PostgreSQL array parsing complexity with native MongoDB arrays.
 */

export class MongoSettingRepository
  extends BaseRepositoryImpl<Setting, SettingFormData, SettingDocument>
  implements IMongoSettingRepository
{
  protected collectionName = "settings";
  async getByUser(userId: string): Promise<Setting[]> {
    const collection = getMongoConnection().getCollection<SettingDocument>(this.collectionName);
    const docs = await collection.find({ user_id: userId }).sort({ created_at: -1 }).toArray();

    return docs.map(this.mapDocumentToEntity);
  }

  async getById(id: string, userId: string): Promise<Setting | null> {
    const objectId = this.safeObjectId(id);
    if (!objectId) {
      return null;
    }

    const collection = getMongoConnection().getCollection<SettingDocument>(this.collectionName);
    const doc = await collection.findOne({
      _id: objectId,
      user_id: userId,
    });

    if (!doc) {
      return null;
    }

    return this.mapDocumentToEntity(doc);
  }

  async create(data: SettingFormData, userId: string): Promise<Setting> {
    const collection = getMongoConnection().getCollection<SettingDocument>(this.collectionName);
    const now = this.getCurrentTimestamp();

    const document: Omit<SettingDocument, "_id"> = {
      name: data.name,
      description: data.description || undefined,
      world_type: data.world_type || undefined,
      history: data.history || undefined,
      tags: data.tags ? parseTagsFromString(data.tags) : [],
      user_id: userId,
      created_at: now,
      updated_at: now,
    };

    const result = await collection.insertOne(document);
    return this.mapDocumentToEntity({ ...document, _id: result.insertedId });
  }

  async update(id: string, data: SettingFormData, userId: string): Promise<Setting | null> {
    const objectId = this.safeObjectId(id);
    if (!objectId) {
      return null;
    }

    const collection = getMongoConnection().getCollection<SettingDocument>(this.collectionName);
    const now = this.getCurrentTimestamp();

    const updateDocument: Partial<SettingDocument> = {
      name: data.name,
      description: data.description || undefined,
      world_type: data.world_type || undefined,
      history: data.history || undefined,
      tags: data.tags ? parseTagsFromString(data.tags) : [],
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

    const collection = getMongoConnection().getCollection<SettingDocument>(this.collectionName);
    const result = await collection.deleteOne({
      _id: objectId,
      user_id: userId,
    });

    return result.deletedCount > 0;
  }

  private mapDocumentToEntity(doc: SettingDocument): Setting {
    return {
      id: doc._id!.toHexString(),
      name: doc.name,
      description: doc.description,
      world_type: doc.world_type,
      history: doc.history,
      tags: doc.tags,
      private: false, // Default value for compatibility
      user_id: doc.user_id,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }
}
