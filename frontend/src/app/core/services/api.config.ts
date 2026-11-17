declare global {
  interface Window {
    RESTAURANT_API_URL?: string;
  }
}

export function getApiUrl(locationHostname = typeof window !== 'undefined' ? window.location.hostname : ''): string {
  const metaUrl = typeof document !== 'undefined'
    ? document.querySelector('meta[name="api-url"]')?.getAttribute('content')?.trim()
    : '';
  const windowUrl = typeof window !== 'undefined' ? window.RESTAURANT_API_URL?.trim() : '';
  const configuredUrl = metaUrl || windowUrl;

  if (configuredUrl) return configuredUrl.replace(/\/+$/, '');

  const hostname = locationHostname.toLowerCase();
  return hostname === 'localhost' || hostname === '127.0.0.1' ? 'http://localhost:8000' : '';
}

export const API_URL = getApiUrl();
