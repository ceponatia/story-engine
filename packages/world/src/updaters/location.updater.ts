import type { Location, UpdateLocationRequest } from "../types/location.types";

/**
 * Updates location data with new values while preserving existing data
 */
export function updateLocationData(existing: Location, updates: UpdateLocationRequest): Location {
  const now = new Date().toISOString();

  return {
    ...existing,
    ...updates,
    // Merge arrays instead of replacing them completely
    features: updates.features
      ? [...(existing.features || []), ...updates.features]
      : existing.features,
    resources: updates.resources
      ? [...(existing.resources || []), ...updates.resources]
      : existing.resources,
    structures: updates.structures
      ? [...(existing.structures || []), ...updates.structures]
      : existing.structures,
    natural: updates.natural ? [...(existing.natural || []), ...updates.natural] : existing.natural,
    updatedAt: now,
  };
}

/**
 * Replaces location arrays completely instead of merging
 */
export function replaceLocationData(existing: Location, updates: UpdateLocationRequest): Location {
  const now = new Date().toISOString();

  return {
    ...existing,
    ...updates,
    updatedAt: now,
  };
}

/**
 * Removes duplicate values from location arrays
 */
export function deduplicateLocationArrays(location: Location): Location {
  return {
    ...location,
    features: location.features ? [...new Set(location.features)] : undefined,
    resources: location.resources ? [...new Set(location.resources)] : undefined,
    structures: location.structures ? [...new Set(location.structures)] : undefined,
    natural: location.natural ? [...new Set(location.natural)] : undefined,
  };
}
