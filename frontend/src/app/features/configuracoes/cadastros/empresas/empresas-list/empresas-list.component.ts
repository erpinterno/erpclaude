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

interface Empresa {
  id: number;
  razao_social: string;
  nome_fantasia?: string;
  cnpj?: string;
  inscricao_estadual?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  tipo_atividade?: string;
  ativo: boolean;
}

@Component({
  selector: 'app-empresas-list',
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
    <div class="empresas-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>
              <mat-icon>business</mat-icon>
              Empresas
            </h1>
            <p>Gerencie as empresas do sistema</p>
          </div>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="novaEmpresa()">
            <mat-icon>add</mat-icon>
            Nova Empresa
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-container">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar empresas</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Razão social, CNPJ...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo de Atividade</mat-label>
              <mat-select (selectionChange)="filterByTipo($event.value)">
                <mat-option value="">Todos</mat-option>
                <mat-option value="0">Outros</mat-option>
                <mat-option value="1">Industrial</mat-option>
                <mat-option value="2">Comercial</mat-option>
                <mat-option value="3">Prestação de serviços</mat-option>
                <mat-option value="4">Construção civil</mat-option>
                <mat-option value="5">Produtor rural</mat-option>
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
            <table mat-table [dataSource]="dataSource" class="empresas-table">

              <!-- Coluna Empresa -->
              <ng-container matColumnDef="empresa">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>business</mat-icon>
                  Empresa
                </th>
                <td mat-cell *matCellDef="let empresa">
                  <div class="cell-content">
                    <strong>{{ empresa.razao_social }}</strong>
                    <small *ngIf="empresa.nome_fantasia">{{ empresa.nome_fantasia }}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Coluna CNPJ -->
              <ng-container matColumnDef="cnpj">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>fingerprint</mat-icon>
                  CNPJ
                </th>
                <td mat-cell *matCellDef="let empresa">
                  {{ empresa.cnpj || 'Não informado' }}
                </td>
              </ng-container>

              <!-- Coluna Contato -->
              <ng-container matColumnDef="contato">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>contact_phone</mat-icon>
                  Contato
                </th>
                <td mat-cell *matCellDef="let empresa">
                  <div class="contact-info">
                    <div *ngIf="empresa.email">{{ empresa.email }}</div>
                    <div *ngIf="empresa.telefone">{{ empresa.telefone }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Localização -->
              <ng-container matColumnDef="localizacao">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>location_on</mat-icon>
                  Localização
                </th>
                <td mat-cell *matCellDef="let empresa">
                  <div *ngIf="empresa.cidade || empresa.estado">
                    {{ empresa.cidade }}<span *ngIf="empresa.cidade && empresa.estado">, </span>{{ empresa.estado }}
                  </div>
                  <div *ngIf="!empresa.cidade && !empresa.estado" class="no-data">
                    Não informado
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Tipo -->
              <ng-container matColumnDef="tipo">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>category</mat-icon>
                  Tipo
                </th>
                <td mat-cell *matCellDef="let empresa">
                  {{ getTipoAtividadeLabel(empresa.tipo_atividade) }}
                </td>
              </ng-container>

              <!-- Coluna Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>flag</mat-icon>
                  Status
                </th>
                <td mat-cell *matCellDef="let empresa">
                  <mat-chip-set>
                    <mat-chip [class]="empresa.ativo ? 'status-ativo' : 'status-inativo'">
                      <mat-icon>{{ empresa.ativo ? 'check_circle' : 'cancel' }}</mat-icon>
                      {{ empresa.ativo ? 'Ativo' : 'Inativo' }}
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
                <td mat-cell *matCellDef="let empresa">
                  <div class="action-buttons">
                    <button mat-icon-button 
                            matTooltip="Editar" 
                            (click)="editarEmpresa(empresa.id)"
                            class="btn-edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            [matTooltip]="empresa.ativo ? 'Desativar' : 'Ativar'"
                            (click)="toggleStatus(empresa)"
                            [class]="empresa.ativo ? 'btn-deactivate' : 'btn-activate'">
                      <mat-icon>{{ empresa.ativo ? 'block' : 'check_circle' }}</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            matTooltip="Excluir" 
                            (click)="excluirEmpresa(empresa)"
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
                    <mat-icon>business</mat-icon>
                    <h3>Nenhuma empresa encontrada</h3>
                    <p>Não há empresas que correspondam aos filtros aplicados.</p>
                    <button mat-raised-button color="primary" (click)="novaEmpresa()">
                      <mat-icon>add</mat-icon>
                      Adicionar primeira empresa
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
    .empresas-container {
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

    .empresas-table {
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
export class EmpresasListComponent implements OnInit {
  displayedColumns: string[] = ['empresa', 'cnpj', 'contato', 'localizacao', 'tipo', 'status', 'acoes'];
  dataSource = new MatTableDataSource<Empresa>([]);

  tiposAtividade = [
    { value: '0', label: 'Outros' },
    { value: '1', label: 'Industrial' },
    { value: '2', label: 'Comercial' },
    { value: '3', label: 'Prestação de serviços' },
    { value: '4', label: 'Construção civil' },
    { value: '5', label: 'Produtor rural' }
  ];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEmpresas();
  }

  loadEmpresas(): void {
    // Dados de exemplo - substituir pela chamada ao serviço
    const empresasExemplo: Empresa[] = [
      {
        id: 1,
        razao_social: 'Tech Solutions Ltda',
        nome_fantasia: 'TechSol',
        cnpj: '12.345.678/0001-90',
        inscricao_estadual: '123456789',
        email: 'contato@techsol.com.br',
        telefone: '(11) 3333-4444',
        cidade: 'São Paulo',
        estado: 'SP',
        tipo_atividade: '3',
        ativo: true
      },
      {
        id: 2,
        razao_social: 'Indústria Metalúrgica ABC S.A.',
        nome_fantasia: 'MetalABC',
        cnpj: '98.765.432/0001-10',
        inscricao_estadual: '987654321',
        email: 'vendas@metalabc.com.br',
        telefone: '(11) 2222-3333',
        cidade: 'São Bernardo do Campo',
        estado: 'SP',
        tipo_atividade: '1',
        ativo: true
      },
      {
        id: 3,
        razao_social: 'Comércio de Materiais XYZ Ltda',
        nome_fantasia: 'MateriaisXYZ',
        cnpj: '55.666.777/0001-88',
        inscricao_estadual: '555666777',
        email: 'vendas@materiaisxyz.com',
        telefone: '(11) 4444-5555',
        cidade: 'Guarulhos',
        estado: 'SP',
        tipo_atividade: '2',
        ativo: false
      },
      {
        id: 4,
        razao_social: 'Construtora Exemplo Ltda',
        nome_fantasia: 'ConstrEx',
        cnpj: '11.222.333/0001-44',
        inscricao_estadual: '112223334',
        email: 'obras@construex.com.br',
        telefone: '(11) 5555-6666',
        cidade: 'Osasco',
        estado: 'SP',
        tipo_atividade: '4',
        ativo: true
      }
    ];
    
    this.dataSource.data = empresasExemplo;
  }

  getTipoAtividadeLabel(tipo?: string): string {
    const tipoEncontrado = this.tiposAtividade.find(t => t.value === tipo);
    return tipoEncontrado ? tipoEncontrado.label : 'Não informado';
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByTipo(tipo: string): void {
    if (tipo) {
      this.dataSource.filterPredicate = (data: Empresa) => data.tipo_atividade === tipo;
      this.dataSource.filter = 'trigger';
    } else {
      this.dataSource.filterPredicate = () => true;
      this.dataSource.filter = '';
    }
  }

  filterByStatus(status: string): void {
    if (status !== '') {
      const isActive = status === 'true';
      this.dataSource.filterPredicate = (data: Empresa) => data.ativo === isActive;
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

  novaEmpresa(): void {
    this.router.navigate(['/configuracoes/cadastros/empresas/novo']);
  }

  editarEmpresa(id: number): void {
    this.router.navigate(['/configuracoes/cadastros/empresas/editar', id]);
  }

  toggleStatus(empresa: Empresa): void {
    empresa.ativo = !empresa.ativo;
    this.snackBar.open(
      `Empresa ${empresa.ativo ? 'ativada' : 'desativada'} com sucesso!`,
      'OK',
      { duration: 3000 }
    );
  }

  excluirEmpresa(empresa: Empresa): void {
    if (confirm(`Tem certeza que deseja excluir a empresa "${empresa.razao_social}"?`)) {
      const index = this.dataSource.data.findIndex(e => e.id === empresa.id);
      if (index !== -1) {
        this.dataSource.data.splice(index, 1);
        this.dataSource.data = [...this.dataSource.data];
      }
      
      this.snackBar.open('Empresa excluída com sucesso!', 'OK', {
        duration: 3000
      });
    }
  }
}
