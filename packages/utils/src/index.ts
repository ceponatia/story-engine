// Utilities (placeholder)
export const nowIso = () => new Date().toISOString()
export class AppError extends Error { constructor(message: string){ super(message); this.name = 'AppError' } }
