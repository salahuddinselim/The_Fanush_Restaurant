import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../services/auth.service';
import { API_URL } from '../services/api.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getToken', 'logout']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should add a Bearer Authorization header when a token exists', () => {
    authSpy.getToken.and.returnValue('token-abc');

    http.get('/api/data').subscribe();
    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-abc');
    req.flush({});
  });

  it('should leave the Authorization header absent when no token exists', () => {
    authSpy.getToken.and.returnValue(null);

    http.get('/api/data').subscribe();
    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should logout and rethrow when a request returns 401', () => {
    authSpy.getToken.and.returnValue('token-abc');
    const onError = jasmine.createSpy('onError');

    http.get('/api/data').subscribe({ error: onError });
    httpMock.expectOne('/api/data').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authSpy.logout).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.calls.mostRecent().args[0].status).toBe(401);
  });

  it('should not logout when a non-auth request returns 500', () => {
    authSpy.getToken.and.returnValue('token-abc');

    http.get('/api/data').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/data').flush('boom', { status: 500, statusText: 'Server Error' });

    expect(authSpy.logout).not.toHaveBeenCalled();
  });

  it('should not logout when the login request returns 401', () => {
    authSpy.getToken.and.returnValue(null);

    http.post(`${API_URL}/auth/login`, {}).subscribe({ error: () => undefined });
    httpMock.expectOne(`${API_URL}/auth/login`).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authSpy.logout).not.toHaveBeenCalled();
  });
});
