/**
 * Base Updater Utilities
 *
 * Generic update patterns and merge strategies.
 */

export interface UpdateResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  warnings?: string[];
  changes?: string[];
}

export interface UpdateOptions {
  strict?: boolean;
  preserveUndefined?: boolean;
  deepMerge?: boolean;
  allowedFields?: string[];
  forbiddenFields?: string[];
  trackChanges?: boolean;
}

export abstract class BaseUpdater<T> {
  protected options: UpdateOptions;

  constructor(options: UpdateOptions = {}) {
    this.options = {
      strict: false,
      preserveUndefined: false,
      deepMerge: true,
      trackChanges: true,
      ...options,
    };
  }

  /**
   * Abstract update method to be implemented by subclasses
   */
  abstract update(existing: T, updates: Partial<T>): UpdateResult<T>;

  /**
   * Safe update with error handling
   */
  safeUpdate(existing: T, updates: Partial<T>): UpdateResult<T> {
    try {
      return this.update(existing, updates);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown update error";
      return {
        success: false,
        errors: [errorMessage],
      };
    }
  }

  /**
   * Validate update fields
   */
  protected validateFields(updates: Partial<T>): string[] {
    const errors: string[] = [];
    const updateKeys = Object.keys(updates);

    // Check allowed fields
    if (this.options.allowedFields) {
      for (const key of updateKeys) {
        if (!this.options.allowedFields.includes(key)) {
          errors.push(`Field '${key}' is not allowed for updates`);
        }
      }
    }

    // Check forbidden fields
    if (this.options.forbiddenFields) {
      for (const key of updateKeys) {
        if (this.options.forbiddenFields.includes(key)) {
          errors.push(`Field '${key}' is forbidden for updates`);
        }
      }
    }

    return errors;
  }

  /**
   * Deep merge two objects
   */
  protected deepMerge<U>(target: U, source: Partial<U>): U {
    const result = { ...target };

    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (sourceValue === undefined && !this.options.preserveUndefined) {
        continue;
      }

      if (this.isObject(sourceValue) && this.isObject(targetValue)) {
        result[key] = this.deepMerge(targetValue, sourceValue as any);
      } else {
        result[key] = sourceValue as any;
      }
    }

    return result;
  }

  /**
   * Shallow merge two objects
   */
  protected shallowMerge<U>(target: U, source: Partial<U>): U {
    const result = { ...target };

    for (const key in source) {
      const sourceValue = source[key];

      if (sourceValue === undefined && !this.options.preserveUndefined) {
        continue;
      }

      result[key] = sourceValue as any;
    }

    return result;
  }

  /**
   * Track changes between objects
   */
  protected trackChanges<U>(original: U, updated: U): string[] {
    if (!this.options.trackChanges) {
      return [];
    }

    const changes: string[] = [];

    // Check all keys in updated object
    for (const key in updated) {
      const originalValue = original[key];
      const updatedValue = updated[key];

      if (!this.deepEqual(originalValue, updatedValue)) {
        changes.push(
          `Changed ${String(key)}: ${JSON.stringify(originalValue)} → ${JSON.stringify(updatedValue)}`
        );
      }
    }

    return changes;
  }

  /**
   * Update array field with various strategies
   */
  protected updateArrayField<U>(
    existing: U[],
    updates: U[],
    strategy: "replace" | "append" | "merge" | "prepend" = "replace"
  ): U[] {
    switch (strategy) {
      case "replace":
        return updates;

      case "append":
        return [...existing, ...updates];

      case "prepend":
        return [...updates, ...existing];

      case "merge":
        const merged = [...existing];
        for (const update of updates) {
          if (!merged.some((item) => this.deepEqual(item, update))) {
            merged.push(update);
          }
        }
        return merged;

      default:
        return updates;
    }
  }

  /**
   * Update field with validation
   */
  protected updateField<U>(
    fieldName: string,
    existingValue: U,
    newValue: U,
    validator?: (value: U) => string | null
  ): { value: U; error?: string } {
    if (validator) {
      const error = validator(newValue);
      if (error) {
        return { value: existingValue, error };
      }
    }

    return { value: newValue };
  }

  /**
   * Create success result
   */
  protected createSuccessResult(data: T, changes?: string[], warnings?: string[]): UpdateResult<T> {
    return {
      success: true,
      data,
      changes,
      warnings,
    };
  }

  /**
   * Create error result
   */
  protected createErrorResult(errors: string[], warnings?: string[]): UpdateResult<T> {
    return {
      success: false,
      errors,
      warnings,
    };
  }

  /**
   * Check if value is an object
   */
  private isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  /**
   * Deep equality check
   */
  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;

    if (a === null || b === null) return false;
    if (a === undefined || b === undefined) return false;

    if (typeof a !== typeof b) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => this.deepEqual(item, b[index]));
    }

    if (this.isObject(a) && this.isObject(b)) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) return false;

      return keysA.every((key) => keysB.includes(key) && this.deepEqual(a[key], b[key]));
    }

    return false;
  }
}
