export function applyFieldRules(field: string, value: any): any {
  if (typeof value === 'string') return value.trim();
  return value;
}
