import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ContaCorrente {
  id?: number;
  nome: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo_conta: 'corrente' | 'poupanca' | 'investimento';
  saldo_inicial: number;
  saldo_atual: number;
  limite_credito?: number;
  observacoes?: string;
  ativo: boolean;
}

interface DialogData {
  conta: ContaCorrente | null;
  isEditing: boolean;
}

@Component({
  selector: 'app-conta-corrente-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>{{ data.isEditing ? 'edit' : 'add' }}</mat-icon>
          {{ data.isEditing ? 'Editar Conta Corrente' : 'Nova Conta Corrente' }}
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="contaForm" class="conta-form">
          
          <!-- Informações Básicas -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon>account_balance</mat-icon>
              Informações da Conta
            </h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nome da Conta *</mat-label>
                <input matInput 
                       formControlName="nome" 
                       placeholder="Ex: Conta Principal, Poupança Reserva..."
                       maxlength="100">
                <mat-icon matSuffix>label</mat-icon>
                <mat-error *ngIf="contaForm.get('nome')?.hasError('required')">
                  Nome da conta é obrigatório
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Banco *</mat-label>
                <input matInput 
                       formControlName="banco" 
                       placeholder="Nome do banco"
                       maxlength="100">
                <mat-icon matSuffix>business</mat-icon>
                <mat-error *ngIf="contaForm.get('banco')?.hasError('required')">
                  Banco é obrigatório
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Tipo de Conta *</mat-label>
                <mat-select formControlName="tipo_conta">
                  <mat-option value="corrente">Conta Corrente</mat-option>
                  <mat-option value="poupanca">Poupança</mat-option>
                  <mat-option value="investimento">Investimento</mat-option>
                </mat-select>
                <mat-icon matSuffix>category</mat-icon>
                <mat-error *ngIf="contaForm.get('tipo_conta')?.hasError('required')">
                  Tipo de conta é obrigatório
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Agência *</mat-label>
                <input matInput 
                       formControlName="agencia" 
                       placeholder="0000-0"
                       maxlength="10">
                <mat-icon matSuffix>location_on</mat-icon>
                <mat-error *ngIf="contaForm.get('agencia')?.hasError('required')">
                  Agência é obrigatória
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Conta *</mat-label>
                <input matInput 
                       formControlName="conta" 
                       placeholder="00000-0"
                       maxlength="15">
                <mat-icon matSuffix>credit_card</mat-icon>
                <mat-error *ngIf="contaForm.get('conta')?.hasError('required')">
                  Número da conta é obrigatório
                </mat-error>
              </mat-form-field>
            </div>
          </div>

          <!-- Informações Financeiras -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon>account_balance_wallet</mat-icon>
              Informações Financeiras
            </h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Saldo Inicial</mat-label>
                <input matInput 
                       type="number"
                       formControlName="saldo_inicial" 
                       placeholder="0,00"
                       step="0.01">
                <span matPrefix>R$ </span>
                <mat-icon matSuffix>savings</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Limite de Crédito</mat-label>
                <input matInput 
                       type="number"
                       formControlName="limite_credito" 
                       placeholder="0,00"
                       step="0.01">
                <span matPrefix>R$ </span>
                <mat-icon matSuffix>credit_score</mat-icon>
                <mat-hint>Deixe em branco se não houver limite</mat-hint>
              </mat-form-field>
            </div>

            <div class="form-row" *ngIf="data.isEditing">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Saldo Atual</mat-label>
                <input matInput 
                       type="number"
                       formControlName="saldo_atual" 
                       placeholder="0,00"
                       step="0.01">
                <span matPrefix>R$ </span>
                <mat-icon matSuffix>account_balance_wallet</mat-icon>
                <mat-hint>Saldo atual da conta</mat-hint>
              </mat-form-field>
            </div>
          </div>

          <!-- Observações e Status -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon>notes</mat-icon>
              Observações e Status
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

            <div class="form-row">
              <div class="checkbox-group">
                <mat-checkbox formControlName="ativo">
                  Conta Ativa
                </mat-checkbox>
              </div>
            </div>
          </div>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-stroked-button mat-dialog-close type="button">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="onSubmit()" 
                [disabled]="contaForm.invalid || isSubmitting">
          <mat-icon>{{ isSubmitting ? 'hourglass_empty' : 'save' }}</mat-icon>
          {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
        </button>
      </mat-dialog-actions>

    </div>
  `,
  styles: [`
    .dialog-container {
      max-width: 800px;
      width: 100%;
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
      align-items: flex-start;
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

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0;
    }

    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    @media (max-width: 600px) {
      .dialog-container {
        max-width: 100vw;
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
      }

      .dialog-content {
        max-height: calc(100vh - 120px);
      }

      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class ContaCorrenteFormDialogComponent implements OnInit {
  contaForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ContaCorrenteFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private snackBar: MatSnackBar
  ) {
    this.contaForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data.isEditing && this.data.conta) {
      this.populateForm(this.data.conta);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      banco: ['', [Validators.required, Validators.maxLength(100)]],
      agencia: ['', [Validators.required, Validators.maxLength(10)]],
      conta: ['', [Validators.required, Validators.maxLength(15)]],
      tipo_conta: ['corrente', [Validators.required]],
      saldo_inicial: [0, [Validators.min(0)]],
      saldo_atual: [0],
      limite_credito: [null, [Validators.min(0)]],
      observacoes: ['', Validators.maxLength(500)],
      ativo: [true, [Validators.required]]
    });
  }

  private populateForm(conta: ContaCorrente): void {
    this.contaForm.patchValue({
      id: conta.id,
      nome: conta.nome,
      banco: conta.banco,
      agencia: conta.agencia,
      conta: conta.conta,
      tipo_conta: conta.tipo_conta,
      saldo_inicial: conta.saldo_inicial,
      saldo_atual: conta.saldo_atual,
      limite_credito: conta.limite_credito,
      observacoes: conta.observacoes,
      ativo: conta.ativo
    });
  }

  onSubmit(): void {
    if (this.contaForm.valid) {
      this.isSubmitting = true;
      const formData = this.contaForm.value;

      // Se não está editando, o saldo atual é igual ao saldo inicial
      if (!this.data.isEditing) {
        formData.saldo_atual = formData.saldo_inicial;
      }

      console.log('Dados da conta:', formData);

      // Simular chamada à API
      setTimeout(() => {
        this.isSubmitting = false;
        this.dialogRef.close(formData);
      }, 1500);

    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Por favor, corrija os erros no formulário', 'OK', {
        duration: 3000
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contaForm.controls).forEach(key => {
      this.contaForm.get(key)?.markAsTouched();
    });
  }
}
