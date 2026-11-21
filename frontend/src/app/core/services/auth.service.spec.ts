import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { API_URL } from './api.service';

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
    httpMock.verify();
    if (originalStorage) {
      Object.defineProperty(window, 'localStorage', originalStorage);
    } else {
      Reflect.deleteProperty(window, 'localStorage');
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login should POST credentials with cookies and mark the session as active', () => {
    service.login('admin', 'secret').subscribe(res => {
      expect(res.detail).toBe('Logged in');
      expect('access_token' in res).toBeFalse();
    });

    const req = httpMock.expectOne(`${API_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    expect(req.request.body).toEqual({ username: 'admin', password: 'secret' });
    req.flush({ detail: 'Logged in' });

    expect(store['restaurant_session']).toBe('1');
    expect(Number(store['restaurant_session_exp'])).toBeGreaterThan(Date.now());
  });

  it('login should not start a session when the request fails', () => {
    const onError = jasmine.createSpy('onError');
    service.login('admin', 'wrong').subscribe({ error: onError });

    httpMock.expectOne(`${API_URL}/auth/login`).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(onError).toHaveBeenCalled();
    expect(store['restaurant_session']).toBeUndefined();
  });

  it('logout should clear the local session, call the server and navigate immediately', () => {
    store['restaurant_session'] = '1';
    store['restaurant_session_exp'] = String(Date.now() + 60_000);

    service.logout();

    expect(store['restaurant_session']).toBeUndefined();
    expect(store['restaurant_session_exp']).toBeUndefined();
    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/admin/login']);

    const req = httpMock.expectOne(`${API_URL}/auth/logout`);
    expect(req.request.withCredentials).toBeTrue();
    req.flush({});
  });

  it('logout should navigate even when the server request fails', () => {
    service.logout();
    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/admin/login']);
    httpMock.expectOne(`${API_URL}/auth/logout`).flush('error', { status: 500, statusText: 'Server Error' });
  });

  it('getToken should stay null because the JWT lives in an httpOnly cookie', () => {
    expect(service.getToken()).toBeNull();
    store['restaurant_session'] = '1';
    expect(service.getToken()).toBeNull();
  });

  it('isLoggedIn should reflect whether a valid session flag is stored', () => {
    expect(service.isLoggedIn()).toBeFalse();
    store['restaurant_session'] = '1';
    store['restaurant_session_exp'] = String(Date.now() + 60_000);
    expect(service.isLoggedIn()).toBeTrue();
    store['restaurant_session_exp'] = String(Date.now() - 60_000);
    expect(service.isLoggedIn()).toBeFalse();
    expect(store['restaurant_session']).toBeUndefined();
  });

  it('verify should resolve true when the cookie is accepted by the server', () => {
    let result: boolean | undefined;
    service.verify().subscribe(v => result = v);
    httpMock.expectOne(`${API_URL}/auth/me`).flush({ username: 'admin' });
    expect(result).toBeTrue();
  });

  it('verify should clear the local session and resolve false when the cookie is rejected', () => {
    store['restaurant_session'] = '1';
    let result: boolean | undefined;
    service.verify().subscribe(v => result = v);
    httpMock.expectOne(`${API_URL}/auth/me`).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(result).toBeFalse();
    expect(store['restaurant_session']).toBeUndefined();
  });
});
