// Safe ID generator with fallback for older browsers
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${Math.random().toString(36).substring(2, 9)}`;
}

// Generate a short ID for display purposes
export function generateShortId(prefix = ''): string {
  const short = Math.random().toString(36).substring(2, 8).toUpperCase();
  return prefix ? `${prefix}-${short}` : short;
}
