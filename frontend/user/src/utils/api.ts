/**
 * API utility for constructing full API URLs.
 * In development, Vite proxy handles /api requests.
 * In production, uses VITE_API_BASE_URL from environment.
 */

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Constructs a full API URL by prepending the base URL.
 * @param path - The API endpoint path (e.g., '/api/auth/login')
 * @returns The full URL string
 */
export function getApiUrl(path: string): string {
  // In development (with Vite proxy), API_BASE_URL is empty so we just use the path directly.
  // In production, API_BASE_URL points to the backend server.
  if (!API_BASE_URL) {
    return path;
  }
  // Avoid double slashes
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  return `${base}${endpoint}`;
}

export { API_BASE_URL };
