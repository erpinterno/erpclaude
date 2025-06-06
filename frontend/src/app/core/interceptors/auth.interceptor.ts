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
      console.log('URL pública, não adicionando token:', req.url);
      return next.handle(req).pipe(
        catchError(this.handleError.bind(this))
      );
    }

    // Adiciona o token de autorização se existir
    const token = this.authService.getToken();
    const isAuthenticated = this.authService.isAuthenticated();
    
    console.log('🔐 [Auth Interceptor] URL:', req.url);
    console.log('🔐 [Auth Interceptor] Token exists:', !!token);
    console.log('🔐 [Auth Interceptor] Is authenticated:', isAuthenticated);
    console.log('🔐 [Auth Interceptor] Token (first 30 chars):', token ? token.substring(0, 30) + '...' : 'null');
    
    let authReq = req;
    if (token && isAuthenticated) {
      console.log('✅ [Auth Interceptor] Adicionando token à requisição:', req.url);
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      console.warn('❌ [Auth Interceptor] Token não encontrado ou inválido para:', req.url);
      console.warn('❌ [Auth Interceptor] Token:', !!token, 'Authenticated:', isAuthenticated);
      // Para URLs que precisam de autenticação, redirecionar para login
      if (!isPublicUrl) {
        console.error('💥 [Auth Interceptor] Fazendo logout devido a token inválido');
        this.authService.logout();
        return throwError(() => new HttpErrorResponse({
          status: 401,
          statusText: 'Unauthorized',
          error: { detail: 'Token de autorização necessário' }
        }));
      }
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