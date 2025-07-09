export function validateUpdateKeys(fields: any, allowedKeys: string[]): void {
  Object.keys(fields).forEach(key => {
    if (!allowedKeys.includes(key)) {
      throw new Error(`Invalid field: ${key}`);
    }
  });
}
