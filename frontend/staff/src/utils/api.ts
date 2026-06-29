const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function getApiUrl(path: string): string {
  if (!API_BASE_URL) return path;
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  return `${base}${endpoint}`;
}

export { API_BASE_URL };
