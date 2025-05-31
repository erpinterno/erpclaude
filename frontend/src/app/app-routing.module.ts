// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'financeiro',
        children: [
          {
            path: 'contas-pagar',
            loadChildren: () => import('./features/financeiro/contas-pagar/contas-pagar.module').then(m => m.ContasPagarModule)
          },
          {
            path: 'contas-receber',
            loadChildren: () => import('./features/financeiro/contas-receber/contas-receber.module').then(m => m.ContasReceberModule)
          },
          {
            path: 'conta-corrente',
            loadChildren: () => import('./features/financeiro/conta-corrente/conta-corrente.module').then(m => m.ContaCorrenteModule)
          },
          {
            path: 'importacao',
            loadChildren: () => import('./features/financeiro/importacao/importacao.module').then(m => m.ImportacaoModule)
          }
        ]
      },
      {
        path: 'configuracoes',
        children: [
          {
            path: 'usuarios',
            loadChildren: () => import('./features/configuracoes/usuarios/usuarios.module').then(m => m.UsuariosModule)
          },
          {
            path: 'empresa',
            loadChildren: () => import('./features/configuracoes/empresa/empresa.module').then(m => m.EmpresaModule)
          },
          {
            path: 'cadastros',
            children: [
              {
                path: 'bancos',
                loadChildren: () => import('./features/configuracoes/cadastros/bancos/bancos.module').then(m => m.BancosModule)
              },
              {
                path: 'categorias',
                loadChildren: () => import('./features/configuracoes/cadastros/categorias/categorias.module').then(m => m.CategoriasModule)
              },
              {
                path: 'centros-custo',
                loadChildren: () => import('./features/configuracoes/cadastros/centros-custo/centros-custo.module').then(m => m.CentrosCustoModule)
              },
              {
                path: 'fornecedores',
                loadChildren: () => import('./features/configuracoes/cadastros/fornecedores/fornecedores.module').then(m => m.FornecedoresModule)
              },
              {
                path: 'clientes',
                loadChildren: () => import('./features/configuracoes/cadastros/clientes/clientes.module').then(m => m.ClientesModule)
              },
              {
                path: 'formas-pagamento',
                loadChildren: () => import('./features/configuracoes/cadastros/formas-pagamento/formas-pagamento.module').then(m => m.FormasPagamentoModule)
              },
              {
                path: 'plano-contas',
                loadChildren: () => import('./features/configuracoes/cadastros/plano-contas/plano-contas.module').then(m => m.PlanoContasModule)
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Para debug, mude para true se necessário
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }