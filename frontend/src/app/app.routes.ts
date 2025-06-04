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
            path: '',
            redirectTo: 'cadastros',
            pathMatch: 'full'
          },
          {
            path: 'cadastros',
            children: [
              {
                path: '',
                redirectTo: 'fornecedores',
                pathMatch: 'full'
              },
              {
                path: 'fornecedores',
                children: [
                  {
                    path: '',
                    loadComponent: () => import('./features/configuracoes/cadastros/fornecedores/fornecedores-list/fornecedores-list.component').then(m => m.FornecedoresListComponent)
                  },
                  {
                    path: 'novo',
                    loadComponent: () => import('./features/configuracoes/cadastros/fornecedores/fornecedores-form/fornecedores-form.component').then(m => m.FornecedoresFormComponent)
                  },
                  {
                    path: 'editar/:id',
                    loadComponent: () => import('./features/configuracoes/cadastros/fornecedores/fornecedores-form/fornecedores-form.component').then(m => m.FornecedoresFormComponent)
                  }
                ]
              },
              {
                path: 'bancos',
                children: [
                  {
                    path: '',
                    loadComponent: () => import('./features/configuracoes/cadastros/bancos/bancos-list/bancos-list.component').then(m => m.BancosListComponent)
                  },
                  {
                    path: 'novo',
                    loadComponent: () => import('./features/configuracoes/cadastros/bancos/bancos-form/bancos-form.component').then(m => m.BancosFormComponent)
                  },
                  {
                    path: 'editar/:id',
                    loadComponent: () => import('./features/configuracoes/cadastros/bancos/bancos-form/bancos-form.component').then(m => m.BancosFormComponent)
                  }
                ]
              },
              {
                path: 'clientes',
                children: [
                  {
                    path: '',
                    loadComponent: () => import('./features/configuracoes/cadastros/clientes/clientes-list/clientes-list.component').then(m => m.ClientesListComponent)
                  },
                  {
                    path: 'novo',
                    loadComponent: () => import('./features/configuracoes/cadastros/clientes/clientes-form/clientes-form.component').then(m => m.ClientesFormComponent)
                  },
                  {
                    path: 'editar/:id',
                    loadComponent: () => import('./features/configuracoes/cadastros/clientes/clientes-form/clientes-form.component').then(m => m.ClientesFormComponent)
                  }
                ]
              },
              {
                path: 'empresas',
                children: [
                  {
                    path: '',
                    loadComponent: () => import('./features/configuracoes/cadastros/empresas/empresas-list/empresas-list.component').then(m => m.EmpresasListComponent)
                  },
                  {
                    path: 'novo',
                    loadComponent: () => import('./features/configuracoes/cadastros/empresas/empresas-form/empresas-form.component').then(m => m.EmpresasFormComponent)
                  },
                  {
                    path: 'editar/:id',
                    loadComponent: () => import('./features/configuracoes/cadastros/empresas/empresas-form/empresas-form.component').then(m => m.EmpresasFormComponent)
                  }
                ]
              },
              {
                path: 'formas-pagamento',
                children: [
                  {
                    path: '',
                    loadComponent: () => import('./features/configuracoes/cadastros/formas-pagamento/formas-pagamento-list/formas-pagamento-list.component').then(m => m.FormasPagamentoListComponent)
                  },
                  {
                    path: 'novo',
                    loadComponent: () => import('./features/configuracoes/cadastros/formas-pagamento/formas-pagamento-form/formas-pagamento-form.component').then(m => m.FormasPagamentoFormComponent)
                  },
                  {
                    path: 'editar/:id',
                    loadComponent: () => import('./features/configuracoes/cadastros/formas-pagamento/formas-pagamento-form/formas-pagamento-form.component').then(m => m.FormasPagamentoFormComponent)
                  }
                ]
              },
              {
                path: 'categorias',
                loadChildren: () => import('./features/configuracoes/cadastros/categorias/categorias.module').then(m => m.CategoriasModule)
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
