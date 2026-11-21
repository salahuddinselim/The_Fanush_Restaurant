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

  if (configured) return configured;

  const hostname = (locationHostname || 'localhost').toLowerCase();
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  if (
    /^192\.168\.\d+\.\d+$/.test(hostname) ||
    /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(hostname) ||
    hostname.endsWith('.local')
  ) {
    return `http://${hostname}:8000`;
  }

  return '';
}
