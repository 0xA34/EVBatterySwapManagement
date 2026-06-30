/**
 * Utility to get the base API URL or build full API endpoints.
 * This supports changing the domain easily in the future via environment variables
 * or by updating the fallback value below.
 */

// Reads from Vite environment variable, or falls back to localhost:8080
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Builds a complete API URL given a path.
 * 
 * @param path The endpoint path, e.g., '/api/staff/stations' or 'api/auth/login'
 * @returns The complete URL string
 */
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${cleanBase}${cleanPath}`;
};
