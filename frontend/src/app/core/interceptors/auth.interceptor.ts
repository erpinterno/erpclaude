import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // URLs que não precisam de autenticação
    const publicUrls = [
      '/api/v1/auth/login',
      '/api/v1/auth/register'
    ];

    const isPublicUrl = publicUrls.some(url => req.url.includes(url));
    
    // Se for uma URL pública, não adiciona o token
    if (isPublicUrl) {
      return next.handle(req).pipe(
        catchError(this.handleError.bind(this))
      );
    }

    // Adiciona o token de autorização se existir
    const token = this.authService.getToken();
    
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      // Token inválido ou expirado
      this.authService.logout();
      this.router.navigate(['/login']);
    }

    return throwError(() => error);
  }
}