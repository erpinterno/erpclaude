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

interface Banco {
  id: number;
  codigo: string;
  nome: string;
  nome_completo?: string;
  site?: string;
  telefone?: string;
  ativo: boolean;
}

@Component({
  selector: 'app-bancos-list',
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
    <div class="bancos-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>
              <mat-icon>account_balance</mat-icon>
              Bancos
            </h1>
            <p>Gerencie os bancos utilizados no sistema</p>
          </div>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="novoBanco()">
            <mat-icon>add</mat-icon>
            Novo Banco
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-container">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar bancos</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Nome, código...">
              <mat-icon matSuffix>search</mat-icon>
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
            <table mat-table [dataSource]="dataSource" class="bancos-table">

              <!-- Coluna Código -->
              <ng-container matColumnDef="codigo">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>tag</mat-icon>
                  Código
                </th>
                <td mat-cell *matCellDef="let banco">
                  <span class="codigo-badge">{{ banco.codigo }}</span>
                </td>
              </ng-container>

              <!-- Coluna Nome -->
              <ng-container matColumnDef="nome">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>business</mat-icon>
                  Nome do Banco
                </th>
                <td mat-cell *matCellDef="let banco">
                  <div class="cell-content">
                    <strong>{{ banco.nome }}</strong>
                    <small *ngIf="banco.nome_completo">{{ banco.nome_completo }}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Contato -->
              <ng-container matColumnDef="contato">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>contact_phone</mat-icon>
                  Contato
                </th>
                <td mat-cell *matCellDef="let banco">
                  <div class="contact-info">
                    <div *ngIf="banco.site" class="contact-item">
                      <mat-icon>language</mat-icon>
                      <a [href]="banco.site" target="_blank">{{ banco.site }}</a>
                    </div>
                    <div *ngIf="banco.telefone" class="contact-item">
                      <mat-icon>phone</mat-icon>
                      {{ banco.telefone }}
                    </div>
                    <div *ngIf="!banco.site && !banco.telefone" class="no-data">
                      Não informado
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>flag</mat-icon>
                  Status
                </th>
                <td mat-cell *matCellDef="let banco">
                  <mat-chip-set>
                    <mat-chip [class]="banco.ativo ? 'status-ativo' : 'status-inativo'">
                      <mat-icon>{{ banco.ativo ? 'check_circle' : 'cancel' }}</mat-icon>
                      {{ banco.ativo ? 'Ativo' : 'Inativo' }}
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
                <td mat-cell *matCellDef="let banco">
                  <div class="action-buttons">
                    <button mat-icon-button 
                            matTooltip="Editar" 
                            (click)="editarBanco(banco.id)"
                            class="btn-edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            [matTooltip]="banco.ativo ? 'Desativar' : 'Ativar'"
                            (click)="toggleStatus(banco)"
                            [class]="banco.ativo ? 'btn-deactivate' : 'btn-activate'">
                      <mat-icon>{{ banco.ativo ? 'block' : 'check_circle' }}</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            matTooltip="Excluir" 
                            (click)="excluirBanco(banco)"
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
                <td class="mat-cell empty-state" colspan="5">
                  <div class="empty-content">
                    <mat-icon>account_balance</mat-icon>
                    <h3>Nenhum banco encontrado</h3>
                    <p>Não há bancos que correspondam aos filtros aplicados.</p>
                    <button mat-raised-button color="primary" (click)="novoBanco()">
                      <mat-icon>add</mat-icon>
                      Adicionar primeiro banco
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
    .bancos-container {
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

    .bancos-table {
      width: 100%;
    }

    .codigo-badge {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 500;
      font-family: monospace;
    }

    .cell-content {
      display: flex;
      flex-direction: column;
    }

    .cell-content small {
      color: #666;
      font-size: 12px;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .contact-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #666;
    }

    .contact-item a {
      color: #1976d2;
      text-decoration: none;
    }

    .contact-item a:hover {
      text-decoration: underline;
    }

    .no-data {
      color: #999;
      font-style: italic;
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
export class BancosListComponent implements OnInit {
  displayedColumns: string[] = ['codigo', 'nome', 'contato', 'status', 'acoes'];
  dataSource = new MatTableDataSource<Banco>([]);

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBancos();
  }

  loadBancos(): void {
    // Dados de exemplo - substituir pela chamada ao serviço
    const bancosExemplo: Banco[] = [
      {
        id: 1,
        codigo: '001',
        nome: 'Banco do Brasil',
        nome_completo: 'Banco do Brasil S.A.',
        site: 'https://www.bb.com.br',
        telefone: '0800 729 0001',
        ativo: true
      },
      {
        id: 2,
        codigo: '033',
        nome: 'Santander',
        nome_completo: 'Banco Santander (Brasil) S.A.',
        site: 'https://www.santander.com.br',
        telefone: '0800 762 7777',
        ativo: true
      },
      {
        id: 3,
        codigo: '104',
        nome: 'Caixa Econômica Federal',
        nome_completo: 'Caixa Econômica Federal',
        site: 'https://www.caixa.gov.br',
        telefone: '0800 726 0101',
        ativo: true
      },
      {
        id: 4,
        codigo: '237',
        nome: 'Bradesco',
        nome_completo: 'Banco Bradesco S.A.',
        site: 'https://www.bradesco.com.br',
        telefone: '0800 704 8383',
        ativo: true
      },
      {
        id: 5,
        codigo: '341',
        nome: 'Itaú',
        nome_completo: 'Itaú Unibanco S.A.',
        site: 'https://www.itau.com.br',
        telefone: '0800 728 0728',
        ativo: true
      },
      {
        id: 6,
        codigo: '745',
        nome: 'Citibank',
        nome_completo: 'Citibank N.A.',
        site: 'https://www.citibank.com.br',
        telefone: '0800 888 0248',
        ativo: false
      }
    ];
    
    this.dataSource.data = bancosExemplo;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByStatus(status: string): void {
    if (status !== '') {
      const isActive = status === 'true';
      this.dataSource.filterPredicate = (data: Banco) => data.ativo === isActive;
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

  novoBanco(): void {
    this.router.navigate(['/configuracoes/cadastros/bancos/novo']);
  }

  editarBanco(id: number): void {
    this.router.navigate(['/configuracoes/cadastros/bancos/editar', id]);
  }

  toggleStatus(banco: Banco): void {
    banco.ativo = !banco.ativo;
    this.snackBar.open(
      `Banco ${banco.ativo ? 'ativado' : 'desativado'} com sucesso!`,
      'OK',
      { duration: 3000 }
    );
  }

  excluirBanco(banco: Banco): void {
    if (confirm(`Tem certeza que deseja excluir o banco "${banco.nome}"?`)) {
      const index = this.dataSource.data.findIndex(b => b.id === banco.id);
      if (index !== -1) {
        this.dataSource.data.splice(index, 1);
        this.dataSource.data = [...this.dataSource.data];
      }
      
      this.snackBar.open('Banco excluído com sucesso!', 'OK', {
        duration: 3000
      });
    }
  }
}
