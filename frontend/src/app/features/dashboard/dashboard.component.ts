import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterLink } from '@angular/router';

interface DashboardCard {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    RouterLink
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>

      <div class="cards-grid">
        <mat-card *ngFor="let card of cards" [style.border-left]="'4px solid ' + card.color">
          <mat-card-content>
            <div class="card-header">
              <mat-icon [style.color]="card.color">{{card.icon}}</mat-icon>
              <div class="card-info">
                <h3>{{card.title}}</h3>
                <h2>{{card.value}}</h2>
                <span class="trend" *ngIf="card.trend" 
                      [class.positive]="card.trend > 0"
                      [class.negative]="card.trend < 0">
                  <mat-icon>{{card.trend > 0 ? 'trending_up' : 'trending_down'}}</mat-icon>
                  {{card.trend > 0 ? '+' : ''}}{{card.trend}}%
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="quick-actions">
        <h2>Ações Rápidas</h2>
        <div class="actions-grid">
          <button mat-raised-button color="primary" routerLink="/financeiro/contas-pagar">
            <mat-icon>add_circle</mat-icon>
            Nova Conta a Pagar
          </button>
          <button mat-raised-button color="accent" routerLink="/financeiro/contas-receber">
            <mat-icon>add_circle</mat-icon>
            Nova Conta a Receber
          </button>
          <button mat-raised-button routerLink="/financeiro/import-export">
            <mat-icon>upload_file</mat-icon>
            Importar Dados
          </button>
        </div>
      </div>

      <div class="recent-activities">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Atividades Recentes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="empty-state">
              <mat-icon>history</mat-icon>
              Nenhuma atividade recente
            </p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 30px;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .card-header mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .card-info h3 {
      margin: 0;
      font-size: 14px;
      font-weight: normal;
      opacity: 0.8;
    }

    .card-info h2 {
      margin: 5px 0;
      font-size: 28px;
    }

    .trend {
      display: flex;
      align-items: center;
      font-size: 14px;
      gap: 4px;
    }

    .trend.positive {
      color: #4caf50;
    }

    .trend.negative {
      color: #f44336;
    }

    .trend mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .quick-actions {
      margin-bottom: 40px;
    }

    .actions-grid {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .actions-grid button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      opacity: 0.6;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      display: block;
      margin: 0 auto 10px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  cards: DashboardCard[] = [
    {
      title: 'Total a Pagar',
      value: 'R$ 0,00',
      icon: 'money_off',
      color: '#f44336',
      trend: 0
    },
    {
      title: 'Total a Receber',
      value: 'R$ 0,00',
      icon: 'payments',
      color: '#4caf50',
      trend: 0
    },
    {
      title: 'Saldo em Contas',
      value: 'R$ 0,00',
      icon: 'account_balance',
      color: '#2196f3',
      trend: 0
    },
    {
      title: 'Vencidos',
      value: '0',
      icon: 'warning',
      color: '#ff9800',
      trend: 0
    }
  ];

  ngOnInit(): void {
    // Carregar dados do dashboard
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // TODO: Implementar carregamento dos dados via API
  }
}