import { Injectable, computed, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface UserInfo {
  preferred_username: string;
  email: string;
  name: string;
  roles: string[];
}

interface SessionResponse {
  isAuthenticated: boolean;
  user: UserInfo | null;
}

interface LogoutResponse {
  logoutUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly authUrl = `${environment.bffUrl}/auth`;

  readonly isAuthenticated = signal(false);
  readonly user = signal<UserInfo | null>(null);
  readonly loading = signal(true);

  readonly roles = computed(() => this.user()?.roles ?? []);

  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.checkSession();
  }

  async checkSession(): Promise<void> {
    this.loading.set(true);

    try {
      const response = await fetch(`${this.authUrl}/me`, { credentials: 'include' });

      if (!response.ok) {
        throw new Error(`Session-Check fehlgeschlagen: ${response.status}`);
      }

      const session = (await response.json()) as SessionResponse;

      this.isAuthenticated.set(session.isAuthenticated);
      this.user.set(session.user);
    } catch (error) {
      console.error('Session konnte nicht geprueft werden:', error);
      this.isAuthenticated.set(false);
      this.user.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${this.authUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

      if (!response.ok) {
        throw new Error(`Logout fehlgeschlagen: ${response.status}`);
      }

      const { logoutUrl } = (await response.json()) as LogoutResponse;

      this.isAuthenticated.set(false);
      this.user.set(null);

      window.location.href = logoutUrl;
    } catch (error) {
      console.error('Logout fehlgeschlagen:', error);
    }
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }
}
