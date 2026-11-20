import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { API_URL } from './api.service';

const SESSION_LIFETIME_MS = 30 * 60 * 1000; // matches ACCESS_TOKEN_EXPIRE_MINUTES

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_FLAG = 'restaurant_session';
  private readonly SESSION_EXPIRY = 'restaurant_session_exp';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<{ access_token: string; token_type: string }>(
      `${API_URL}/auth/login`, { username, password }, { withCredentials: true }
    ).pipe(
      tap(() => {
        try {
          localStorage.setItem(this.SESSION_FLAG, '1');
          localStorage.setItem(this.SESSION_EXPIRY, String(Date.now() + SESSION_LIFETIME_MS));
        } catch {}
      })
    );
  }

  logout() {
    try {
      localStorage.removeItem(this.SESSION_FLAG);
      localStorage.removeItem(this.SESSION_EXPIRY);
    } catch {}
    this.http.post(`${API_URL}/auth/logout`, {}, { withCredentials: true }).subscribe({
      complete: () => this.router.navigate(['/admin/login']),
      error: () => this.router.navigate(['/admin/login']),
    });
  }

  verify(): Observable<boolean> {
    return this.http.get(`${API_URL}/auth/me`, { withCredentials: true }).pipe(
      map(() => true),
      catchError(() => {
        try { localStorage.removeItem(this.SESSION_FLAG); localStorage.removeItem(this.SESSION_EXPIRY); } catch {}
        return of(false);
      })
    );
  }

  isLoggedIn(): boolean {
    try {
      if (localStorage.getItem(this.SESSION_FLAG) !== '1') return false;
      const exp = Number(localStorage.getItem(this.SESSION_EXPIRY));
      if (exp && Date.now() > exp) {
        localStorage.removeItem(this.SESSION_FLAG);
        localStorage.removeItem(this.SESSION_EXPIRY);
        return false;
      }
      return true;
    } catch { return false; }
  }
}
