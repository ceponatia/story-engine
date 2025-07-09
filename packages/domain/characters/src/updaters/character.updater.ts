import { mergeCharacterStates } from "./modifiers/mergeCharacterStates";
import { updateField } from "./modifiers/updateField";
import { validateUpdateKeys } from "@story-engine/validation";

const allowedKeys = ["name", "description", "tags", "fields"];

export function updateCharacter(base: any, updates: any): any {
  validateUpdateKeys(updates, allowedKeys);

  const merged = mergeCharacterStates(base, updates);

  const updatedFields = Object.entries(merged.fields).reduce((acc, [key, val]) => {
    return updateField(acc, key, val);
  }, {});

  return {
    ...merged,
    fields: updatedFields,
    updatedAt: new Date().toISOString(),
  };
}
