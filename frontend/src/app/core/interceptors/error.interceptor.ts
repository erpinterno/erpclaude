import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        router.navigate(['/login']);
        snackBar.open('Sessão expirada. Faça login novamente.', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      } else if (error.status === 403) {
        snackBar.open('Você não tem permissão para acessar este recurso.', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      } else if (error.status === 0) {
        snackBar.open('Erro de conexão com o servidor.', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }

      return throwError(() => error);
    })
  );
};