import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  function runGuard() {
    return TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
  }

  beforeEach(() => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should allow activation when the user is logged in', () => {
    authSpy.isLoggedIn.and.returnValue(true);

    expect(runGuard()).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should deny activation and redirect to login when the user is not logged in', () => {
    authSpy.isLoggedIn.and.returnValue(false);

    expect(runGuard()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/login']);
  });
});
