// src/app/features/configuracoes/cadastros/bancos/bancos.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { BancosListComponent } from './bancos-list/bancos-list.component';
import { BancosFormComponent } from './bancos-form/bancos-form.component';
import { SharedModule } from '../../../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: BancosListComponent
  },
  {
    path: 'novo',
    component: BancosFormComponent
  },
  {
    path: 'editar/:id',
    component: BancosFormComponent
  }
];

@NgModule({
  declarations: [
    BancosListComponent,
    BancosFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class BancosModule { }