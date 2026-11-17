import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { API_URL } from './api.service';

function makeJwt(expiresInSeconds: number | null): string {
  const payload = expiresInSeconds === null ? {} : { exp: Math.floor(Date.now() / 1000) + expiresInSeconds };
  const encoded = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `header.${encoded}.signature`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let store: { [key: string]: string };
  let originalStorage: PropertyDescriptor | undefined;

  beforeEach(() => {
    store = {};
    originalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => (key in store ? store[key] : null),
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        key: (index: number) => Object.keys(store)[index] ?? null,
        get length() { return Object.keys(store).length; },
      } as Storage,
    });

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: routerSpy }],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    if (originalStorage) {
      Object.defineProperty(window, 'localStorage', originalStorage);
    } else {
      Reflect.deleteProperty(window, 'localStorage');
    }
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login should POST credentials and store the returned token', () => {
    const token = makeJwt(3600);
    service.login('admin', 'secret').subscribe(res => {
      expect(res.access_token).toBe(token);
    });

    const req = httpMock.expectOne(`${API_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'admin', password: 'secret' });
    req.flush({ access_token: token, token_type: 'bearer' });
    expect(store['restaurant_token']).toBe(token);
  });

  it('login should not store a token when the request fails', () => {
    const onError = jasmine.createSpy('onError');
    service.login('admin', 'wrong').subscribe({ error: onError });

    httpMock.expectOne(`${API_URL}/auth/login`).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(onError).toHaveBeenCalled();
    expect(store['restaurant_token']).toBeUndefined();
  });

  it('logout should remove the token and navigate to the login route', () => {
    store['restaurant_token'] = makeJwt(3600);

    service.logout();

    expect(store['restaurant_token']).toBeUndefined();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/login']);
  });

  it('getToken should return the stored token or null', () => {
    expect(service.getToken()).toBeNull();
    const token = makeJwt(3600);
    store['restaurant_token'] = token;
    expect(service.getToken()).toBe(token);
  });

  it('getToken should remove and ignore a malformed token', () => {
    store['restaurant_token'] = 'not-a-jwt';

    expect(service.getToken()).toBeNull();
    expect(store['restaurant_token']).toBeUndefined();
  });

  it('getToken should remove and ignore an expired token', () => {
    store['restaurant_token'] = makeJwt(-60);

    expect(service.getToken()).toBeNull();
    expect(store['restaurant_token']).toBeUndefined();
  });

  it('getToken should remove and ignore a token without an expiry', () => {
    store['restaurant_token'] = makeJwt(null);

    expect(service.getToken()).toBeNull();
    expect(store['restaurant_token']).toBeUndefined();
  });

  it('isLoggedIn should reflect whether a valid token is stored', () => {
    expect(service.isLoggedIn()).toBeFalse();
    store['restaurant_token'] = makeJwt(3600);
    expect(service.isLoggedIn()).toBeTrue();
    store['restaurant_token'] = makeJwt(-60);
    expect(service.isLoggedIn()).toBeFalse();
  });
});
