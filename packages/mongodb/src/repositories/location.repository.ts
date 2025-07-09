import { getMongoConnection } from "../connection";
import {
  Location,
  LocationFormData,
  LocationDocument,
  IMongoLocationRepository,
} from "@story-engine/types";
import { parseTagsFromString, BaseRepositoryImpl } from "@story-engine/utils";
import { ObjectId } from "mongodb";

/**
 * MongoDB Location Repository
 *
 * Handles all database operations for Location entities using MongoDB.
 * Implements ILocationRepository interface for seamless compatibility.
 * Eliminates PostgreSQL array parsing complexity with native MongoDB arrays.
 */

// Helper function to parse array strings (for notable_features and connected_locations)
function parseArrayString(value: string | undefined): string[] {
  if (!value || value.trim() === "") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export class MongoLocationRepository
  extends BaseRepositoryImpl<Location, LocationFormData, LocationDocument>
  implements IMongoLocationRepository
{
  protected collectionName = "locations";
  async getByUser(userId: string): Promise<Location[]> {
    const collection = getMongoConnection().getCollection<LocationDocument>(this.collectionName);
    const docs = await collection.find({ user_id: userId }).sort({ created_at: -1 }).toArray();

    return docs.map(this.mapDocumentToEntity);
  }

  async getById(id: string, userId: string): Promise<Location | null> {
    const objectId = this.safeObjectId(id);
    if (!objectId) {
      return null;
    }

    const collection = getMongoConnection().getCollection<LocationDocument>(this.collectionName);
    const doc = await collection.findOne({
      _id: objectId,
      user_id: userId,
    });

    if (!doc) {
      return null;
    }

    return this.mapDocumentToEntity(doc);
  }

  async create(data: LocationFormData, userId: string): Promise<Location> {
    const collection = getMongoConnection().getCollection<LocationDocument>(this.collectionName);
    const now = this.getCurrentTimestamp();

    const document: Omit<LocationDocument, "_id"> = {
      name: data.name,
      description: data.description,
      notable_features: data.notable_features ? parseArrayString(data.notable_features) : [],
      connected_locations: data.connected_locations
        ? parseArrayString(data.connected_locations)
        : [],
      tags: data.tags ? parseTagsFromString(data.tags) : [],
      user_id: userId,
      created_at: now,
      updated_at: now,
    };

    const result = await collection.insertOne(document);
    return this.mapDocumentToEntity({ ...document, _id: result.insertedId });
  }

  async update(id: string, data: LocationFormData, userId: string): Promise<Location | null> {
    const objectId = this.safeObjectId(id);
    if (!objectId) {
      return null;
    }

    const collection = getMongoConnection().getCollection<LocationDocument>(this.collectionName);
    const now = this.getCurrentTimestamp();

    const updateDocument: Partial<LocationDocument> = {
      name: data.name,
      description: data.description,
      notable_features: data.notable_features ? parseArrayString(data.notable_features) : [],
      connected_locations: data.connected_locations
        ? parseArrayString(data.connected_locations)
        : [],
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

    const collection = getMongoConnection().getCollection<LocationDocument>(this.collectionName);
    const result = await collection.deleteOne({
      _id: objectId,
      user_id: userId,
    });

    return result.deletedCount > 0;
  }

  private mapDocumentToEntity(doc: LocationDocument): Location {
    return {
      id: doc._id!.toHexString(),
      name: doc.name,
      description: doc.description,
      notable_features: doc.notable_features,
      connected_locations: doc.connected_locations,
      tags: doc.tags,
      private: false, // Default value for compatibility
      user_id: doc.user_id,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }
}
