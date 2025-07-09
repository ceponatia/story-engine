export function mergeCharacterStates(base: any, updates: any): any {
  return {
    ...base,
    ...updates,
    fields: {
      ...base.fields,
      ...updates.fields
    }
  };
}
