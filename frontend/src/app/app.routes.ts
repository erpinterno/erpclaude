import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'financeiro',
        children: [
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
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];