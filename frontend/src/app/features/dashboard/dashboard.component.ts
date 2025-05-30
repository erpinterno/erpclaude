import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>🎉 Bem-vindo ao ERP Claude!</h1>
        <button mat-raised-button color="warn" (click)="logout()">
          <mat-icon>logout</mat-icon>
          Sair
        </button>
      </div>

      <div class="cards-grid">
        <mat-card class="module-card" routerLink="/financeiro/contas-pagar">
          <mat-card-header>
            <mat-icon mat-card-avatar>payment</mat-icon>
            <mat-card-title>Contas a Pagar</mat-card-title>
            <mat-card-subtitle>Gerencie suas contas a pagar</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button color="primary">Acessar</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="module-card" routerLink="/financeiro/contas-receber">
          <mat-card-header>
            <mat-icon mat-card-avatar>account_balance_wallet</mat-icon>
            <mat-card-title>Contas a Receber</mat-card-title>
            <mat-card-subtitle>Gerencie suas contas a receber</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button color="primary">Acessar</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="module-card" routerLink="/financeiro/conta-corrente">
          <mat-card-header>
            <mat-icon mat-card-avatar>account_balance</mat-icon>
            <mat-card-title>Conta Corrente</mat-card-title>
            <mat-card-subtitle>Movimentações bancárias</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button color="primary">Acessar</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="module-card" routerLink="/financeiro/import-export">
          <mat-card-header>
            <mat-icon mat-card-avatar>import_export</mat-icon>
            <mat-card-title>Importação</mat-card-title>
            <mat-card-subtitle>Importar dados via Excel</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button color="primary">Acessar</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="success-message">
        <mat-card class="success-card">
          <mat-card-content>
            <h2>✅ Login realizado com sucesso!</h2>
            <p>O sistema ERP está funcionando perfeitamente. Você pode navegar pelos módulos acima.</p>
            <ul>
              <li><strong>✅ Frontend:</strong> Angular + Material Design</li>
              <li><strong>✅ Backend:</strong> FastAPI conectado</li>
              <li><strong>✅ Autenticação:</strong> JWT funcionando</li>
              <li><strong>✅ Módulos:</strong> Financeiro operacional</li>
            </ul>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .header h1 {
      margin: 0;
      color: #333;
      font-size: 28px;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .module-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .module-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .success-message {
      margin-top: 30px;
    }

    .success-card {
      background: linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%);
      border-left: 4px solid #4caf50;
    }

    .success-card h2 {
      color: #2e7d32;
      margin-top: 0;
    }

    .success-card ul {
      margin: 16px 0;
    }

    .success-card li {
      margin: 8px 0;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 10px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .cards-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent {
  
  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}