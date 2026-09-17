/**
 * CHAINTRACE // API Configuration & Base URL Resolver
 * Resolves the backend base URL for client and server fetch calls cleanly.
 */

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  return process.env.FASTAPI_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}
