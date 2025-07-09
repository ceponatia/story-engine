/**
 * Repository Interface
 *
 * Simplified repository interfaces for actual usage in the Story Engine.
 * Provides basic CRUD operations without over-engineering.
 */

// Basic Repository Interface
export interface IRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findByUser(userId: string): Promise<T[]>;
  create(data: CreateDTO<T>): Promise<T>;
  update(id: ID, data: UpdateDTO<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}

// Data Transfer Object Types
export type CreateDTO<T> = Omit<T, "id" | "created_at" | "updated_at">;
export type UpdateDTO<T> = Partial<Omit<T, "id" | "created_at" | "updated_at">>;
