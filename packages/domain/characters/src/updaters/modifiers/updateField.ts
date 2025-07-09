import { applyFieldRules } from './applyFieldRules';

export function updateField(baseFields: any, field: string, value: any): any {
  const newValue = applyFieldRules(field, value);
  return { ...baseFields, [field]: newValue };
}
