// src/app/layouts/main-layout/main-layout.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

// Angular Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatExpansionModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['../main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  currentUser: any;
  sidebarCollapsed = false;

  menuItems = [
    {
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      routerLink: '/dashboard',
      type: 'single'
    },
    {
      label: 'Financeiro',
      icon: 'fas fa-dollar-sign',
      type: 'group',
      expanded: false,
      children: [
        {
          label: 'Contas a Pagar',
          icon: 'fas fa-file-invoice-dollar',
          routerLink: '/financeiro/contas-pagar'
        },
        {
          label: 'Contas a Receber',
          icon: 'fas fa-hand-holding-usd',
          routerLink: '/financeiro/contas-receber'
        },
        {
          label: 'Conta Corrente',
          icon: 'fas fa-university',
          routerLink: '/financeiro/conta-corrente'
        },
        {
          label: 'Importação Excel',
          icon: 'fas fa-file-excel',
          routerLink: '/financeiro/importacao'
        }
      ]
    },
    {
      label: 'Configurações',
      icon: 'fas fa-cogs',
      type: 'group',
      expanded: false,
      children: [
        {
          label: 'Cadastros de Tabelas',
          icon: 'fas fa-table',
          type: 'subgroup',
          expanded: false,
          children: [
            {
              label: 'Bancos',
              icon: 'fas fa-university',
              routerLink: '/configuracoes/cadastros/bancos'
            },
            {
              label: 'Categorias',
              icon: 'fas fa-tags',
              routerLink: '/configuracoes/cadastros/categorias'
            },
            {
              label: 'Centros de Custo',
              icon: 'fas fa-chart-pie',
              routerLink: '/configuracoes/cadastros/centros-custo'
            },
            {
              label: 'Fornecedores',
              icon: 'fas fa-truck',
              routerLink: '/configuracoes/cadastros/fornecedores'
            },
            {
              label: 'Clientes',
              icon: 'fas fa-users',
              routerLink: '/configuracoes/cadastros/clientes'
            },
            {
              label: 'Formas de Pagamento',
              icon: 'fas fa-credit-card',
              routerLink: '/configuracoes/cadastros/formas-pagamento'
            },
            {
              label: 'Plano de Contas',
              icon: 'fas fa-list-alt',
              routerLink: '/configuracoes/cadastros/plano-contas'
            },
            {
              label: 'Empresas',
              icon: 'fas fa-building',
              routerLink: '/configuracoes/cadastros/empresas'
            }
          ]
        },
        {
          label: 'Usuários',
          icon: 'fas fa-user-cog',
          routerLink: '/configuracoes/usuarios'
        },
        {
          label: 'Integrações',
          icon: 'fas fa-plug',
          routerLink: '/configuracoes/integracoes'
        },
        {
          label: 'Empresa',
          icon: 'fas fa-building',
          routerLink: '/configuracoes/empresa'
        }
      ]
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
   this.currentUser = this.authService.getCurrentUserValue();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMenu(item: any) {
    if (item.type === 'group' || item.type === 'subgroup') {
      item.expanded = !item.expanded;
      
      // Se está fechando, fechar todos os filhos também
      if (!item.expanded && item.children) {
        item.children.forEach((child: any) => {
          if (child.type === 'subgroup') {
            child.expanded = false;
          }
        });
      }
    }
  }

  isActiveRoute(routerLink: string): boolean {
    return this.router.url === routerLink;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
