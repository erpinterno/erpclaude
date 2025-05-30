import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-conta-corrente',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Conta Corrente</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Módulo de Conta Corrente - Em desenvolvimento</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: []
})
export class ContaCorrenteComponent {}