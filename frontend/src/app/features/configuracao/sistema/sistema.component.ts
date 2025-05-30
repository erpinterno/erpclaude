import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sistema',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="page-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>settings_applications</mat-icon>
            Configurações do Sistema
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="development-notice">
            <mat-icon>construction</mat-icon>
            <h3>Módulo em Desenvolvimento</h3>
            <p>Esta funcionalidade será implementada em breve.</p>
            <p>Aqui você poderá gerenciar configurações gerais do sistema.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
    }

    .development-notice {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .development-notice mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ff9800;
    }

    .development-notice h3 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .development-notice p {
      margin: 8px 0;
    }
  `]
})
export class SistemaComponent {}