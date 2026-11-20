import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { API_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_FLAG = 'restaurant_session';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<{ access_token: string; token_type: string }>(
      `${API_URL}/auth/login`, { username, password }, { withCredentials: true }
    ).pipe(
      tap(() => { try { sessionStorage.setItem(this.SESSION_FLAG, '1'); } catch {} })
    );
  }

  logout() {
    try { sessionStorage.removeItem(this.SESSION_FLAG); } catch {}
    this.http.post(`${API_URL}/auth/logout`, {}, { withCredentials: true }).subscribe();
    this.router.navigate(['/admin/login']);
  }

  isLoggedIn(): boolean {
    try { return sessionStorage.getItem(this.SESSION_FLAG) === '1'; } catch { return false; }
  }
}
