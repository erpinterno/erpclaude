#!/bin/bash

# Script para aplicar todas as correções do ERP
# Execute este script no diretório frontend do projeto

echo "🔧 Aplicando correções do ERP..."

# Criar diretório de environments
echo "📁 Criando diretório de environments..."
mkdir -p src/environments

# Criar environment.ts
echo "📄 Criando environment.ts..."
cat > src/environments/environment.ts << 'EOF'
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
EOF

# Criar environment.prod.ts
echo "📄 Criando environment.prod.ts..."
cat > src/environments/environment.prod.ts << 'EOF'
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8000/api'
};
EOF

# Backup do auth.service.ts original
if [ -f "src/app/services/auth.service.ts" ]; then
    echo "💾 Fazendo backup do auth.service.ts..."
    cp src/app/services/auth.service.ts src/app/services/auth.service.ts.backup
fi

# Criar diretório de services se não existir
mkdir -p src/app/services

# Criar auth.service.ts
echo "📄 Atualizando auth.service.ts..."
cat > src/app/services/auth.service.ts << 'EOF'
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
EOF

# Criar main-layout.module.ts
echo "📄 Criando main-layout.module.ts..."
cat > src/app/layouts/main-layout/main-layout.module.ts << 'EOF'
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Components
import { MainLayoutComponent } from './main-layout.component';

@NgModule({
  declarations: [
    MainLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatExpansionModule,
    MatTooltipModule,
    MatDividerModule
  ],
  exports: [
    MainLayoutComponent
  ]
})
export class MainLayoutModule { }
EOF

# Criar main-layout.component.scss
echo "📄 Criando main-layout.component.scss..."
cat > src/app/layouts/main-layout/main-layout.component.scss << 'EOF'
// Variáveis
$sidenav-width: 260px;
$toolbar-height: 64px;
$primary-color: #1976d2;
$accent-color: #ff4081;

// Container principal
.sidenav-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

// Toolbar
.toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.3);

  .toolbar-spacer {
    flex: 1 1 auto;
  }

  .user-menu {
    display: flex;
    align-items: center;
    gap: 8px;

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: $accent-color;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 500;
    }
  }
}

// Sidenav
.sidenav {
  width: $sidenav-width;
  box-shadow: 3px 0 6px rgba(0, 0, 0, 0.24);
  
  .sidenav-header {
    padding: 16px;
    text-align: center;
    background-color: $primary-color;
    color: white;
    
    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 300;
    }
  }

  .nav-list {
    padding-top: 8px;
    
    .nav-item {
      &.active {
        background-color: rgba($primary-color, 0.1);
        
        .mat-list-item {
          color: $primary-color;
        }
      }

      .mat-list-item {
        height: 48px;
        
        .mat-icon {
          margin-right: 16px;
        }
      }
    }
  }
}

// Conteúdo principal
.main-content {
  margin-top: $toolbar-height;
  padding: 24px;
  min-height: calc(100vh - #{$toolbar-height});
  background-color: #f5f5f5;

  &.sidenav-closed {
    margin-left: 0;
  }
}

// Responsivo
@media (max-width: 768px) {
  .sidenav {
    width: 100%;
  }

  .main-content {
    padding: 16px;
  }
}
EOF

# Backup do auth.guard.ts original
if [ -f "src/app/guards/auth.guard.ts" ]; then
    echo "💾 Fazendo backup do auth.guard.ts..."
    cp src/app/guards/auth.guard.ts src/app/guards/auth.guard.ts.backup
fi

# Criar diretório de guards se não existir
mkdir -p src/app/guards

# Criar auth.guard.ts
echo "📄 Atualizando auth.guard.ts..."
cat > src/app/guards/auth.guard.ts << 'EOF'
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    if (this.authService.isAuthenticated()) {
      const requiredRoles = route.data['roles'] as Array<string>;
      
      if (requiredRoles && requiredRoles.length > 0) {
        const currentUser = this.authService.getCurrentUserValue();
        
        if (currentUser && currentUser.role && requiredRoles.includes(currentUser.role)) {
          return true;
        } else {
          console.warn('Acesso negado. Role insuficiente.');
          this.router.navigate(['/dashboard']);
          return false;
        }
      }
      
      return true;
    }

    console.log('Usuário não autenticado. Redirecionando para login...');
    
    const returnUrl = state.url;
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: returnUrl }
    });
    
    return false;
  }
}
EOF

echo "✅ Todas as correções foram aplicadas!"
echo ""
echo "📝 Próximos passos:"
echo "1. Atualize o login.component.ts manualmente seguindo o artifact"
echo "2. Certifique-se que o app.module.ts importa o MainLayoutModule"
echo "3. Reinicie o servidor Angular (Ctrl+C e ng serve novamente)"
echo ""
echo "🚀 Comandos úteis:"
echo "  cd /workspaces/erpclaude/frontend"
echo "  ng serve --host 0.0.0.0"
echo ""
echo "🔑 Credenciais de teste:"
echo "  Email: admin@example.com"
echo "  Senha: changethis"
EOF