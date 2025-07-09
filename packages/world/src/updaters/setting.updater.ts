import type { Setting, UpdateSettingRequest } from "../types/setting.types";

/**
 * Updates setting data with new values while preserving existing data
 */
export function updateSettingData(existing: Setting, updates: UpdateSettingRequest): Setting {
  const now = new Date().toISOString();

  return {
    ...existing,
    ...updates,
    // Merge arrays instead of replacing them completely
    elements: updates.elements
      ? [...(existing.elements || []), ...updates.elements]
      : existing.elements,
    political: updates.political
      ? [...(existing.political || []), ...updates.political]
      : existing.political,
    cultural: updates.cultural
      ? [...(existing.cultural || []), ...updates.cultural]
      : existing.cultural,
    economic: updates.economic
      ? [...(existing.economic || []), ...updates.economic]
      : existing.economic,
    history: updates.history ? [...(existing.history || []), ...updates.history] : existing.history,
    updatedAt: now,
  };
}

/**
 * Replaces setting arrays completely instead of merging
 */
export function replaceSettingData(existing: Setting, updates: UpdateSettingRequest): Setting {
  const now = new Date().toISOString();

  return {
    ...existing,
    ...updates,
    updatedAt: now,
  };
}

/**
 * Removes duplicate values from setting arrays
 */
export function deduplicateSettingArrays(setting: Setting): Setting {
  return {
    ...setting,
    elements: setting.elements ? [...new Set(setting.elements)] : undefined,
    political: setting.political ? [...new Set(setting.political)] : undefined,
    cultural: setting.cultural ? [...new Set(setting.cultural)] : undefined,
    economic: setting.economic ? [...new Set(setting.economic)] : undefined,
    history: setting.history ? [...new Set(setting.history)] : undefined,
  };
}
