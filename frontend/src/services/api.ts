const API_ORIGIN = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin.replace(':6172', ':6171') : 'http://localhost:6171');

export function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = cleanEndpoint.startsWith('/api') 
    ? `${API_ORIGIN}${cleanEndpoint}` 
    : `${API_ORIGIN}/api${cleanEndpoint}`;

  return fetch(url, options);
}
