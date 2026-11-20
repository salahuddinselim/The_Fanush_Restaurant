import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isAuthPath = req.url.includes('/auth/');
  return next(req.clone({ withCredentials: true })).pipe(
    catchError(error => {
      if (!isAuthPath && error?.status === 401) auth.logout();
      return throwError(() => error);
    })
  );
};
