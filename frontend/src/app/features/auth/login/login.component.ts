import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, LoginResponse, User } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <div class="logo">
              <mat-icon>business</mat-icon>
              <h1>ERP Claude</h1>
            </div>
          </mat-card-title>
          <mat-card-subtitle>Sistema de Gestão Empresarial</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-mail</mat-label>
              <input matInput 
                     type="email"
                     formControlName="email" 
                     placeholder="Digite seu e-mail"
                     autocomplete="username">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                E-mail é obrigatório
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                E-mail inválido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput 
                     [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="password" 
                     placeholder="Digite sua senha"
                     autocomplete="current-password">
              <button mat-icon-button 
                      matSuffix 
                      (click)="hidePassword = !hidePassword"
                      type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Senha é obrigatória
              </mat-error>
            </mat-form-field>

            <button mat-raised-button 
                    color="primary" 
                    type="submit" 
                    class="login-button"
                    [disabled]="loginForm.invalid || isLoading">
              <div class="button-content">
                <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                <mat-icon *ngIf="!isLoading">login</mat-icon>
                <span>{{ isLoading ? 'Entrando...' : 'Entrar' }}</span>
              </div>
            </button>
          </form>

          <!-- Credenciais de teste -->
          <div class="demo-credentials">
            <h3>👨‍💼 Credenciais de Teste:</h3>
            
            <div class="credential-item" (click)="fillCredentials('eltonaib@gmail.com', 'Melogi515')">
              <strong>Seu usuário:</strong> eltonaib&#64;gmail.com
              <small>Clique para preencher</small>
            </div>
            
            <div class="credential-item" (click)="fillCredentials('admin@example.com', 'changethis')">
              <strong>Admin:</strong> admin&#64;example.com
              <small>Clique para preencher</small>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 450px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      border-radius: 16px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #667eea;
      justify-content: center;
    }

    .logo mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .logo h1 {
      margin: 0;
      font-weight: 600;
      font-size: 24px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 500;
      margin-top: 16px;
    }

    .button-content {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    .demo-credentials {
      margin-top: 24px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .demo-credentials h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #333;
    }

    .credential-item {
      margin-bottom: 8px;
      padding: 8px;
      background-color: white;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
      font-size: 12px;
    }

    .credential-item:hover {
      background-color: #e3f2fd;
    }

    .credential-item strong {
      color: #667eea;
    }

    .credential-item small {
      display: block;
      color: #666;
      font-style: italic;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    // Primeiro tenta com form-data (padrão OAuth2)
    this.authService.login(email, password).subscribe({
      next: (response: LoginResponse) => {
        this.handleLoginSuccess(response);
      },
      error: (error: any) => {
        console.error('Erro no login (form-data):', error);
        
        // Se falhar, tenta com JSON
        this.authService.loginJSON(email, password).subscribe({
          next: (response: LoginResponse) => {
            this.handleLoginSuccess(response);
          },
          error: (jsonError: any) => {
            console.error('Erro no login (JSON):', jsonError);
            this.handleLoginError(jsonError);
          }
        });
      }
    });
  }

  private handleLoginSuccess(response: LoginResponse): void {
    this.isLoading = false;
    
    // Salva o token
    this.authService.saveAuthData(response);
    
    // Busca dados do usuário
    this.authService.getCurrentUser().subscribe({
      next: (userData: User) => {
        this.authService.saveAuthData(response, userData);
        this.snackBar.open('Login realizado com sucesso!', 'OK', {
          duration: 3000
        });
        this.router.navigate(['/dashboard']);
      },
      error: (userError: any) => {
        console.warn('Erro ao buscar dados do usuário:', userError);
        // Mesmo assim prossegue com o login
        this.snackBar.open('Login realizado com sucesso!', 'OK', {
          duration: 3000
        });
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private handleLoginError(error: any): void {
    this.isLoading = false;
    
    let errorMessage = 'Erro ao realizar login';
    
    if (error.status === 401) {
      errorMessage = 'E-mail ou senha incorretos';
    } else if (error.status === 0) {
      errorMessage = 'Erro de conexão com o servidor';
    } else if (error.error?.detail) {
      errorMessage = error.error.detail;
    }

    this.snackBar.open(errorMessage, 'OK', {
      duration: 5000
    });
  }

  fillCredentials(email: string, password: string): void {
    this.loginForm.patchValue({
      email: email,
      password: password
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}