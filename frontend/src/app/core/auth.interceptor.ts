import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('kamban_token');
  const router = inject(Router);

  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error) => {
      // If 401 Unauthorized, clear auth and redirect to login
      if (error.status === 401) {
        localStorage.removeItem('kamban_token');
        localStorage.removeItem('kamban_user');
        localStorage.removeItem('kamban_selected_project_id');
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    })
  );
};

