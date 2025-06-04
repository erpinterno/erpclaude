import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, startWith, map } from 'rxjs';

interface ContaPagar {
  id?: number;
  descricao: string;
  fornecedor_id?: number;
  fornecedor?: string;
  categoria_id?: number;
  categoria?: string;
  conta_corrente_id?: number;
  conta_corrente?: string;
  valor_original: number;
  valor_pago?: number;
  data_vencimento: Date;
  data_emissao?: Date;
  numero_documento?: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  observacoes?: string;
}

interface Fornecedor {
  id: number;
  nome: string;
  cpf_cnpj?: string;
}

interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
}

interface ContaCorrente {
  id: number;
  nome: string;
  banco: string;
}

@Component({
  selector: 'app-conta-pagar-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>{{ isEditing ? 'edit' : 'add' }}</mat-icon>
          {{ isEditing ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar' }}
        </h2>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="contaForm" class="conta-form">
          
          <!-- Informações Básicas -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon>info</mat-icon>
              Informações Básicas
            </h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descrição *</mat-label>
                <input matInput 
                       formControlName="descricao" 
                       placeholder="Ex: Pagamento de energia elétrica"
                       maxlength="200">
                <mat-icon matSuffix>description</mat-icon>
                <mat-error *ngIf="contaForm.get('descricao')?.hasError('required')">
                  Descrição é obrigatória
                </mat-error>
                <mat-error *ngIf="contaForm.get('descricao')?.hasError('minlength')">
                  Descrição deve ter pelo menos 3 caracteres
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Fornecedor *</mat-label>
                <input matInput 
                       formControlName="fornecedor"
                       [matAutocomplete]="autoFornecedor"
                       placeholder="Digite para buscar fornecedor">
                <mat-icon matSuffix>business</mat-icon>
                <mat-autocomplete #autoFornecedor="matAutocomplete" [displayWith]="displayFornecedor">
                  <mat-option *ngFor="let fornecedor of filteredFornecedores | async" [value]="fornecedor">
                    <div class="option-content">
                      <strong>{{ fornecedor.nome }}</strong>
                      <small *ngIf="fornecedor.cpf_cnpj">{{ fornecedor.cpf_cnpj }}</small>
                    </div>
                  </mat-option>
                </mat-autocomplete>
                <mat-error *ngIf="contaForm.get('fornecedor')?.hasError('required')">
                  Fornecedor é obrigatório
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Categoria</mat-label>
                <mat-select formControlName="categoria_id">
                  <mat-option value="">Selecione uma categoria</mat-option>
                  <mat-option *ngFor="let categoria of categorias" [value]="categoria.id">
                    {{ categoria.nome }}
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>category</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Número do Documento</mat-label>
                <input matInput 
                       formControlName="numero_documento" 
                       placeholder="Ex: NF-001234">
                <mat-icon matSuffix>receipt</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Conta Corrente</mat-label>
                <mat-select formControlName="conta_corrente_id">
                  <mat-option value="">Selecione uma conta</mat-option>
                  <mat-option *ngFor="let conta of contasCorrentes" [value]="conta.id">
                    {{ conta.nome }} - {{ conta.banco }}
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>account_balance</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Valores e Datas -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon>attach_money</mat-icon>
              Valores e Datas
            </h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Valor Original *</mat-label>
                <input matInput 
                       type="number" 
                       formControlName="valor_original" 
                       placeholder="0,00"
                       step="0.01"
                       min="0">
                <span matPrefix>R$ </span>
                <mat-error *ngIf="contaForm.get('valor_original')?.hasError('required')">
                  Valor é obrigatório
                </mat-error>
                <mat-error *ngIf="contaForm.get('valor_original')?.hasError('min')">
                  Valor deve ser maior que zero
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="pendente">
                    <mat-icon class="status-icon pending">schedule</mat-icon>
                    Pendente
                  </mat-option>
                  <mat-option value="pago">
                    <mat-icon class="status-icon paid">check_circle</mat-icon>
                    Pago
                  </mat-option>
                  <mat-option value="vencido">
                    <mat-icon class="status-icon overdue">warning</mat-icon>
                    Vencido
                  </mat-option>
                  <mat-option value="cancelado">
                    <mat-icon class="status-icon cancelled">cancel</mat-icon>
                    Cancelado
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>flag</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Data de Emissão</mat-label>
                <input matInput 
                       [matDatepicker]="pickerEmissao" 
                       formControlName="data_emissao"
                       readonly>
                <mat-datepicker-toggle matSuffix [for]="pickerEmissao"></mat-datepicker-toggle>
                <mat-datepicker #pickerEmissao></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Data de Vencimento *</mat-label>
                <input matInput 
                       [matDatepicker]="pickerVencimento" 
                       formControlName="data_vencimento"
                       readonly>
                <mat-datepicker-toggle matSuffix [for]="pickerVencimento"></mat-datepicker-toggle>
                <mat-datepicker #pickerVencimento></mat-datepicker>
                <mat-error *ngIf="contaForm.get('data_vencimento')?.hasError('required')">
                  Data de vencimento é obrigatória
                </mat-error>
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
                          placeholder="Informações adicionais sobre a conta..."></textarea>
                <mat-icon matSuffix>comment</mat-icon>
                <mat-hint align="end">
                  {{ contaForm.get('observacoes')?.value?.length || 0 }}/500
                </mat-hint>
              </mat-form-field>
            </div>
          </div>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close type="button" class="cancel-button">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        
        <button mat-raised-button 
                color="primary" 
                (click)="onSubmit()" 
                [disabled]="contaForm.invalid || isSubmitting"
                class="save-button">
          <mat-icon>{{ isSubmitting ? 'hourglass_empty' : 'save' }}</mat-icon>
          {{ isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar') }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      width: 100%;
      max-width: 800px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #333;
    }

    .close-button {
      color: #666;
    }

    .dialog-content {
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .conta-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      background: #fafafa;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      color: #666;
      font-size: 14px;
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

    .option-content {
      display: flex;
      flex-direction: column;
    }

    .option-content small {
      color: #666;
      font-size: 12px;
    }

    .status-icon {
      margin-right: 8px;
      font-size: 16px;
    }

    .status-icon.pending { color: #ff9800; }
    .status-icon.paid { color: #4caf50; }
    .status-icon.overdue { color: #f44336; }
    .status-icon.cancelled { color: #9e9e9e; }

    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .cancel-button {
      color: #666;
    }

    .save-button {
      min-width: 120px;
    }

    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
      }
      
      .half-width {
        width: 100%;
      }
    }
  `]
})
export class ContaPagarFormDialogComponent implements OnInit {
  contaForm: FormGroup;
  isEditing = false;
  isSubmitting = false;

  // Dados para autocomplete e selects
  fornecedores: Fornecedor[] = [
    { id: 1, nome: 'Companhia Elétrica', cpf_cnpj: '12.345.678/0001-90' },
    { id: 2, nome: 'Imobiliária XYZ', cpf_cnpj: '98.765.432/0001-10' },
    { id: 3, nome: 'Papelaria ABC', cpf_cnpj: '11.222.333/0001-44' },
    { id: 4, nome: 'Provedor Internet', cpf_cnpj: '55.666.777/0001-88' },
    { id: 5, nome: 'TechService', cpf_cnpj: '99.888.777/0001-66' }
  ];

  categorias: Categoria[] = [
    { id: 1, nome: 'Fornecedores', descricao: 'Pagamentos para fornecedores' },
    { id: 2, nome: 'Serviços', descricao: 'Pagamentos de serviços' },
    { id: 3, nome: 'Impostos', descricao: 'Pagamentos de impostos e taxas' },
    { id: 4, nome: 'Salários', descricao: 'Pagamentos de salários e benefícios' },
    { id: 5, nome: 'Aluguel', descricao: 'Pagamentos de aluguel e condomínio' },
    { id: 6, nome: 'Utilities', descricao: 'Pagamentos de água, luz, telefone' }
  ];

  contasCorrentes: ContaCorrente[] = [
    { id: 1, nome: 'Conta Principal', banco: 'Banco do Brasil' },
    { id: 2, nome: 'Conta Movimento', banco: 'Itaú' },
    { id: 3, nome: 'Conta Poupança', banco: 'Caixa Econômica' }
  ];

  filteredFornecedores!: Observable<Fornecedor[]>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ContaPagarFormDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { conta?: ContaPagar }
  ) {
    this.isEditing = !!data?.conta;
    
    this.contaForm = this.fb.group({
      id: [data?.conta?.id || null],
      descricao: [data?.conta?.descricao || '', [Validators.required, Validators.minLength(3)]],
      fornecedor: [data?.conta?.fornecedor || '', [Validators.required]],
      fornecedor_id: [data?.conta?.fornecedor_id || null],
      categoria_id: [data?.conta?.categoria_id || null],
      conta_corrente_id: [data?.conta?.conta_corrente_id || null],
      valor_original: [data?.conta?.valor_original || null, [Validators.required, Validators.min(0.01)]],
      valor_pago: [data?.conta?.valor_pago || 0],
      data_vencimento: [data?.conta?.data_vencimento || null, [Validators.required]],
      data_emissao: [data?.conta?.data_emissao || null],
      numero_documento: [data?.conta?.numero_documento || ''],
      status: [data?.conta?.status || 'pendente', [Validators.required]],
      observacoes: [data?.conta?.observacoes || '']
    });
  }

  ngOnInit(): void {
    this.setupFornecedorAutocomplete();
  }

  private setupFornecedorAutocomplete(): void {
    this.filteredFornecedores = this.contaForm.get('fornecedor')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = typeof value === 'string' ? value : value?.nome || '';
        return this.filterFornecedores(filterValue);
      })
    );
  }

  private filterFornecedores(value: string): Fornecedor[] {
    const filterValue = value.toLowerCase();
    return this.fornecedores.filter(fornecedor =>
      fornecedor.nome.toLowerCase().includes(filterValue) ||
      (fornecedor.cpf_cnpj && fornecedor.cpf_cnpj.includes(filterValue))
    );
  }

  displayFornecedor(fornecedor: Fornecedor): string {
    return fornecedor ? fornecedor.nome : '';
  }

  onSubmit(): void {
    if (this.contaForm.valid) {
      this.isSubmitting = true;
      const formData = this.contaForm.value;

      // Se fornecedor é um objeto, extrair o ID
      if (typeof formData.fornecedor === 'object' && formData.fornecedor?.id) {
        formData.fornecedor_id = formData.fornecedor.id;
        formData.fornecedor = formData.fornecedor.nome;
      }

      console.log('Dados do formulário:', formData);

      // Simular chamada à API
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open(
          `Conta ${this.isEditing ? 'atualizada' : 'criada'} com sucesso!`,
          'OK',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.dialogRef.close(formData);
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
    Object.keys(this.contaForm.controls).forEach(key => {
      this.contaForm.get(key)?.markAsTouched();
    });
  }
}
