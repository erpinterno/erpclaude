import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Se já estiver autenticado, redirecionar para dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    // Criar formulário
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Getters para facilitar acesso aos campos
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  // Submit do formulário
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    // Usar o método login com FormData
    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        
        // Salvar token e buscar dados do usuário
        this.authService.saveAuthData(response);
        
        // Buscar dados do usuário após login bem-sucedido
        this.authService.getCurrentUser().subscribe({
          next: (user) => {
            console.log('User data loaded', user);
            this.authService.saveAuthData(response, user);
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            console.error('Error loading user data', error);
            // Mesmo com erro ao carregar dados do usuário, continuar para dashboard
            this.router.navigate(['/dashboard']);
          }
        });
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loading = false;
        this.handleLoginError(error);
      }
    });
  }

  // Tentar login alternativo com JSON se FormData falhar
  tryJSONLogin(): void {
    const { email, password } = this.loginForm.value;
    
    this.authService.loginJSON(email, password).subscribe({
      next: (response) => {
        console.log('JSON login successful', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('JSON login error:', error);
        this.loading = false;
        this.handleLoginError(error);
      }
    });
  }

  // Tratar erros de login
  private handleLoginError(error: any): void {
    if (error.message) {
      this.errorMessage = error.message;
    } else if (error.status === 401) {
      this.errorMessage = 'Email ou senha incorretos';
    } else if (error.status === 0) {
      this.errorMessage = 'Não foi possível conectar ao servidor';
    } else {
      this.errorMessage = 'Erro ao fazer login. Tente novamente.';
    }
  }

  // Marcar todos os campos como tocados para mostrar erros
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Preencher com credenciais de teste
  fillTestCredentials(): void {
    this.loginForm.patchValue({
      email: 'admin@example.com',
      password: 'changethis'
    });
  }

  // Limpar formulário
  clearForm(): void {
    this.loginForm.reset();
    this.errorMessage = '';
  }
}
