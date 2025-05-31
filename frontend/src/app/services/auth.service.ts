import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface LoginResponse {
  access_token: string;
  token_type: string;
  user?: any;
}

interface User {
  id?: number;
  email: string;
  name?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const savedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      savedUser ? JSON.parse(savedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, formData)
      .pipe(
        map(response => {
          if (response && response.access_token) {
            this.saveAuthData(response);
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  loginJSON(email: string, password: string): Observable<LoginResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { username: email, password: password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, body, { headers })
      .pipe(
        map(response => {
          if (response && response.access_token) {
            this.saveAuthData(response);
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  saveAuthData(response: LoginResponse, userData?: any): void {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('token_type', response.token_type || 'Bearer');
    
    const user = userData || response.user || { email: 'user@example.com' };
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    this.currentUserSubject.next(user);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getTokenType(): string {
    return localStorage.getItem('token_type') || 'Bearer';
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`)
      .pipe(
        map(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/refresh`, { refresh_token: refreshToken })
      .pipe(
        map(response => {
          if (response && response.access_token) {
            localStorage.setItem('access_token', response.access_token);
          }
          return response;
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('Auth Error:', error);
    
    let errorMessage = 'Ocorreu um erro na autenticação';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.status === 401) {
        errorMessage = 'Credenciais inválidas';
      } else if (error.status === 403) {
        errorMessage = 'Acesso negado';
      } else if (error.status === 0) {
        errorMessage = 'Servidor não está respondendo';
      }
    }
    
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}
