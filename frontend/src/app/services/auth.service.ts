import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8000';
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user_data';
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const loginData = new FormData();
    loginData.append('username', email);
    loginData.append('password', password);
    loginData.append('grant_type', 'password');

    return this.http.post<LoginResponse>(
      `${this.API_URL}/api/v1/auth/login`, 
      loginData
    );
  }

  loginJSON(email: string, password: string): Observable<LoginResponse> {
    const loginData = {
      username: email,
      password: password
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(
      `${this.API_URL}/api/v1/auth/login`, 
      loginData,
      { headers }
    );
  }

  saveAuthData(loginResponse: LoginResponse, userData?: User): void {
    localStorage.setItem(this.TOKEN_KEY, loginResponse.access_token);
    
    if (userData) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      this.currentUserSubject.next(userData);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(
      `${this.API_URL}/api/v1/users/me`,
      { headers: this.getAuthHeaders() }
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}