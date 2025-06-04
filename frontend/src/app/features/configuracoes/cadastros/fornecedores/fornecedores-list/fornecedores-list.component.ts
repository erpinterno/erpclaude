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

interface Fornecedor {
  id: number;
  nome: string;
  tipo_pessoa: 'fisica' | 'juridica';
  cpf_cnpj: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  ativo: boolean;
}

@Component({
  selector: 'app-fornecedores-list',
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
    <div class="fornecedores-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>
              <mat-icon>business</mat-icon>
              Fornecedores
            </h1>
            <p>Gerencie seus fornecedores e prestadores de serviços</p>
          </div>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="novoFornecedor()">
            <mat-icon>add</mat-icon>
            Novo Fornecedor
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-container">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar fornecedores</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Nome, CPF/CNPJ...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select (selectionChange)="filterByTipo($event.value)">
                <mat-option value="">Todos</mat-option>
                <mat-option value="fisica">Pessoa Física</mat-option>
                <mat-option value="juridica">Pessoa Jurídica</mat-option>
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
            <table mat-table [dataSource]="dataSource" class="fornecedores-table">

              <!-- Coluna Nome -->
              <ng-container matColumnDef="nome">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>person</mat-icon>
                  Nome/Razão Social
                </th>
                <td mat-cell *matCellDef="let fornecedor">
                  <div class="cell-content">
                    <strong>{{ fornecedor.nome }}</strong>
                    <small>{{ getTipoLabel(fornecedor.tipo_pessoa) }}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Coluna CPF/CNPJ -->
              <ng-container matColumnDef="documento">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>fingerprint</mat-icon>
                  CPF/CNPJ
                </th>
                <td mat-cell *matCellDef="let fornecedor">{{ fornecedor.cpf_cnpj }}</td>
              </ng-container>

              <!-- Coluna Contato -->
              <ng-container matColumnDef="contato">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>contact_phone</mat-icon>
                  Contato
                </th>
                <td mat-cell *matCellDef="let fornecedor">
                  <div class="contact-info">
                    <div *ngIf="fornecedor.email">{{ fornecedor.email }}</div>
                    <div *ngIf="fornecedor.telefone">{{ fornecedor.telefone }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Localização -->
              <ng-container matColumnDef="localizacao">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>location_on</mat-icon>
                  Localização
                </th>
                <td mat-cell *matCellDef="let fornecedor">
                  <div *ngIf="fornecedor.cidade || fornecedor.estado">
                    {{ fornecedor.cidade }}<span *ngIf="fornecedor.cidade && fornecedor.estado">, </span>{{ fornecedor.estado }}
                  </div>
                  <div *ngIf="!fornecedor.cidade && !fornecedor.estado" class="no-data">
                    Não informado
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>flag</mat-icon>
                  Status
                </th>
                <td mat-cell *matCellDef="let fornecedor">
                  <mat-chip-set>
                    <mat-chip [class]="fornecedor.ativo ? 'status-ativo' : 'status-inativo'">
                      <mat-icon>{{ fornecedor.ativo ? 'check_circle' : 'cancel' }}</mat-icon>
                      {{ fornecedor.ativo ? 'Ativo' : 'Inativo' }}
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
                <td mat-cell *matCellDef="let fornecedor">
                  <div class="action-buttons">
                    <button mat-icon-button 
                            matTooltip="Editar" 
                            (click)="editarFornecedor(fornecedor.id)"
                            class="btn-edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            [matTooltip]="fornecedor.ativo ? 'Desativar' : 'Ativar'"
                            (click)="toggleStatus(fornecedor)"
                            [class]="fornecedor.ativo ? 'btn-deactivate' : 'btn-activate'">
                      <mat-icon>{{ fornecedor.ativo ? 'block' : 'check_circle' }}</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            matTooltip="Excluir" 
                            (click)="excluirFornecedor(fornecedor)"
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
                    <mat-icon>business</mat-icon>
                    <h3>Nenhum fornecedor encontrado</h3>
                    <p>Não há fornecedores que correspondam aos filtros aplicados.</p>
                    <button mat-raised-button color="primary" (click)="novoFornecedor()">
                      <mat-icon>add</mat-icon>
                      Adicionar primeiro fornecedor
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
    .fornecedores-container {
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

    .fornecedores-table {
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

    .contact-info {
      display: flex;
      flex-direction: column;
      font-size: 14px;
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
export class FornecedoresListComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'documento', 'contato', 'localizacao', 'status', 'acoes'];
  dataSource = new MatTableDataSource<Fornecedor>([]);

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFornecedores();
  }

  loadFornecedores(): void {
    // Dados de exemplo - substituir pela chamada ao serviço
    const fornecedoresExemplo: Fornecedor[] = [
      {
        id: 1,
        nome: 'Companhia Elétrica do Estado',
        tipo_pessoa: 'juridica',
        cpf_cnpj: '12.345.678/0001-90',
        email: 'contato@energia.com.br',
        telefone: '(11) 3333-4444',
        cidade: 'São Paulo',
        estado: 'SP',
        ativo: true
      },
      {
        id: 2,
        nome: 'Imobiliária XYZ Ltda',
        tipo_pessoa: 'juridica',
        cpf_cnpj: '98.765.432/0001-10',
        email: 'contato@imobiliaria.com',
        telefone: '(11) 2222-3333',
        cidade: 'São Paulo',
        estado: 'SP',
        ativo: true
      },
      {
        id: 3,
        nome: 'João Silva',
        tipo_pessoa: 'fisica',
        cpf_cnpj: '123.456.789-00',
        email: 'joao@email.com',
        telefone: '(11) 99999-8888',
        cidade: 'Santos',
        estado: 'SP',
        ativo: false
      },
      {
        id: 4,
        nome: 'TechService Informática',
        tipo_pessoa: 'juridica',
        cpf_cnpj: '55.666.777/0001-88',
        email: 'suporte@techservice.com',
        telefone: '(11) 4444-5555',
        cidade: 'Campinas',
        estado: 'SP',
        ativo: true
      }
    ];
    
    this.dataSource.data = fornecedoresExemplo;
  }

  getTipoLabel(tipo: string): string {
    return tipo === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica';
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByTipo(tipo: string): void {
    if (tipo) {
      this.dataSource.filterPredicate = (data: Fornecedor) => data.tipo_pessoa === tipo;
      this.dataSource.filter = 'trigger';
    } else {
      this.dataSource.filterPredicate = () => true;
      this.dataSource.filter = '';
    }
  }

  filterByStatus(status: string): void {
    if (status !== '') {
      const isActive = status === 'true';
      this.dataSource.filterPredicate = (data: Fornecedor) => data.ativo === isActive;
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

  novoFornecedor(): void {
    this.router.navigate(['/configuracoes/cadastros/fornecedores/novo']);
  }

  editarFornecedor(id: number): void {
    this.router.navigate(['/configuracoes/cadastros/fornecedores/editar', id]);
  }

  toggleStatus(fornecedor: Fornecedor): void {
    fornecedor.ativo = !fornecedor.ativo;
    this.snackBar.open(
      `Fornecedor ${fornecedor.ativo ? 'ativado' : 'desativado'} com sucesso!`,
      'OK',
      { duration: 3000 }
    );
  }

  excluirFornecedor(fornecedor: Fornecedor): void {
    if (confirm(`Tem certeza que deseja excluir o fornecedor "${fornecedor.nome}"?`)) {
      const index = this.dataSource.data.findIndex(f => f.id === fornecedor.id);
      if (index !== -1) {
        this.dataSource.data.splice(index, 1);
        this.dataSource.data = [...this.dataSource.data];
      }
      
      this.snackBar.open('Fornecedor excluído com sucesso!', 'OK', {
        duration: 3000
      });
    }
  }
}
