import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError, Subject } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { API_URL } from '../../core/services/api.service';

const TOKEN_RESPONSE = { access_token: 'test-token', token_type: 'Bearer' };

type TokenResponse = { access_token: string; token_type: string };

function buildAuthSpy(): jasmine.SpyObj<AuthService> {
  const spy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
  spy.login.and.returnValue(of(TOKEN_RESPONSE));
  return spy;
}

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authSpy: jasmine.SpyObj<AuthService>;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    authSpy = buildAuthSpy();
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    navigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an invalid empty form', () => {
    expect(component.form.invalid).toBeTrue();
    expect(component.form.get('username')!.invalid).toBeTrue();
    expect(component.form.get('password')!.invalid).toBeTrue();
  });

  it('should not call login when the form is invalid', () => {
    component.submit();
    expect(authSpy.login).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should call login with the expected credentials when the form is valid', () => {
    component.form.setValue({ username: 'admin', password: 'secret' });
    component.submit();
    expect(authSpy.login).toHaveBeenCalledOnceWith('admin', 'secret');
  });

  it('should navigate to the dashboard on successful login', () => {
    component.form.setValue({ username: 'admin', password: 'secret' });
    component.submit();
    expect(navigateSpy).toHaveBeenCalledOnceWith(['/admin/dashboard']);
  });

  it('should set loading and clear error while login is in flight', () => {
    const pending = new Subject<TokenResponse>();
    authSpy.login.and.returnValue(pending.asObservable());
    component.error = 'previous error';
    component.form.setValue({ username: 'admin', password: 'secret' });
    component.submit();
    expect(component.loading).toBeTrue();
    expect(component.error).toBe('');
    pending.next(TOKEN_RESPONSE);
    pending.complete();
    expect(navigateSpy).toHaveBeenCalled();
  });

  it('should show an error and reset loading when login fails', () => {
    authSpy.login.and.returnValue(throwError(() => new Error('401')));
    component.form.setValue({ username: 'admin', password: 'wrong' });
    component.submit();
    expect(component.error).toBe('Invalid username or password');
    expect(component.loading).toBeFalse();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should render the error message in the template after a failed login', () => {
    authSpy.login.and.returnValue(throwError(() => new Error('401')));
    component.form.setValue({ username: 'admin', password: 'wrong' });
    component.submit();
    fixture.detectChanges();
    const errorEl = fixture.nativeElement.querySelector('.login-error') as HTMLElement;
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toContain('Invalid username or password');
  });

  it('should clear a previous error on a new submit', () => {
    authSpy.login.and.returnValue(throwError(() => new Error('401')));
    component.form.setValue({ username: 'admin', password: 'wrong' });
    component.submit();
    expect(component.error).toBe('Invalid username or password');
    authSpy.login.and.returnValue(of(TOKEN_RESPONSE));
    component.submit();
    expect(component.error).toBe('');
  });

  it('should disable the submit button while loading', () => {
    const pending = new Subject<TokenResponse>();
    authSpy.login.and.returnValue(pending.asObservable());
    component.form.setValue({ username: 'admin', password: 'secret' });
    component.submit();
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBeTrue();
  });
});

describe('LoginComponent with real AuthService', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let httpMock: HttpTestingController;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    localStorage.removeItem('restaurant_token');
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    navigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('restaurant_token');
  });

  it('should post credentials, store the access token, and navigate on success', () => {
    component.form.setValue({ username: 'admin', password: 'secret' });
    component.submit();
    const req = httpMock.expectOne(`${API_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'admin', password: 'secret' });
    req.flush(TOKEN_RESPONSE);
    expect(localStorage.getItem('restaurant_token')).toBe('test-token');
    expect(navigateSpy).toHaveBeenCalledOnceWith(['/admin/dashboard']);
  });

  it('should not persist a token when the backend rejects the login', () => {
    component.form.setValue({ username: 'admin', password: 'wrong' });
    component.submit();
    const req = httpMock.expectOne(`${API_URL}/auth/login`);
    req.flush({ detail: 'invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    expect(localStorage.getItem('restaurant_token')).toBeNull();
    expect(component.error).toBe('Invalid username or password');
    expect(component.loading).toBeFalse();
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
