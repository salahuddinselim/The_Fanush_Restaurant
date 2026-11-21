import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  function runGuard() {
    return TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
  }

  beforeEach(() => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'verify']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should allow activation when the session is valid', done => {
    authSpy.isLoggedIn.and.returnValue(true);
    authSpy.verify.and.returnValue(of(true));

    (runGuard() as any).subscribe((allowed: boolean) => {
      expect(allowed).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should deny activation and redirect when no session exists', () => {
    authSpy.isLoggedIn.and.returnValue(false);

    expect(runGuard()).toBeFalse();
    expect(authSpy.verify).not.toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/login']);
  });

  it('should deny activation and redirect when the server rejects the session', done => {
    authSpy.isLoggedIn.and.returnValue(true);
    authSpy.verify.and.returnValue(of(false));

    (runGuard() as any).subscribe((allowed: boolean) => {
      expect(allowed).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/login']);
      done();
    });
  });
});
