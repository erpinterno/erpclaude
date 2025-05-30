import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  title: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport
          [attr.role]="'navigation'"
          [mode]="'side'"
          [opened]="true">
        <mat-toolbar>Menu</mat-toolbar>
        <mat-nav-list>
          <ng-container *ngFor="let item of menuItems">
            <ng-container *ngIf="!item.children">
              <a mat-list-item [routerLink]="item.route" routerLinkActive="active">
                <mat-icon matListItemIcon>{{item.icon}}</mat-icon>
                <span matListItemTitle>{{item.title}}</span>
              </a>
            </ng-container>

            <ng-container *ngIf="item.children">
              <mat-list-item (click)="toggleSubmenu(item.title)">
                <mat-icon matListItemIcon>{{item.icon}}</mat-icon>
                <span matListItemTitle>{{item.title}}</span>
                <mat-icon class="submenu-icon">
                  {{isSubmenuOpen(item.title) ? 'expand_less' : 'expand_more'}}
                </mat-icon>
              </mat-list-item>

              <div class="submenu" *ngIf="isSubmenuOpen(item.title)">
                <a mat-list-item *ngFor="let child of item.children" 
                   [routerLink]="child.route" 
                   routerLinkActive="active"
                   class="submenu-item">
                  <mat-icon matListItemIcon>{{child.icon}}</mat-icon>
                  <span matListItemTitle>{{child.title}}</span>
                </a>
              </div>
            </ng-container>
          </ng-container>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span>ERP Claude</span>
          <span class="spacer"></span>

          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>

          <mat-menu #userMenu="matMenu">
            <div mat-menu-item disabled class="user-info">
              <mat-icon>person</mat-icon>
              <span>{{(authService.currentUser$ | async)?.email}}</span>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Sair</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <div class="content-container">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100%;
    }

    .sidenav {
      width: 260px;
    }

    .sidenav .mat-toolbar {
      background: inherit;
    }

    .mat-toolbar.mat-primary {
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .submenu {
      overflow: hidden;
    }

    .submenu-item {
      padding-left: 60px !important;
    }

    .submenu-icon {
      margin-left: auto;
    }

    .active {
      background-color: rgba(63, 81, 181, 0.1);
    }

    .user-info {
      opacity: 0.8;
    }

    .content-container {
      padding: 20px;
      min-height: calc(100vh - 64px);
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 200px;
      }
    }
  `]
})
export class MainLayoutComponent {
  menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      title: 'Financeiro',
      icon: 'attach_money',
      children: [
        {
          title: 'Contas a Pagar',
          icon: 'money_off',
          route: '/financeiro/contas-pagar'
        },
        {
          title: 'Contas a Receber',
          icon: 'payments',
          route: '/financeiro/contas-receber'
        },
        {
          title: 'Conta Corrente',
          icon: 'account_balance',
          route: '/financeiro/conta-corrente'
        },
        {
          title: 'Importar/Exportar',
          icon: 'import_export',
          route: '/financeiro/import-export'
        }
      ]
    }
  ];

  openSubmenus = new Set<string>();

  constructor(public authService: AuthService) {}

  toggleSubmenu(title: string): void {
    if (this.openSubmenus.has(title)) {
      this.openSubmenus.delete(title);
    } else {
      this.openSubmenus.add(title);
    }
  }

  isSubmenuOpen(title: string): boolean {
    return this.openSubmenus.has(title);
  }

  logout(): void {
    this.authService.logout();
  }
}