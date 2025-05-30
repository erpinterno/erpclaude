import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface Usuario {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: Date;
  last_login?: Date;
  perfil: string;
  departamento: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="usuarios-container">
      
      <!-- Header com ações -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <mat-icon>people</mat-icon>
            Gerenciamento de Usuários
          </h1>
          <p class="header-subtitle">Gerencie usuários, permissões e acessos do sistema</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="openDialog()">
            <mat-icon>person_add</mat-icon>
            Novo Usuário
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>filter_list</mat-icon>
            Filtros
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Buscar</mat-label>
              <input matInput 
                     (keyup)="applyFilter($event)" 
                     placeholder="Nome, email..."
                     #searchInput>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="filterByStatus($event.value)">
                <mat-option value="">Todos</mat-option>
                <mat-option value="active">Ativos</mat-option>
                <mat-option value="inactive">Inativos</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Limpar Filtros
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Tabela de Usuários -->
      <mat-card class="table-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>list</mat-icon>
            Lista de Usuários
            <mat-chip class="user-count">{{ dataSource.data.length }} usuário(s)</mat-chip>
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="usuarios-table">

              <!-- Avatar e Nome -->
              <ng-container matColumnDef="usuario">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="full_name">Usuário</th>
                <td mat-cell *matCellDef="let usuario">
                  <div class="user-cell">
                    <div class="user-avatar">
                      <mat-icon>account_circle</mat-icon>
                    </div>
                    <div class="user-info">
                      <div class="user-name">{{ usuario.full_name }}</div>
                      <div class="user-email">{{ usuario.email }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="is_active">Status</th>
                <td mat-cell *matCellDef="let usuario">
                  <mat-chip 
                    [ngClass]="usuario.is_active ? 'status-active' : 'status-inactive'"
                    class="status-chip">
                    <mat-icon>{{ usuario.is_active ? 'check_circle' : 'cancel' }}</mat-icon>
                    {{ usuario.is_active ? 'Ativo' : 'Inativo' }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Perfil -->
              <ng-container matColumnDef="perfil">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="perfil">Perfil</th>
                <td mat-cell *matCellDef="let usuario">
                  <mat-chip class="perfil-chip">
                    {{ getPerfilLabel(usuario.perfil) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Ações -->
              <ng-container matColumnDef="acoes">
                <th mat-header-cell *matHeaderCellDef>Ações</th>
                <td mat-cell *matCellDef="let usuario">
                  <div class="action-buttons">
                    <button mat-icon-button 
                            color="primary" 
                            (click)="editUser(usuario)"
                            matTooltip="Editar usuário">
                      <mat-icon>edit</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            [color]="usuario.is_active ? 'warn' : 'accent'"
                            (click)="toggleUserStatus(usuario)"
                            [matTooltip]="usuario.is_active ? 'Desativar usuário' : 'Ativar usuário'">
                      <mat-icon>{{ usuario.is_active ? 'block' : 'check_circle' }}</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" [attr.colspan]="displayedColumns.length">
                  <div class="no-data">
                    <mat-icon>people_outline</mat-icon>
                    <h3>Nenhum usuário encontrado</h3>
                    <p>Tente ajustar os filtros ou adicione um novo usuário</p>
                    <button mat-raised-button color="primary" (click)="openDialog()">
                      <mat-icon>person_add</mat-icon>
                      Adicionar Usuário
                    </button>
                  </div>
                </td>
              </tr>
            </table>
          </div>

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
    .usuarios-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      gap: 20px;
    }

    .header-content h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 500;
      color: #333;
    }

    .header-subtitle {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-form {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: flex-end;
    }

    .filters-form mat-form-field {
      min-width: 200px;
      flex: 1;
    }

    .table-card .mat-mdc-card-header {
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 16px;
    }

    .user-count {
      margin-left: 16px;
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .table-container {
      overflow-x: auto;
    }

    .usuarios-table {
      width: 100%;
      min-width: 600px;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 500;
      color: #333;
    }

    .user-email {
      font-size: 12px;
      color: #666;
    }

    .status-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      min-height: 24px;
    }

    .status-active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-inactive {
      background-color: #ffebee;
      color: #c62828;
    }

    .perfil-chip {
      font-size: 11px;
      min-height: 20px;
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .no-data {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    @media (max-width: 768px) {
      .usuarios-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .filters-form {
        flex-direction: column;
      }
    }
  `]
})
export class UsuariosComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['usuario', 'status', 'perfil', 'acoes'];
  dataSource = new MatTableDataSource<Usuario>([]);
  
  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsuarios(): void {
    const usuariosExemplo: Usuario[] = [
      {
        id: 1,
        email: 'admin@example.com',
        full_name: 'Administrador do Sistema',
        is_active: true,
        is_superuser: true,
        created_at: new Date('2024-01-15'),
        last_login: new Date('2025-05-30T14:30:00'),
        perfil: 'admin',
        departamento: 'TI'
      },
      {
        id: 2,
        email: 'eltonaib@gmail.com',
        full_name: 'Elton Aib',
        is_active: true,
        is_superuser: false,
        created_at: new Date('2024-05-20'),
        last_login: new Date('2025-05-30T10:15:00'),
        perfil: 'user',
        departamento: 'TI'
      },
      {
        id: 3,
        email: 'financeiro@example.com',
        full_name: 'Maria Silva',
        is_active: true,
        is_superuser: false,
        created_at: new Date('2024-03-10'),
        last_login: new Date('2025-05-29T16:45:00'),
        perfil: 'financeiro',
        departamento: 'Financeiro'
      }
    ];
    
    this.dataSource.data = usuariosExemplo;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByStatus(status: string): void {
    if (status === 'active') {
      this.dataSource.filterPredicate = (data: Usuario) => data.is_active;
    } else if (status === 'inactive') {
      this.dataSource.filterPredicate = (data: Usuario) => !data.is_active;
    } else {
      this.dataSource.filterPredicate = () => true;
    }
    this.dataSource.filter = 'trigger';
  }

  clearFilters(): void {
    this.dataSource.filter = '';
    this.dataSource.filterPredicate = () => true;
    
    const searchInput = document.querySelector('input[placeholder="Nome, email..."]') as HTMLInputElement;
    if (searchInput) searchInput.value = '';
  }

  getPerfilLabel(perfil: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      user: 'Usuário',
      financeiro: 'Financeiro'
    };
    return labels[perfil] || perfil;
  }

  openDialog(usuario?: Usuario): void {
    this.snackBar.open('Dialog de usuário em desenvolvimento', 'OK', {
      duration: 3000
    });
  }

  editUser(usuario: Usuario): void {
    this.openDialog(usuario);
  }

  toggleUserStatus(usuario: Usuario): void {
    usuario.is_active = !usuario.is_active;
    const status = usuario.is_active ? 'ativado' : 'desativado';
    
    this.snackBar.open(`Usuário ${status} com sucesso`, 'OK', {
      duration: 3000
    });
  }
}