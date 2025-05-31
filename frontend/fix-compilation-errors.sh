#!/bin/bash
echo "🔧 Corrigindo erros de compilação..."

# 1. Criar login.component.html
echo "1/4 - Criando login.component.html..."
cat > src/app/features/auth/login/login.component.html << 'EOF'
<div class="login-container">
  <mat-card class="login-card">
    <mat-card-header>
      <mat-card-title><h1>ERP Claude</h1></mat-card-title>
      <mat-card-subtitle>Sistema de Gestão Empresarial</mat-card-subtitle>
    </mat-card-header>
    <mat-card-content>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" placeholder="seu@email.com" autocomplete="username">
          <mat-icon matPrefix>email</mat-icon>
          <mat-error *ngIf="email?.invalid && email?.touched">
            <span *ngIf="email?.errors?.['required']">Email é obrigatório</span>
            <span *ngIf="email?.errors?.['email']">Email inválido</span>
          </mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Senha</mat-label>
          <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="current-password">
          <mat-icon matPrefix>lock</mat-icon>
          <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
            <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="password?.invalid && password?.touched">
            <span *ngIf="password?.errors?.['required']">Senha é obrigatória</span>
            <span *ngIf="password?.errors?.['minlength']">Senha deve ter no mínimo 6 caracteres</span>
          </mat-error>
        </mat-form-field>
        <div *ngIf="errorMessage" class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>
        <div class="button-container">
          <button mat-raised-button color="primary" type="submit" [disabled]="loading || loginForm.invalid" class="full-width">
            <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
            <span *ngIf="!loading">Entrar</span>
          </button>
        </div>
        <div class="helper-links">
          <button mat-button type="button" color="accent" (click)="fillTestCredentials()">
            Usar credenciais de teste
          </button>
        </div>
      </form>
    </mat-card-content>
    <mat-card-footer>
      <div class="footer-info">
        <small>© 2025 ERP Claude - Todos os direitos reservados</small>
      </div>
    </mat-card-footer>
  </mat-card>
</div>
EOF

# 2. Criar login.component.scss
echo "2/4 - Criando login.component.scss..."
touch src/app/features/auth/login/login.component.scss

# 3. Criar login.module.ts
echo "3/4 - Criando login.module.ts..."
touch src/app/features/auth/login/login.module.ts

# 4. Verificar main-layout.module.ts
echo "4/4 - Verificando main-layout.module.ts..."
if [ ! -f "src/app/layouts/main-layout/main-layout.module.ts" ]; then
    echo "   Criando main-layout.module.ts..."
    mkdir -p src/app/layouts/main-layout
    touch src/app/layouts/main-layout/main-layout.module.ts
fi

echo "✅ Correções aplicadas!"
echo "⚠️  IMPORTANTE: Atualize os arquivos .ts com o conteúdo dos artifacts"
