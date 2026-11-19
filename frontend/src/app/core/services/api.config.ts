declare global {
  interface Window {
    RESTAURANT_API_URL?: string;
  }
}

export function getApiUrl(locationHostname = typeof window !== 'undefined' ? window.location.hostname : ''): string {
  const configured = (
    (typeof document !== 'undefined' ? document.querySelector('meta[name="api-url"]')?.getAttribute('content') : '') ||
    (typeof window !== 'undefined' ? window.RESTAURANT_API_URL : '') ||
    ''
  ).trim().replace(/\/+$/, '');

  const hostname = locationHostname.toLowerCase();
  return configured || (hostname === 'localhost' || hostname === '127.0.0.1' ? 'http://localhost:8000' : '');
}

export const API_URL = getApiUrl();
