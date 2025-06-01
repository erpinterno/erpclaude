import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { EmpresasListComponent } from './empresas-list/empresas-list.component';
import { EmpresasFormComponent } from './empresas-form/empresas-form.component';

@NgModule({
  declarations: [
    EmpresasListComponent,
    EmpresasFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: EmpresasListComponent },
      { path: 'novo', component: EmpresasFormComponent },
      { path: 'editar/:id', component: EmpresasFormComponent }
    ])
  ]
})
export class EmpresasModule { }
