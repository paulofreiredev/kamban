import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { User } from '../models';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'kamban_token';
  private readonly userKey = 'kamban_user';

  private _token = signal<string | null>(localStorage.getItem(this.tokenKey));
  private _user = signal<User | null>(this.loadUser());

  readonly token = computed(() => this._token());
  readonly user = computed(() => this._user());
  readonly isLogged = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  constructor(private api: ApiService, private router: Router) {}

  login(email: string, password: string) {
    return this.api.login(email, password).pipe(
      tap((res) => {
        this._token.set(res.token);
        this._user.set(res.user);
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
      })
    );
  }

  logout() {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.router.navigateByUrl('/login');
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
