import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

interface ContaPagar {
  id: number;
  descricao: string;
  fornecedor: string;
  valor: number;
  data_vencimento: Date;
  data_pagamento?: Date;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  observacoes?: string;
}

@Component({
  selector: 'app-contas-pagar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <h1>Contas a Pagar</h1>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <!-- Filtros -->
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Buscar</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Digite para buscar...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="filterByStatus($event.value)">
                <mat-option value="">Todos</mat-option>
                <mat-option value="pendente">Pendente</mat-option>
                <mat-option value="pago">Pago</mat-option>
                <mat-option value="vencido">Vencido</mat-option>
                <mat-option value="cancelado">Cancelado</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="openDialog()">
              <mat-icon>add</mat-icon>
              Nova Conta
            </button>
          </div>

          <!-- Tabela -->
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>

              <ng-container matColumnDef="descricao">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>DescriÃ§Ã£o</th>
                <td mat-cell *matCellDef="let conta">{{conta.descricao}}</td>
              </ng-container>

              <ng-container matColumnDef="fornecedor">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Fornecedor</th>
                <td mat-cell *matCellDef="let conta">{{conta.fornecedor}}</td>
              </ng-container>

              <ng-container matColumnDef="valor">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Valor</th>
                <td mat-cell *matCellDef="let conta">{{conta.valor | currency:'BRL'}}</td>
              </ng-container>

              <ng-container matColumnDef="vencimento">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Vencimento</th>
                <td mat-cell *matCellDef="let conta">{{conta.data_vencimento | date:'dd/MM/yyyy'}}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let conta">
                  <mat-chip [ngClass]="'status-' + conta.status">
                    {{getStatusLabel(conta.status)}}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="acoes">
                <th mat-header-cell *matHeaderCellDef>AÃ§Ãµes</th>
                <td mat-cell *matCellDef="let conta">
                  <button mat-icon-button [matMenuTriggerFor]="menu" 
                          aria-label="AÃ§Ãµes">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="editarConta(conta)">
                      <mat-icon>edit</mat-icon>
                      <span>Editar</span>
                    </button>
                    <button mat-menu-item (click)="marcarComoPago(conta)" 
                            *ngIf="conta.status === 'pendente'">
                      <mat-icon>check_circle</mat-icon>
                      <span>Marcar como Pago</span>
                    </button>
                    <button mat-menu-item (click)="excluirConta(conta)">
                      <mat-icon>delete</mat-icon>
                      <span>Excluir</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="6">
                  <p class="empty-state">Nenhuma conta encontrada</p>
                </td>
              </tr>
            </table>
          </div>

          <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" 
                         showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin: 0;
    }

    .filters {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .filters mat-form-field {
      flex: 1;
      min-width: 200px;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      opacity: 0.6;
    }

    .status-pendente {
      background-color: #ff9800 !important;
    }

    .status-pago {
      background-color: #4caf50 !important;
    }

    .status-vencido {
      background-color: #f44336 !important;
    }

    .status-cancelado {
      background-color: #9e9e9e !important;
    }
  `]
})
export class ContasPagarComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['descricao', 'fornecedor', 'valor', 'vencimento', 'status', 'acoes'];
  dataSource = new MatTableDataSource<ContaPagar>([]);

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadContas();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadContas(): void {
    // TODO: Implementar carregamento via API
    // Dados de exemplo
    this.dataSource.data = [
      {
        id: 1,
        descricao: 'Aluguel',
        fornecedor: 'ImobiliÃ¡ria XYZ',
        valor: 2500,
        data_vencimento: new Date('2025-06-10'),
        status: 'pendente'
      }
    ];
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByStatus(status: string): void {
    if (status) {
      this.dataSource.filterPredicate = (data: ContaPagar) => data.status === status;
      this.dataSource.filter = 'trigger';
    } else {
      this.dataSource.filter = '';
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      pago: 'Pago',
      vencido: 'Vencido',
      cancelado: 'Cancelado'
    };
    return labels[status] || status;
  }

  openDialog(conta?: ContaPagar): void {
    // TODO: Implementar dialog de criaÃ§Ã£o/ediÃ§Ã£o
    this.snackBar.open('Funcionalidade em desenvolvimento', 'OK', {
      duration: 3000
    });
  }

  editarConta(conta: ContaPagar): void {
    this.openDialog(conta);
  }

  marcarComoPago(conta: ContaPagar): void {
    // TODO: Implementar via API
    conta.status = 'pago';
    conta.data_pagamento = new Date();
    this.snackBar.open('Conta marcada como paga', 'OK', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  excluirConta(conta: ContaPagar): void {
    // TODO: Implementar confirmaÃ§Ã£o e exclusÃ£o via API
    this.snackBar.open('Conta excluÃ­da', 'OK', {
      duration: 3000
    });
  }
}
