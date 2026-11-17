import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isLoginRequest = req.url.endsWith('/auth/login');
  const token = auth.getToken();
  if (token && !isLoginRequest) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req).pipe(
    catchError(error => {
      if (!isLoginRequest && error?.status === 401) auth.logout();
      return throwError(() => error);
    })
  );
};
