import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule
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
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Descrição</th>
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
                <th mat-header-cell *matHeaderCellDef>Ações</th>
                <td mat-cell *matCellDef="let conta">
                  <button mat-icon-button [matMenuTriggerFor]="menu"
                          aria-label="Ações"
                          matTooltip="Ações">
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
      padding: 20px;
    }

    h1 {
      margin: 0;
      color: #333;
      font-weight: 500;
    }

    .filters {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filters mat-form-field {
      flex: 1;
      min-width: 200px;
      max-width: 300px;
    }

    .filters button {
      height: 56px;
      min-width: 140px;
    }

    .table-container {
      overflow-x: auto;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }

    table {
      width: 100%;
      min-width: 800px;
    }

    th {
      font-weight: 600;
      color: #333;
      background-color: #f5f5f5;
    }

    td {
      padding: 12px 8px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      opacity: 0.6;
      font-style: italic;
    }

    .status-pendente {
      background-color: #ff9800 !important;
      color: white !important;
    }

    .status-pago {
      background-color: #4caf50 !important;
      color: white !important;
    }

    .status-vencido {
      background-color: #f44336 !important;
      color: white !important;
    }

    .status-cancelado {
      background-color: #9e9e9e !important;
      color: white !important;
    }

    mat-chip {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      min-height: 24px;
    }

    mat-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }

    mat-card-header {
      margin-bottom: 20px;
    }

    .mat-mdc-menu-panel {
      min-width: 180px !important;
    }

    // Responsividade
    @media (max-width: 768px) {
      .container {
        padding: 10px;
      }

      .filters {
        flex-direction: column;
        align-items: stretch;
      }

      .filters mat-form-field,
      .filters button {
        width: 100%;
        max-width: none;
      }

      .table-container {
        font-size: 14px;
      }

      th, td {
        padding: 8px 4px;
      }
    }

    // Estados de loading
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }

    // Animações suaves
    .mat-mdc-row:hover {
      background-color: #f5f5f5;
      transition: background-color 0.2s ease;
    }

    // Success snackbar
    ::ng-deep .success-snackbar {
      background-color: #4caf50 !important;
      color: white !important;
    }
  `]
})
export class ContasPagarComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['descricao', 'fornecedor', 'valor', 'vencimento', 'status', 'acoes'];
  dataSource = new MatTableDataSource<ContaPagar>([]);
  contaForm: FormGroup;
  
  statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'pago', label: 'Pago' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'vencido', label: 'Vencido' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.contaForm = this.fb.group({
      id: [null],
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      fornecedor: ['', [Validators.required]],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      data_vencimento: [null, [Validators.required]],
      data_pagamento: [null],
      status: ['pendente', [Validators.required]],
      observacoes: ['']
    });
  }

  ngOnInit(): void {
    this.loadContas();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadContas(): void {
    // Dados de exemplo - substituir pela chamada ao serviço
    const contasExemplo: ContaPagar[] = [
      {
        id: 1,
        descricao: 'Pagamento de energia elétrica',
        fornecedor: 'Companhia Elétrica',
        valor: 350.50,
        data_vencimento: new Date('2025-06-15'),
        status: 'pendente'
      },
      {
        id: 2,
        descricao: 'Aluguel do escritório',
        fornecedor: 'Imobiliária XYZ',
        valor: 2500.00,
        data_vencimento: new Date('2025-06-10'),
        status: 'pago',
        data_pagamento: new Date('2025-06-08')
      },
      {
        id: 3,
        descricao: 'Fornecimento de material de escritório',
        fornecedor: 'Papelaria ABC',
        valor: 150.75,
        data_vencimento: new Date('2025-05-25'),
        status: 'vencido'
      }
    ];
    
    this.dataSource.data = contasExemplo;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByStatus(status: string): void {
    if (status) {
      this.dataSource.filterPredicate = (data: ContaPagar) => data.status === status;
      this.dataSource.filter = 'trigger';
    } else {
      this.dataSource.filterPredicate = () => true;
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
    // TODO: Implementar dialog de criação/edição
    if (conta) {
      this.contaForm.patchValue(conta);
    } else {
      this.resetForm();
    }
    
    this.snackBar.open('Funcionalidade em desenvolvimento', 'OK', {
      duration: 3000
    });
  }

  editarConta(conta: ContaPagar): void {
    this.openDialog(conta);
  }

  marcarComoPago(conta: ContaPagar): void {
    // TODO: Implementar via API
    const index = this.dataSource.data.findIndex(c => c.id === conta.id);
    if (index !== -1) {
      this.dataSource.data[index].status = 'pago';
      this.dataSource.data[index].data_pagamento = new Date();
      // Força a atualização da tabela
      this.dataSource.data = [...this.dataSource.data];
    }
    
    this.snackBar.open('Conta marcada como paga', 'OK', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  excluirConta(conta: ContaPagar): void {
    // TODO: Implementar confirmação e exclusão via API
    const index = this.dataSource.data.findIndex(c => c.id === conta.id);
    if (index !== -1) {
      this.dataSource.data.splice(index, 1);
      // Força a atualização da tabela
      this.dataSource.data = [...this.dataSource.data];
    }
    
    this.snackBar.open('Conta excluída com sucesso', 'OK', {
      duration: 3000
    });
  }

  onSubmit(): void {
    if (this.contaForm.valid) {
      const formData = this.contaForm.value;
      console.log('Dados do formulário:', formData);
      
      // Aqui você adicionaria a lógica para salvar no backend
      // this.contasService.create(formData).subscribe(...)
      
      this.resetForm();
    } else {
      console.log('Formulário inválido');
      this.markFormGroupTouched();
    }
  }

  resetForm(): void {
    this.contaForm.reset();
    this.contaForm.patchValue({ status: 'pendente' });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contaForm.controls).forEach(key => {
      this.contaForm.get(key)?.markAsTouched();
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}