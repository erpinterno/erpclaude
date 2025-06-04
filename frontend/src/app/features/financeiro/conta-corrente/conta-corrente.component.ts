import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ContaCorrenteFormDialogComponent } from './conta-corrente-form-dialog.component';

interface ContaCorrente {
  id: number;
  nome: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo_conta: 'corrente' | 'poupanca' | 'investimento';
  saldo_inicial: number;
  saldo_atual: number;
  limite_credito?: number;
  observacoes?: string;
  ativo: boolean;
}

@Component({
  selector: 'app-conta-corrente',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <div class="conta-corrente-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>
              <mat-icon>account_balance</mat-icon>
              Contas Correntes
            </h1>
            <p>Gerencie suas contas bancárias e movimentações financeiras</p>
          </div>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="novaConta()">
            <mat-icon>add</mat-icon>
            Nova Conta
          </button>
        </div>
      </div>

      <!-- Resumo Financeiro -->
      <div class="resumo-cards">
        <mat-card class="resumo-card saldo-total">
          <mat-card-content>
            <div class="card-header">
              <mat-icon>account_balance_wallet</mat-icon>
              <span>Saldo Total</span>
            </div>
            <div class="card-value">{{ getSaldoTotal() | currency:'BRL':'symbol':'1.2-2' }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="resumo-card contas-ativas">
          <mat-card-content>
            <div class="card-header">
              <mat-icon>check_circle</mat-icon>
              <span>Contas Ativas</span>
            </div>
            <div class="card-value">{{ getContasAtivas() }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="resumo-card limite-disponivel">
          <mat-card-content>
            <div class="card-header">
              <mat-icon>credit_card</mat-icon>
              <span>Limite Disponível</span>
            </div>
            <div class="card-value">{{ getLimiteDisponivel() | currency:'BRL':'symbol':'1.2-2' }}</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-container">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar contas</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Nome, banco, agência...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo de Conta</mat-label>
              <mat-select (selectionChange)="filterByTipo($event.value)">
                <mat-option value="">Todos</mat-option>
                <mat-option value="corrente">Conta Corrente</mat-option>
                <mat-option value="poupanca">Poupança</mat-option>
                <mat-option value="investimento">Investimento</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="filterByStatus($event.value)">
                <mat-option value="">Todos</mat-option>
                <mat-option value="true">Ativo</mat-option>
                <mat-option value="false">Inativo</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Limpar
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Tabela -->
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" class="contas-table">

              <!-- Coluna Conta -->
              <ng-container matColumnDef="conta">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>account_balance</mat-icon>
                  Conta
                </th>
                <td mat-cell *matCellDef="let conta">
                  <div class="cell-content">
                    <strong>{{ conta.nome }}</strong>
                    <small>{{ conta.banco }}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Dados Bancários -->
              <ng-container matColumnDef="dados_bancarios">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>credit_card</mat-icon>
                  Dados Bancários
                </th>
                <td mat-cell *matCellDef="let conta">
                  <div class="dados-bancarios">
                    <div>Ag: {{ conta.agencia }}</div>
                    <div>CC: {{ conta.conta }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Tipo -->
              <ng-container matColumnDef="tipo">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>category</mat-icon>
                  Tipo
                </th>
                <td mat-cell *matCellDef="let conta">
                  <mat-chip-set>
                    <mat-chip [class]="getTipoClass(conta.tipo_conta)">
                      {{ getTipoLabel(conta.tipo_conta) }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Coluna Saldo -->
              <ng-container matColumnDef="saldo">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>account_balance_wallet</mat-icon>
                  Saldo Atual
                </th>
                <td mat-cell *matCellDef="let conta">
                  <div class="saldo-info">
                    <span [class]="getSaldoClass(conta.saldo_atual)">
                      {{ conta.saldo_atual | currency:'BRL':'symbol':'1.2-2' }}
                    </span>
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Limite -->
              <ng-container matColumnDef="limite">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>credit_score</mat-icon>
                  Limite
                </th>
                <td mat-cell *matCellDef="let conta">
                  <div *ngIf="conta.limite_credito">
                    {{ conta.limite_credito | currency:'BRL':'symbol':'1.2-2' }}
                  </div>
                  <div *ngIf="!conta.limite_credito" class="no-data">
                    Sem limite
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>flag</mat-icon>
                  Status
                </th>
                <td mat-cell *matCellDef="let conta">
                  <mat-chip-set>
                    <mat-chip [class]="conta.ativo ? 'status-ativo' : 'status-inativo'">
                      <mat-icon>{{ conta.ativo ? 'check_circle' : 'cancel' }}</mat-icon>
                      {{ conta.ativo ? 'Ativo' : 'Inativo' }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Coluna Ações -->
              <ng-container matColumnDef="acoes">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>settings</mat-icon>
                  Ações
                </th>
                <td mat-cell *matCellDef="let conta">
                  <div class="action-buttons">
                    <button mat-icon-button 
                            matTooltip="Editar" 
                            (click)="editarConta(conta)"
                            class="btn-edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            matTooltip="Movimentações" 
                            (click)="verMovimentacoes(conta.id)"
                            class="btn-view">
                      <mat-icon>list</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            [matTooltip]="conta.ativo ? 'Desativar' : 'Ativar'"
                            (click)="toggleStatus(conta)"
                            [class]="conta.ativo ? 'btn-deactivate' : 'btn-activate'">
                      <mat-icon>{{ conta.ativo ? 'block' : 'check_circle' }}</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            matTooltip="Excluir" 
                            (click)="excluirConta(conta)"
                            class="btn-delete">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <!-- Estado vazio -->
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell empty-state" colspan="7">
                  <div class="empty-content">
                    <mat-icon>account_balance</mat-icon>
                    <h3>Nenhuma conta encontrada</h3>
                    <p>Não há contas que correspondam aos filtros aplicados.</p>
                    <button mat-raised-button color="primary" (click)="novaConta()">
                      <mat-icon>add</mat-icon>
                      Adicionar primeira conta
                    </button>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Paginação -->
          <mat-paginator 
            [pageSizeOptions]="[10, 25, 50, 100]" 
            [pageSize]="25"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .conta-corrente-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-text h1 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .header-text p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .resumo-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .resumo-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .resumo-card.saldo-total {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    }

    .resumo-card.contas-ativas {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
    }

    .resumo-card.limite-disponivel {
      background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      opacity: 0.9;
    }

    .card-value {
      font-size: 24px;
      font-weight: 600;
    }

    .filters-card {
      margin-bottom: 20px;
    }

    .filters-container {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .table-card {
      margin-bottom: 24px;
    }

    .table-container {
      overflow-x: auto;
    }

    .contas-table {
      width: 100%;
    }

    .cell-content {
      display: flex;
      flex-direction: column;
    }

    .cell-content small {
      color: #666;
      font-size: 12px;
    }

    .dados-bancarios {
      display: flex;
      flex-direction: column;
      font-size: 14px;
    }

    .saldo-info .saldo-positivo {
      color: #4caf50;
      font-weight: 500;
    }

    .saldo-info .saldo-negativo {
      color: #f44336;
      font-weight: 500;
    }

    .saldo-info .saldo-zero {
      color: #666;
    }

    .no-data {
      color: #999;
      font-style: italic;
    }

    .tipo-corrente {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .tipo-poupanca {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .tipo-investimento {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-ativo {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-inativo {
      background-color: #ffebee;
      color: #c62828;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .btn-edit {
      color: #1976d2;
    }

    .btn-view {
      color: #7b1fa2;
    }

    .btn-activate {
      color: #388e3c;
    }

    .btn-deactivate {
      color: #f57c00;
    }

    .btn-delete {
      color: #d32f2f;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }

    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .empty-content mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
    }

    .empty-content h3 {
      margin: 0;
      color: #666;
    }

    .empty-content p {
      margin: 0;
      color: #999;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .resumo-cards {
        grid-template-columns: 1fr;
      }

      .filters-container {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        min-width: auto;
      }
    }
  `]
})
export class ContaCorrenteComponent implements OnInit {
  displayedColumns: string[] = ['conta', 'dados_bancarios', 'tipo', 'saldo', 'limite', 'status', 'acoes'];
  dataSource = new MatTableDataSource<ContaCorrente>([]);

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadContas();
  }

  loadContas(): void {
    // Dados de exemplo - substituir pela chamada ao serviço
    const contasExemplo: ContaCorrente[] = [
      {
        id: 1,
        nome: 'Conta Principal',
        banco: 'Banco do Brasil',
        agencia: '1234-5',
        conta: '12345-6',
        tipo_conta: 'corrente',
        saldo_inicial: 10000.00,
        saldo_atual: 15750.50,
        limite_credito: 5000.00,
        observacoes: 'Conta principal da empresa',
        ativo: true
      },
      {
        id: 2,
        nome: 'Poupança Reserva',
        banco: 'Itaú',
        agencia: '5678-9',
        conta: '98765-4',
        tipo_conta: 'poupanca',
        saldo_inicial: 50000.00,
        saldo_atual: 52300.75,
        observacoes: 'Reserva de emergência',
        ativo: true
      },
      {
        id: 3,
        nome: 'Conta Investimentos',
        banco: 'Bradesco',
        agencia: '9876-5',
        conta: '54321-0',
        tipo_conta: 'investimento',
        saldo_inicial: 25000.00,
        saldo_atual: 27850.25,
        limite_credito: 10000.00,
        observacoes: 'Conta para aplicações',
        ativo: true
      },
      {
        id: 4,
        nome: 'Conta Antiga',
        banco: 'Santander',
        agencia: '1111-1',
        conta: '11111-1',
        tipo_conta: 'corrente',
        saldo_inicial: 0.00,
        saldo_atual: -500.00,
        observacoes: 'Conta desativada',
        ativo: false
      }
    ];
    
    this.dataSource.data = contasExemplo;
  }

  getSaldoTotal(): number {
    return this.dataSource.data
      .filter(conta => conta.ativo)
      .reduce((total, conta) => total + conta.saldo_atual, 0);
  }

  getContasAtivas(): number {
    return this.dataSource.data.filter(conta => conta.ativo).length;
  }

  getLimiteDisponivel(): number {
    return this.dataSource.data
      .filter(conta => conta.ativo && conta.limite_credito)
      .reduce((total, conta) => total + (conta.limite_credito || 0), 0);
  }

  getTipoLabel(tipo: string): string {
    const tipos = {
      'corrente': 'Conta Corrente',
      'poupanca': 'Poupança',
      'investimento': 'Investimento'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  }

  getTipoClass(tipo: string): string {
    return `tipo-${tipo}`;
  }

  getSaldoClass(saldo: number): string {
    if (saldo > 0) return 'saldo-positivo';
    if (saldo < 0) return 'saldo-negativo';
    return 'saldo-zero';
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByTipo(tipo: string): void {
    if (tipo) {
      this.dataSource.filterPredicate = (data: ContaCorrente) => data.tipo_conta === tipo;
      this.dataSource.filter = 'trigger';
    } else {
      this.dataSource.filterPredicate = () => true;
      this.dataSource.filter = '';
    }
  }

  filterByStatus(status: string): void {
    if (status !== '') {
      const isActive = status === 'true';
      this.dataSource.filterPredicate = (data: ContaCorrente) => data.ativo === isActive;
      this.dataSource.filter = 'trigger';
    } else {
      this.dataSource.filterPredicate = () => true;
      this.dataSource.filter = '';
    }
  }

  clearFilters(): void {
    this.dataSource.filter = '';
    this.dataSource.filterPredicate = () => true;
  }

  novaConta(): void {
    const dialogRef = this.dialog.open(ContaCorrenteFormDialogComponent, {
      width: '800px',
      data: { conta: null, isEditing: false }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadContas();
        this.snackBar.open('Conta criada com sucesso!', 'OK', { duration: 3000 });
      }
    });
  }

  editarConta(conta: ContaCorrente): void {
    const dialogRef = this.dialog.open(ContaCorrenteFormDialogComponent, {
      width: '800px',
      data: { conta: { ...conta }, isEditing: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadContas();
        this.snackBar.open('Conta atualizada com sucesso!', 'OK', { duration: 3000 });
      }
    });
  }

  verMovimentacoes(contaId: number): void {
    // Implementar navegação para movimentações da conta
    this.snackBar.open('Funcionalidade de movimentações em desenvolvimento', 'OK', { duration: 3000 });
  }

  toggleStatus(conta: ContaCorrente): void {
    conta.ativo = !conta.ativo;
    this.snackBar.open(
      `Conta ${conta.ativo ? 'ativada' : 'desativada'} com sucesso!`,
      'OK',
      { duration: 3000 }
    );
  }

  excluirConta(conta: ContaCorrente): void {
    if (confirm(`Tem certeza que deseja excluir a conta "${conta.nome}"?`)) {
      const index = this.dataSource.data.findIndex(c => c.id === conta.id);
      if (index !== -1) {
        this.dataSource.data.splice(index, 1);
        this.dataSource.data = [...this.dataSource.data];
      }
      
      this.snackBar.open('Conta excluída com sucesso!', 'OK', {
        duration: 3000
      });
    }
  }
}
