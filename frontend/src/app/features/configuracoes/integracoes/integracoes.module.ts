import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IntegracoesListComponent } from './integracoes-list/integracoes-list.component';
import { IntegracoesFormComponent } from './integracoes-form/integracoes-form.component';
import { TesteApiComponent } from './teste-api/teste-api.component';

@NgModule({
  declarations: [
    IntegracoesListComponent,
    IntegracoesFormComponent,
    TesteApiComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: IntegracoesListComponent },
      { path: 'novo', component: IntegracoesFormComponent },
      { path: 'editar/:id', component: IntegracoesFormComponent },
      { path: 'teste-api', component: TesteApiComponent }
    ])
  ]
})
export class IntegracoesModule { }
