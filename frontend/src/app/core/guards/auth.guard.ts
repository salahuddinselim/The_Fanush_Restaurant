import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/admin/login']);
    return false;
  }

  // Verify cookie is still valid with the server (catches stale localStorage flags)
  return auth.verify().pipe(
    map(valid => {
      if (!valid) router.navigate(['/admin/login']);
      return valid;
    }),
    catchError(() => {
      router.navigate(['/admin/login']);
      return of(false);
    })
  );
};
