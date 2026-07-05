import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLogged()) {
    router.navigateByUrl('/login');
    return false;
  }
  return true;
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLogged()) {
    router.navigateByUrl('/login');
    return false;
  }
  if (!auth.isAdmin()) {
    router.navigateByUrl('/');
    return false;
  }
  return true;
};
