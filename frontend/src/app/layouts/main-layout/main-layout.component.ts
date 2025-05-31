// src/app/layouts/main-layout/main-layout.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
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
            }
          ]
        },
        {
          label: 'Usuários',
          icon: 'fas fa-user-cog',
          routerLink: '/configuracoes/usuarios'
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