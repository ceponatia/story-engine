import { ObjectId } from "mongodb";

/**
 * Base Repository Interface
 *
 * Defines the standard CRUD operations that all MongoDB repositories must implement.
 * Provides consistent method signatures across all entity repositories.
 */
export interface BaseRepository<TEntity, TFormData, TDocument> {
  /**
   * Find all entities belonging to a specific user
   */
  getByUser(userId: string): Promise<TEntity[]>;

  /**
   * Find a single entity by ID and user ID
   */
  getById(id: string, userId: string): Promise<TEntity | null>;

  /**
   * Create a new entity
   */
  create(data: TFormData, userId: string): Promise<TEntity>;

  /**
   * Update an existing entity
   */
  update(id: string, data: TFormData, userId: string): Promise<TEntity | null>;

  /**
   * Delete an entity by ID and user ID
   */
  delete(id: string, userId: string): Promise<boolean>;
}

/**
 * Base Repository Implementation
 *
 * Provides common utility methods and patterns for MongoDB repositories.
 */
export abstract class BaseRepositoryImpl<TEntity, TFormData, TDocument>
  implements BaseRepository<TEntity, TFormData, TDocument>
{
  protected abstract collectionName: string;

  abstract getByUser(userId: string): Promise<TEntity[]>;
  abstract getById(id: string, userId: string): Promise<TEntity | null>;
  abstract create(data: TFormData, userId: string): Promise<TEntity>;
  abstract update(id: string, data: TFormData, userId: string): Promise<TEntity | null>;
  abstract delete(id: string, userId: string): Promise<boolean>;

  /**
   * Abstract method to map MongoDB document to entity
   */
  protected abstract mapDocumentToEntity(doc: TDocument): TEntity;

  /**
   * Safely create ObjectId from string, returns null if invalid
   */
  protected safeObjectId(id: string): ObjectId | null {
    try {
      return new ObjectId(id);
    } catch {
      return null;
    }
  }

  /**
   * Get current timestamp for created_at/updated_at fields
   */
  protected getCurrentTimestamp(): Date {
    return new Date();
  }
}
