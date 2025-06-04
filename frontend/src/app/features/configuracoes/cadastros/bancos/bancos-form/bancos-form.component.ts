import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

interface Banco {
  id?: number;
  codigo: string;
  nome: string;
  nome_completo?: string;
  site?: string;
  telefone?: string;
  ativo: boolean;
  observacoes?: string;
}

@Component({
  selector: 'app-bancos-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  template: `
    <div class="banco-form-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <button mat-icon-button (click)="voltar()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-text">
            <h1>{{ isEditing ? 'Editar Banco' : 'Novo Banco' }}</h1>
            <p>{{ isEditing ? 'Atualize as informações do banco' : 'Cadastre um novo banco' }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="voltar()" type="button">
            <mat-icon>close</mat-icon>
            Cancelar
          </button>
          <button mat-raised-button 
                  color="primary" 
                  (click)="onSubmit()" 
                  [disabled]="bancoForm.invalid || isSubmitting">
            <mat-icon>{{ isSubmitting ? 'hourglass_empty' : 'save' }}</mat-icon>
            {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <!-- Formulário -->
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="bancoForm" class="banco-form">
            
            <!-- Informações Básicas -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>account_balance</mat-icon>
                Informações do Banco
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="codigo-field">
                  <mat-label>Código do Banco *</mat-label>
                  <input matInput 
                         formControlName="codigo" 
                         placeholder="000"
                         maxlength="3"
                         (input)="onCodigoChange($event)">
                  <mat-icon matSuffix>tag</mat-icon>
                  <mat-error *ngIf="bancoForm.get('codigo')?.hasError('required')">
                    Código é obrigatório
                  </mat-error>
                  <mat-error *ngIf="bancoForm.get('codigo')?.hasError('pattern')">
                    Código deve conter apenas números
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="status-field">
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="ativo">
                    <mat-option [value]="true">
                      <mat-icon class="status-icon active">check_circle</mat-icon>
                      Ativo
                    </mat-option>
                    <mat-option [value]="false">
                      <mat-icon class="status-icon inactive">cancel</mat-icon>
                      Inativo
                    </mat-option>
                  </mat-select>
                  <mat-icon matSuffix>flag</mat-icon>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nome do Banco *</mat-label>
                  <input matInput 
                         formControlName="nome" 
                         placeholder="Ex: Banco do Brasil"
                         maxlength="100">
                  <mat-icon matSuffix>business</mat-icon>
                  <mat-error *ngIf="bancoForm.get('nome')?.hasError('required')">
                    Nome é obrigatório
                  </mat-error>
                  <mat-error *ngIf="bancoForm.get('nome')?.hasError('minlength')">
                    Nome deve ter pelo menos 2 caracteres
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nome Completo</mat-label>
                  <input matInput 
                         formControlName="nome_completo" 
                         placeholder="Ex: Banco do Brasil S.A."
                         maxlength="200">
                  <mat-icon matSuffix>description</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <!-- Informações de Contato -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>contact_phone</mat-icon>
                Informações de Contato
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Site</mat-label>
                  <input matInput 
                         type="url"
                         formControlName="site" 
                         placeholder="https://www.banco.com.br">
                  <mat-icon matSuffix>language</mat-icon>
                  <mat-error *ngIf="bancoForm.get('site')?.hasError('pattern')">
                    URL inválida
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Telefone</mat-label>
                        <input matInput 
                               formControlName="telefone" 
                               placeholder="0800 123 4567">
                  <mat-icon matSuffix>phone</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <!-- Observações -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>notes</mat-icon>
                Observações
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Observações</mat-label>
                  <textarea matInput 
                            formControlName="observacoes" 
                            rows="3"
                            maxlength="500"
                            placeholder="Informações adicionais sobre o banco..."></textarea>
                  <mat-icon matSuffix>comment</mat-icon>
                  <mat-hint align="end">
                    {{ bancoForm.get('observacoes')?.value?.length || 0 }}/500
                  </mat-hint>
                </mat-form-field>
              </div>
            </div>

          </form>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .banco-form-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-button {
      color: #666;
    }

    .header-text h1 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .header-text p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .form-card {
      margin-bottom: 24px;
    }

    .banco-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      background: #fafafa;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 20px 0;
      color: #666;
      font-size: 16px;
      font-weight: 500;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row:last-child {
      margin-bottom: 0;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .codigo-field {
      flex: 0 0 150px;
    }

    .status-field {
      flex: 1;
    }

    .status-icon {
      margin-right: 8px;
      font-size: 16px;
    }

    .status-icon.active { color: #4caf50; }
    .status-icon.inactive { color: #f44336; }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }

      .form-row {
        flex-direction: column;
      }

      .half-width, .codigo-field, .status-field {
        width: 100%;
      }
    }
  `]
})
export class BancosFormComponent implements OnInit {
  bancoForm: FormGroup;
  isEditing = false;
  isSubmitting = false;
  bancoId?: number;

  // Lista de bancos brasileiros mais comuns
  bancosComuns = [
    { codigo: '001', nome: 'Banco do Brasil' },
    { codigo: '033', nome: 'Santander' },
    { codigo: '104', nome: 'Caixa Econômica Federal' },
    { codigo: '237', nome: 'Bradesco' },
    { codigo: '341', nome: 'Itaú' },
    { codigo: '745', nome: 'Citibank' },
    { codigo: '399', nome: 'HSBC' },
    { codigo: '422', nome: 'Banco Safra' },
    { codigo: '070', nome: 'BRB' },
    { codigo: '756', nome: 'Banco Cooperativo do Brasil' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.bancoForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      if (params['id']) {
        this.bancoId = +params['id'];
        this.isEditing = true;
        this.loadBanco(this.bancoId);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      codigo: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
      nome: ['', [Validators.required, Validators.minLength(2)]],
      nome_completo: [''],
      site: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      telefone: [''],
      ativo: [true, [Validators.required]],
      observacoes: ['']
    });
  }

  // Eventos
  onCodigoChange(event: any): void {
    const codigo = event.target.value;
    if (codigo.length === 3) {
      const bancoEncontrado = this.bancosComuns.find(b => b.codigo === codigo);
      if (bancoEncontrado && !this.bancoForm.get('nome')?.value) {
        this.bancoForm.patchValue({
          nome: bancoEncontrado.nome
        });
        this.snackBar.open(`Banco ${bancoEncontrado.nome} encontrado!`, 'OK', {
          duration: 2000
        });
      }
    }
  }

  // Carregamento de dados
  private loadBanco(id: number): void {
    // Simular carregamento - substituir por serviço real
    const bancoExemplo: Banco = {
      id: id,
      codigo: '001',
      nome: 'Banco do Brasil',
      nome_completo: 'Banco do Brasil S.A.',
      site: 'https://www.bb.com.br',
      telefone: '0800 729 0001',
      ativo: true,
      observacoes: 'Principal banco público do país'
    };

    this.bancoForm.patchValue(bancoExemplo);
  }

  // Navegação
  voltar(): void {
    this.router.navigate(['/configuracoes/cadastros/bancos']);
  }

  // Submissão do formulário
  onSubmit(): void {
    if (this.bancoForm.valid) {
      this.isSubmitting = true;
      const formData = this.bancoForm.value;

      console.log('Dados do banco:', formData);

      // Simular chamada à API
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open(
          `Banco ${this.isEditing ? 'atualizado' : 'criado'} com sucesso!`,
          'OK',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.voltar();
      }, 1500);

    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Por favor, corrija os erros no formulário', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bancoForm.controls).forEach(key => {
      this.bancoForm.get(key)?.markAsTouched();
    });
  }
}
