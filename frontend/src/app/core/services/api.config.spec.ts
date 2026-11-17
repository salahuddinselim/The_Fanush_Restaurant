import { getApiUrl } from './api.config';

describe('getApiUrl', () => {
  const originalWindowApiUrl = (window as any).RESTAURANT_API_URL;

  function setMeta(content: string): void {
    const meta = document.createElement('meta');
    meta.name = 'api-url';
    meta.content = content;
    document.head.appendChild(meta);
  }

  beforeEach(() => {
    document.querySelector('meta[name="api-url"]')?.remove();
    delete (window as any).RESTAURANT_API_URL;
  });

  afterEach(() => {
    document.querySelector('meta[name="api-url"]')?.remove();
    if (originalWindowApiUrl === undefined) {
      delete (window as any).RESTAURANT_API_URL;
    } else {
      (window as any).RESTAURANT_API_URL = originalWindowApiUrl;
    }
  });

  it('uses the meta api-url value and removes a trailing slash', () => {
    setMeta('https://api.example.com/');

    expect(getApiUrl('example.com')).toBe('https://api.example.com');
  });

  it('uses the window override when no meta tag exists', () => {
    (window as any).RESTAURANT_API_URL = 'https://api.override.example.com/';

    expect(getApiUrl('example.com')).toBe('https://api.override.example.com');
  });

  it('prefers the meta tag over the window override', () => {
    setMeta('https://api.meta.example.com');
    (window as any).RESTAURANT_API_URL = 'https://api.window.example.com';

    expect(getApiUrl('example.com')).toBe('https://api.meta.example.com');
  });

  it('uses the localhost backend during local development', () => {
    expect(getApiUrl('localhost')).toBe('http://localhost:8000');
    expect(getApiUrl('127.0.0.1')).toBe('http://localhost:8000');
  });

  it('uses a same-origin API outside local development', () => {
    expect(getApiUrl('restaurant.example.com')).toBe('');
  });
});
