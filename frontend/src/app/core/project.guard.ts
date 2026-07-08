import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export const projectSelectionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const apiService = inject(ApiService);
  const router = inject(Router);

  // If not logged in, redirect to login
  if (!authService.isLogged()) {
    router.navigateByUrl('/login');
    return false;
  }

  // If already has a selected project, allow
  if (authService.selectedProjectId()) {
    return true;
  }

  // Fetch user projects
  return apiService.listProjects().pipe(
    switchMap((projects) => {
      // If has projects, redirect to project selection
      if (projects.length > 0) {
        router.navigateByUrl('/projects/select');
        return of(false);
      }
      // If no projects and not admin, deny access
      if (!authService.isAdmin()) {
        router.navigateByUrl('/no-project');
        return of(false);
      }
      // Admin with no projects can proceed
      return of(true);
    })
  );
};

export const projectAccessGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const apiService = inject(ApiService);
  const router = inject(Router);

  if (authService.selectedProjectId()) {
    return true;
  }

  return apiService.listProjects().pipe(
    switchMap((projects) => {
      const activeProjects = projects.filter((p) => p.isActive);

      if (activeProjects.length > 0) {
        router.navigateByUrl('/projects/select');
        return of(false);
      }

      if (authService.isAdmin()) {
        router.navigateByUrl('/admin/projects');
        return of(false);
      }

      router.navigateByUrl('/no-project');
      return of(false);
    })
  );
};
