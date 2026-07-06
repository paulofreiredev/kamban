import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { User, Project } from '../models';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'kamban_token';
  private readonly userKey = 'kamban_user';
  private readonly projectIdKey = 'kamban_selected_project_id';

  private _token = signal<string | null>(localStorage.getItem(this.tokenKey));
  private _user = signal<User | null>(this.loadUser());
  private _selectedProjectId = signal<number | null>(this.loadSelectedProjectId());

  readonly token = computed(() => this._token());
  readonly user = computed(() => this._user());
  readonly isLogged = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly selectedProjectId = computed(() => this._selectedProjectId());

  constructor(private api: ApiService, private router: Router) {}

  login(email: string, password: string) {
    return this.api.login(email, password).pipe(
      tap((res) => {
        this._token.set(res.token);
        this._user.set(res.user);
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        // Clear selected project on login
        this._selectedProjectId.set(null);
        localStorage.removeItem(this.projectIdKey);
      })
    );
  }

  selectProject(projectId: number) {
    this._selectedProjectId.set(projectId);
    localStorage.setItem(this.projectIdKey, projectId.toString());
  }

  logout() {
    this._token.set(null);
    this._user.set(null);
    this._selectedProjectId.set(null);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.projectIdKey);
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

  private loadSelectedProjectId(): number | null {
    const raw = localStorage.getItem(this.projectIdKey);
    if (!raw) return null;
    try {
      return parseInt(raw, 10);
    } catch {
      return null;
    }
  }
}
