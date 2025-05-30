import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService, User } from '../../services/auth.service';

interface MenuItem {
  title: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  badge?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatExpansionModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <!-- Menu Lateral -->
      <mat-sidenav #drawer class="sidenav" fixedInViewport
                   [attr.role]="isHandset ? 'dialog' : 'navigation'"
                   [mode]="isHandset ? 'over' : 'side'"
                   [opened]="!isHandset">
        
        <!-- Header do Menu -->
        <div class="sidenav-header">
          <div class="logo">
            <mat-icon class="logo-icon">business</mat-icon>
            <span class="logo-text">ERP Claude</span>
          </div>
          <div class="user-info" *ngIf="currentUser">
            <mat-icon>account_circle</mat-icon>
            <div class="user-details">
              <span class="user-name">{{ currentUser.full_name || currentUser.email }}</span>
              <span class="user-email">{{ currentUser.email }}</span>
            </div>
          </div>
        </div>

        <!-- Navegação -->
        <mat-nav-list class="nav-list">
          <!-- Dashboard -->
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>

          <!-- Módulo Financeiro -->
          <mat-expansion-panel class="nav-expansion-panel">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon class="panel-icon">attach_money</mat-icon>
                <span>Financeiro</span>
                <mat-icon class="expand-icon">expand_more</mat-icon>
              </mat-panel-title>
            </mat-expansion-panel-header>
            
            <div class="sub-menu">
              <a mat-list-item routerLink="/financeiro/contas-pagar" routerLinkActive="active">
                <mat-icon matListItemIcon>payment</mat-icon>
                <span matListItemTitle>Contas a Pagar</span>
              </a>
              <a mat-list-item routerLink="/financeiro/contas-receber" routerLinkActive="active">
                <mat-icon matListItemIcon>account_balance_wallet</mat-icon>
                <span matListItemTitle>Contas a Receber</span>
              </a>
              <a mat-list-item routerLink="/financeiro/conta-corrente" routerLinkActive="active">
                <mat-icon matListItemIcon>account_balance</mat-icon>
                <span matListItemTitle>Conta Corrente</span>
              </a>
              <a mat-list-item routerLink="/financeiro/import-export" routerLinkActive="active">
                <mat-icon matListItemIcon>import_export</mat-icon>
                <span matListItemTitle>Importação</span>
              </a>
            </div>
          </mat-expansion-panel>

          <!-- Módulo Configuração -->
          <mat-expansion-panel class="nav-expansion-panel">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon class="panel-icon">settings</mat-icon>
                <span>Configuração</span>
                <mat-icon class="expand-icon">expand_more</mat-icon>
              </mat-panel-title>
            </mat-expansion-panel-header>
            
            <div class="sub-menu">
              <a mat-list-item routerLink="/configuracao/usuarios" routerLinkActive="active">
                <mat-icon matListItemIcon>people</mat-icon>
                <span matListItemTitle>Usuários</span>
              </a>
              <a mat-list-item routerLink="/configuracao/perfis" routerLinkActive="active">
                <mat-icon matListItemIcon>security</mat-icon>
                <span matListItemTitle>Perfis de Acesso</span>
              </a>
              <a mat-list-item routerLink="/configuracao/sistema" routerLinkActive="active">
                <mat-icon matListItemIcon>settings_applications</mat-icon>
                <span matListItemTitle>Sistema</span>
              </a>
            </div>
          </mat-expansion-panel>
        </mat-nav-list>

        <!-- Footer do Menu -->
        <div class="sidenav-footer">
          <button mat-stroked-button (click)="logout()" class="logout-button">
            <mat-icon>logout</mat-icon>
            <span>Sair</span>
          </button>
        </div>
      </mat-sidenav>

      <!-- Conteúdo Principal -->
      <mat-sidenav-content class="main-content">
        <!-- Toolbar -->
        <mat-toolbar class="toolbar" color="primary">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()"
            *ngIf="isHandset">
            <mat-icon>menu</mat-icon>
          </button>
          
          <span class="toolbar-title">{{ getPageTitle() }}</span>
          
          <span class="toolbar-spacer"></span>
          
          <!-- Ações do usuário -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu" matTooltip="Menu do usuário">
            <mat-icon>account_circle</mat-icon>
          </button>
          
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/perfil">
              <mat-icon>person</mat-icon>
              <span>Meu Perfil</span>
            </button>
            <button mat-menu-item routerLink="/configuracao">
              <mat-icon>settings</mat-icon>
              <span>Configurações</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Sair</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- Área de Conteúdo -->
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 280px;
      background-color: #fafafa;
      border-right: 1px solid #e0e0e0;
    }

    .sidenav-header {
      padding: 20px 16px;
      border-bottom: 1px solid #e0e0e0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .logo-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 600;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 500;
    }

    .user-email {
      font-size: 12px;
      opacity: 0.8;
    }

    .nav-list {
      padding-top: 8px;
    }

    .nav-expansion-panel {
      box-shadow: none !important;
      background: transparent !important;
    }

    .nav-expansion-panel ::ng-deep .mat-expansion-panel-header {
      padding: 0 16px;
      height: 48px;
    }

    .nav-expansion-panel ::ng-deep .mat-expansion-panel-content {
      border-top: 1px solid #e0e0e0;
    }

    .panel-icon {
      margin-right: 12px;
      color: #666;
    }

    .expand-icon {
      margin-left: auto;
      color: #666;
    }

    .sub-menu {
      background-color: #f5f5f5;
    }

    .sub-menu a {
      padding-left: 32px !important;
      border-left: 3px solid transparent;
    }

    .sub-menu a.active {
      border-left-color: #667eea;
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .sidenav-footer {
      position: absolute;
      bottom: 16px;
      left: 16px;
      right: 16px;
    }

    .logout-button {
      width: 100%;
      justify-content: flex-start;
      gap: 8px;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toolbar-title {
      font-size: 18px;
      font-weight: 500;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .main-content {
      display: flex;
      flex-direction: column;
    }

    .content-area {
      flex: 1;
      padding: 0;
      overflow-y: auto;
      background-color: #fafafa;
    }

    // Estados ativos
    .mat-mdc-list-item.active {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .mat-mdc-list-item.active .mat-icon {
      color: #1976d2;
    }

    // Responsividade
    @media (max-width: 768px) {
      .sidenav {
        width: 100%;
      }
      
      .user-info {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    // Customização dos expansion panels
    ::ng-deep .mat-expansion-panel-header-title {
      display: flex;
      align-items: center;
      width: 100%;
    }

    ::ng-deep .mat-expansion-panel-body {
      padding: 0;
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  isHandset = false;
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Detecta se é mobile
    this.isHandset = window.innerWidth <= 768;
    
    // Escuta mudanças de tamanho da tela
    window.addEventListener('resize', () => {
      this.isHandset = window.innerWidth <= 768;
    });

    // Observa o usuário atual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getPageTitle(): string {
    const url = this.router.url;
    
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/financeiro/contas-pagar')) return 'Contas a Pagar';
    if (url.includes('/financeiro/contas-receber')) return 'Contas a Receber';
    if (url.includes('/financeiro/conta-corrente')) return 'Conta Corrente';
    if (url.includes('/financeiro/import-export')) return 'Importação';
    if (url.includes('/configuracao/usuarios')) return 'Gerenciamento de Usuários';
    if (url.includes('/configuracao/perfis')) return 'Perfis de Acesso';
    if (url.includes('/configuracao/sistema')) return 'Configurações do Sistema';
    if (url.includes('/configuracao')) return 'Configurações';
    if (url.includes('/financeiro')) return 'Financeiro';
    
    return 'ERP Claude';
  }

  logout(): void {
    this.authService.logout();
  }
}