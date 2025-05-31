// src/app/features/configuracoes/cadastros/categorias/categorias.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { CategoriasListComponent } from './categorias-list/categorias-list.component';
import { CategoriasFormComponent } from './categorias-form/categorias-form.component';
// import { SharedModule } from '../../../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: CategoriasListComponent
  },
  {
    path: 'nova',
    component: CategoriasFormComponent
  },
  {
    path: 'editar/:id',
    component: CategoriasFormComponent
  }
];

@NgModule({
  declarations: [
    CategoriasListComponent,
    CategoriasFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class CategoriasModule { }