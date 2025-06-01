import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Rota padrão - redireciona para login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Login (público)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // Layout principal com menu lateral (protegido)
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // Módulo Financeiro
      {
        path: 'financeiro',
        children: [
          {
            path: '',
            redirectTo: 'contas-pagar',
            pathMatch: 'full'
          },
          {
            path: 'contas-pagar',
            loadComponent: () => import('./features/financeiro/contas-pagar/contas-pagar.component').then(m => m.ContasPagarComponent)
          },
          {
            path: 'contas-receber',
            loadComponent: () => import('./features/financeiro/contas-receber/contas-receber.component').then(m => m.ContasReceberComponent)
          },
          {
            path: 'conta-corrente',
            loadComponent: () => import('./features/financeiro/conta-corrente/conta-corrente.component').then(m => m.ContaCorrenteComponent)
          },
          {
            path: 'import-export',
            loadComponent: () => import('./features/financeiro/import-export/import-export.component').then(m => m.ImportExportComponent)
          }
        ]
      },

      // Módulo Configuração
      {
        path: 'configuracao',
        children: [
          {
            path: '',
            redirectTo: 'usuarios',
            pathMatch: 'full'
          },
          {
            path: 'usuarios',
            loadComponent: () => import('./features/configuracao/usuarios/usuarios.component').then(m => m.UsuariosComponent)
          },
          {
            path: 'perfis',
            loadComponent: () => import('./features/configuracao/perfis/perfis.component').then(m => m.PerfisComponent)
          },
          {
            path: 'sistema',
            loadComponent: () => import('./features/configuracao/sistema/sistema.component').then(m => m.SistemaComponent)
          }
        ]
      },

      // Módulo Configurações (novo)
      {
        path: 'configuracoes',
        children: [
          {
            path: 'cadastros',
            children: [
              {
                path: 'empresas',
                loadChildren: () => import('./features/configuracoes/cadastros/empresas/empresas.module').then(m => m.EmpresasModule)
              }
            ]
          },
          {
            path: 'integracoes',
            loadChildren: () => import('./features/configuracoes/integracoes/integracoes.module').then(m => m.IntegracoesModule)
          }
        ]
      },

      // Redireciona para dashboard se não especificado
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Página não encontrada
  {
    path: '**',
    redirectTo: '/login'
  }
];
