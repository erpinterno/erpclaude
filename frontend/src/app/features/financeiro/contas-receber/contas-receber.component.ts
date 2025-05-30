import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-contas-receber',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Contas a Receber</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Módulo de Contas a Receber - Em desenvolvimento</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: []
})
export class ContasReceberComponent {}