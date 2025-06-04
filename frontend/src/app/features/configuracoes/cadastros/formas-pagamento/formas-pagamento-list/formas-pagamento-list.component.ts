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

interface FormaPagamento {
  id: number;
  nome: string;
  tipo: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'boleto' | 'cheque';
  taxa_juros?: number;
  prazo_dias?: number;
  descricao?: string;
  ativo: boolean;
}

@Component({
  selector: 'app-formas-pagamento-list',
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
    MatTooltipModule
  ],
  template: `
    <div class="formas-pagamento-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>
              <mat-icon>payment</mat-icon>
              Formas de Pagamento
            </h1>
            <p>Gerencie as formas de pagamento aceitas pelo sistema</p>
          </div>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="novaFormaPagamento()">
            <mat-icon>add</mat-icon>
            Nova Forma de Pagamento
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-container">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar formas de pagamento</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Nome, tipo...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select (selectionChange)="filterByTipo($event.value)">
                <mat-option value="">Todos</mat-option>
                <mat-option value="dinheiro">Dinheiro</mat-option>
                <mat-option value="cartao_credito">Cartão de Crédito</mat-option>
                <mat-option value="cartao_debito">Cartão de Débito</mat-option>
                <mat-option value="pix">PIX</mat-option>
                <mat-option value="transferencia">Transferência</mat-option>
                <mat-option value="boleto">Boleto</mat-option>
                <mat-option value="cheque">Cheque</mat-option>
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
            <table mat-table [dataSource]="dataSource" class="formas-pagamento-table">

              <!-- Coluna Nome -->
              <ng-container matColumnDef="nome">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>label</mat-icon>
                  Nome
                </th>
                <td mat-cell *matCellDef="let forma">
                  <div class="cell-content">
                    <strong>{{ forma.nome }}</strong>
                    <small *ngIf="forma.descricao">{{ forma.descricao }}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Tipo -->
              <ng-container matColumnDef="tipo">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>category</mat-icon>
                  Tipo
                </th>
                <td mat-cell *matCellDef="let forma">
                  <mat-chip-set>
                    <mat-chip [class]="getTipoClass(forma.tipo)">
                      <mat-icon>{{ getTipoIcon(forma.tipo) }}</mat-icon>
                      {{ getTipoLabel(forma.tipo) }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Coluna Taxa de Juros -->
              <ng-container matColumnDef="taxa_juros">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>percent</mat-icon>
                  Taxa de Juros
                </th>
                <td mat-cell *matCellDef="let forma">
                  <div *ngIf="forma.taxa_juros">
                    {{ forma.taxa_juros }}% a.m.
                  </div>
                  <div *ngIf="!forma.taxa_juros" class="no-data">
                    Sem taxa
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Prazo -->
              <ng-container matColumnDef="prazo">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>schedule</mat-icon>
                  Prazo
                </th>
                <td mat-cell *matCellDef="let forma">
                  <div *ngIf="forma.prazo_dias">
                    {{ forma.prazo_dias }} {{ forma.prazo_dias === 1 ? 'dia' : 'dias' }}
                  </div>
                  <div *ngIf="!forma.prazo_dias" class="no-data">
                    À vista
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>flag</mat-icon>
                  Status
                </th>
                <td mat-cell *matCellDef="let forma">
                  <mat-chip-set>
                    <mat-chip [class]="forma.ativo ? 'status-ativo' : 'status-inativo'">
                      <mat-icon>{{ forma.ativo ? 'check_circle' : 'cancel' }}</mat-icon>
                      {{ forma.ativo ? 'Ativo' : 'Inativo' }}
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
                <td mat-cell *matCellDef="let forma">
                  <div class="action-buttons">
                    <button mat-icon-button 
                            matTooltip="Editar" 
                            (click)="editarFormaPagamento(forma.id)"
                            class="btn-edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            [matTooltip]="forma.ativo ? 'Desativar' : 'Ativar'"
                            (click)="toggleStatus(forma)"
                            [class]="forma.ativo ? 'btn-deactivate' : 'btn-activate'">
                      <mat-icon>{{ forma.ativo ? 'block' : 'check_circle' }}</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            matTooltip="Excluir" 
                            (click)="excluirFormaPagamento(forma)"
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
                <td class="mat-cell empty-state" colspan="6">
                  <div class="empty-content">
                    <mat-icon>payment</mat-icon>
                    <h3>Nenhuma forma de pagamento encontrada</h3>
                    <p>Não há formas de pagamento que correspondam aos filtros aplicados.</p>
                    <button mat-raised-button color="primary" (click)="novaFormaPagamento()">
                      <mat-icon>add</mat-icon>
                      Adicionar primeira forma de pagamento
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
    .formas-pagamento-container {
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

    .formas-pagamento-table {
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

    .no-data {
      color: #999;
      font-style: italic;
    }

    /* Tipos de pagamento */
    .tipo-dinheiro {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .tipo-cartao_credito {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .tipo-cartao_debito {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .tipo-pix {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .tipo-transferencia {
      background-color: #e0f2f1;
      color: #00695c;
    }

    .tipo-boleto {
      background-color: #fce4ec;
      color: #c2185b;
    }

    .tipo-cheque {
      background-color: #f1f8e9;
      color: #558b2f;
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
export class FormasPagamentoListComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'tipo', 'taxa_juros', 'prazo', 'status', 'acoes'];
  dataSource = new MatTableDataSource<FormaPagamento>([]);

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFormasPagamento();
  }

  loadFormasPagamento(): void {
    // Dados de exemplo - substituir pela chamada ao serviço
    const formasExemplo: FormaPagamento[] = [
      {
        id: 1,
        nome: 'Dinheiro',
        tipo: 'dinheiro',
        descricao: 'Pagamento em espécie',
        ativo: true
      },
      {
        id: 2,
        nome: 'Cartão de Crédito',
        tipo: 'cartao_credito',
        taxa_juros: 2.5,
        prazo_dias: 30,
        descricao: 'Pagamento com cartão de crédito',
        ativo: true
      },
      {
        id: 3,
        nome: 'Cartão de Débito',
        tipo: 'cartao_debito',
        descricao: 'Pagamento com cartão de débito',
        ativo: true
      },
      {
        id: 4,
        nome: 'PIX',
        tipo: 'pix',
        descricao: 'Pagamento instantâneo via PIX',
        ativo: true
      },
      {
        id: 5,
        nome: 'Transferência Bancária',
        tipo: 'transferencia',
        prazo_dias: 1,
        descricao: 'Transferência entre contas bancárias',
        ativo: true
      },
      {
        id: 6,
        nome: 'Boleto Bancário',
        tipo: 'boleto',
        prazo_dias: 3,
        descricao: 'Pagamento via boleto bancário',
        ativo: true
      },
      {
        id: 7,
        nome: 'Cheque',
        tipo: 'cheque',
        prazo_dias: 30,
        descricao: 'Pagamento com cheque',
        ativo: false
      },
      {
        id: 8,
        nome: 'Cartão Crédito Parcelado',
        tipo: 'cartao_credito',
        taxa_juros: 1.8,
        prazo_dias: 60,
        descricao: 'Cartão de crédito parcelado em 2x',
        ativo: true
      }
    ];
    
    this.dataSource.data = formasExemplo;
  }

  getTipoLabel(tipo: string): string {
    const tipos = {
      'dinheiro': 'Dinheiro',
      'cartao_credito': 'Cartão Crédito',
      'cartao_debito': 'Cartão Débito',
      'pix': 'PIX',
      'transferencia': 'Transferência',
      'boleto': 'Boleto',
      'cheque': 'Cheque'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  }

  getTipoIcon(tipo: string): string {
    const icones = {
      'dinheiro': 'attach_money',
      'cartao_credito': 'credit_card',
      'cartao_debito': 'payment',
      'pix': 'qr_code',
      'transferencia': 'swap_horiz',
      'boleto': 'receipt',
      'cheque': 'description'
    };
    return icones[tipo as keyof typeof icones] || 'payment';
  }

  getTipoClass(tipo: string): string {
    return `tipo-${tipo}`;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByTipo(tipo: string): void {
    if (tipo) {
      this.dataSource.filterPredicate = (data: FormaPagamento) => data.tipo === tipo;
      this.dataSource.filter = 'trigger';
    } else {
      this.dataSource.filterPredicate = () => true;
      this.dataSource.filter = '';
    }
  }

  filterByStatus(status: string): void {
    if (status !== '') {
      const isActive = status === 'true';
      this.dataSource.filterPredicate = (data: FormaPagamento) => data.ativo === isActive;
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

  novaFormaPagamento(): void {
    this.router.navigate(['/configuracoes/cadastros/formas-pagamento/novo']);
  }

  editarFormaPagamento(id: number): void {
    this.router.navigate(['/configuracoes/cadastros/formas-pagamento/editar', id]);
  }

  toggleStatus(forma: FormaPagamento): void {
    forma.ativo = !forma.ativo;
    this.snackBar.open(
      `Forma de pagamento ${forma.ativo ? 'ativada' : 'desativada'} com sucesso!`,
      'OK',
      { duration: 3000 }
    );
  }

  excluirFormaPagamento(forma: FormaPagamento): void {
    if (confirm(`Tem certeza que deseja excluir a forma de pagamento "${forma.nome}"?`)) {
      const index = this.dataSource.data.findIndex(f => f.id === forma.id);
      if (index !== -1) {
        this.dataSource.data.splice(index, 1);
        this.dataSource.data = [...this.dataSource.data];
      }
      
      this.snackBar.open('Forma de pagamento excluída com sucesso!', 'OK', {
        duration: 3000
      });
    }
  }
}
