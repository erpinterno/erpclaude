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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

interface FormaPagamento {
  id?: number;
  nome: string;
  tipo: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'boleto' | 'cheque';
  taxa_juros?: number;
  prazo_dias?: number;
  descricao?: string;
  ativo: boolean;
}

@Component({
  selector: 'app-formas-pagamento-form',
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
    MatCheckboxModule,
    MatDividerModule
  ],
  template: `
    <div class="forma-pagamento-form-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <button mat-icon-button (click)="voltar()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-text">
            <h1>{{ isEditing ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento' }}</h1>
            <p>{{ isEditing ? 'Atualize as informações da forma de pagamento' : 'Cadastre uma nova forma de pagamento' }}</p>
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
                  [disabled]="formaPagamentoForm.invalid || isSubmitting">
            <mat-icon>{{ isSubmitting ? 'hourglass_empty' : 'save' }}</mat-icon>
            {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <!-- Formulário -->
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="formaPagamentoForm" class="forma-pagamento-form">
            
            <!-- Informações Básicas -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>payment</mat-icon>
                Informações Básicas
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nome da Forma de Pagamento *</mat-label>
                  <input matInput 
                         formControlName="nome" 
                         placeholder="Ex: Dinheiro, Cartão de Crédito, PIX..."
                         maxlength="100">
                  <mat-icon matSuffix>label</mat-icon>
                  <mat-error *ngIf="formaPagamentoForm.get('nome')?.hasError('required')">
                    Nome é obrigatório
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Tipo *</mat-label>
                  <mat-select formControlName="tipo" (selectionChange)="onTipoChange($event.value)">
                    <mat-option value="dinheiro">
                      <mat-icon>attach_money</mat-icon>
                      Dinheiro
                    </mat-option>
                    <mat-option value="cartao_credito">
                      <mat-icon>credit_card</mat-icon>
                      Cartão de Crédito
                    </mat-option>
                    <mat-option value="cartao_debito">
                      <mat-icon>payment</mat-icon>
                      Cartão de Débito
                    </mat-option>
                    <mat-option value="pix">
                      <mat-icon>qr_code</mat-icon>
                      PIX
                    </mat-option>
                    <mat-option value="transferencia">
                      <mat-icon>swap_horiz</mat-icon>
                      Transferência Bancária
                    </mat-option>
                    <mat-option value="boleto">
                      <mat-icon>receipt</mat-icon>
                      Boleto Bancário
                    </mat-option>
                    <mat-option value="cheque">
                      <mat-icon>description</mat-icon>
                      Cheque
                    </mat-option>
                  </mat-select>
                  <mat-icon matSuffix>category</mat-icon>
                  <mat-error *ngIf="formaPagamentoForm.get('tipo')?.hasError('required')">
                    Tipo é obrigatório
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Descrição</mat-label>
                  <input matInput 
                         formControlName="descricao" 
                         placeholder="Descrição adicional..."
                         maxlength="255">
                  <mat-icon matSuffix>description</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <!-- Configurações Financeiras -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>account_balance</mat-icon>
                Configurações Financeiras
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Taxa de Juros (% a.m.)</mat-label>
                  <input matInput 
                         type="number"
                         formControlName="taxa_juros" 
                         placeholder="0,00"
                         step="0.01"
                         min="0"
                         max="100">
                  <mat-icon matSuffix>percent</mat-icon>
                  <mat-hint>Taxa de juros mensal aplicada</mat-hint>
                  <mat-error *ngIf="formaPagamentoForm.get('taxa_juros')?.hasError('min')">
                    Taxa deve ser maior ou igual a 0
                  </mat-error>
                  <mat-error *ngIf="formaPagamentoForm.get('taxa_juros')?.hasError('max')">
                    Taxa deve ser menor ou igual a 100
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Prazo (dias)</mat-label>
                  <input matInput 
                         type="number"
                         formControlName="prazo_dias" 
                         placeholder="0"
                         min="0"
                         max="365">
                  <mat-icon matSuffix>schedule</mat-icon>
                  <mat-hint>Prazo para pagamento em dias (0 = à vista)</mat-hint>
                  <mat-error *ngIf="formaPagamentoForm.get('prazo_dias')?.hasError('min')">
                    Prazo deve ser maior ou igual a 0
                  </mat-error>
                  <mat-error *ngIf="formaPagamentoForm.get('prazo_dias')?.hasError('max')">
                    Prazo deve ser menor ou igual a 365 dias
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Informações sobre o tipo selecionado -->
              <div class="tipo-info" *ngIf="tipoSelecionado">
                <mat-divider></mat-divider>
                <div class="info-content">
                  <mat-icon>{{ getTipoIcon(tipoSelecionado) }}</mat-icon>
                  <div class="info-text">
                    <h4>{{ getTipoLabel(tipoSelecionado) }}</h4>
                    <p>{{ getTipoDescricao(tipoSelecionado) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>flag</mat-icon>
                Status
              </h3>
              
              <div class="form-row">
                <div class="checkbox-group">
                  <mat-checkbox formControlName="ativo">
                    Forma de Pagamento Ativa
                  </mat-checkbox>
                  <small class="checkbox-hint">
                    Formas de pagamento ativas ficam disponíveis para seleção no sistema
                  </small>
                </div>
              </div>
            </div>

          </form>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .forma-pagamento-form-container {
      padding: 20px;
      max-width: 1000px;
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

    .forma-pagamento-form {
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
      gap: 8px;
      padding: 8px 0;
    }

    .checkbox-hint {
      color: #666;
      font-size: 12px;
      margin-left: 32px;
    }

    .tipo-info {
      margin-top: 16px;
      padding-top: 16px;
    }

    .info-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-top: 12px;
      padding: 12px;
      background: #fff;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    .info-content mat-icon {
      color: #2196f3;
      margin-top: 2px;
    }

    .info-text h4 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 14px;
      font-weight: 500;
    }

    .info-text p {
      margin: 0;
      color: #666;
      font-size: 13px;
      line-height: 1.4;
    }

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

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class FormasPagamentoFormComponent implements OnInit {
  formaPagamentoForm: FormGroup;
  isEditing = false;
  isSubmitting = false;
  formaPagamentoId?: number;
  tipoSelecionado?: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.formaPagamentoForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      if (params['id']) {
        this.formaPagamentoId = +params['id'];
        this.isEditing = true;
        this.loadFormaPagamento(this.formaPagamentoId);
      }
    });

    // Observar mudanças no tipo
    this.formaPagamentoForm.get('tipo')?.valueChanges.subscribe((tipo: any) => {
      this.tipoSelecionado = tipo;
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['', [Validators.required]],
      taxa_juros: [null, [Validators.min(0), Validators.max(100)]],
      prazo_dias: [null, [Validators.min(0), Validators.max(365)]],
      descricao: ['', Validators.maxLength(255)],
      ativo: [true, [Validators.required]]
    });
  }

  private loadFormaPagamento(id: number): void {
    // Simular carregamento - substituir por serviço real
    const formaPagamentoExemplo: FormaPagamento = {
      id: id,
      nome: 'Cartão de Crédito',
      tipo: 'cartao_credito',
      taxa_juros: 2.5,
      prazo_dias: 30,
      descricao: 'Pagamento com cartão de crédito',
      ativo: true
    };

    this.populateForm(formaPagamentoExemplo);
  }

  private populateForm(formaPagamento: FormaPagamento): void {
    this.formaPagamentoForm.patchValue({
      id: formaPagamento.id,
      nome: formaPagamento.nome,
      tipo: formaPagamento.tipo,
      taxa_juros: formaPagamento.taxa_juros,
      prazo_dias: formaPagamento.prazo_dias,
      descricao: formaPagamento.descricao,
      ativo: formaPagamento.ativo
    });
    this.tipoSelecionado = formaPagamento.tipo;
  }

  onTipoChange(tipo: string): void {
    this.tipoSelecionado = tipo;
    
    // Sugerir valores padrão baseados no tipo
    const sugestoes = this.getSugestoesPorTipo(tipo);
    if (sugestoes.nome && !this.formaPagamentoForm.get('nome')?.value) {
      this.formaPagamentoForm.patchValue({ nome: sugestoes.nome });
    }
    if (sugestoes.descricao && !this.formaPagamentoForm.get('descricao')?.value) {
      this.formaPagamentoForm.patchValue({ descricao: sugestoes.descricao });
    }
  }

  private getSugestoesPorTipo(tipo: string) {
    const sugestoes: { [key: string]: { nome: string; descricao: string } } = {
      'dinheiro': {
        nome: 'Dinheiro',
        descricao: 'Pagamento em espécie'
      },
      'cartao_credito': {
        nome: 'Cartão de Crédito',
        descricao: 'Pagamento com cartão de crédito'
      },
      'cartao_debito': {
        nome: 'Cartão de Débito',
        descricao: 'Pagamento com cartão de débito'
      },
      'pix': {
        nome: 'PIX',
        descricao: 'Pagamento instantâneo via PIX'
      },
      'transferencia': {
        nome: 'Transferência Bancária',
        descricao: 'Transferência entre contas bancárias'
      },
      'boleto': {
        nome: 'Boleto Bancário',
        descricao: 'Pagamento via boleto bancário'
      },
      'cheque': {
        nome: 'Cheque',
        descricao: 'Pagamento com cheque'
      }
    };
    return sugestoes[tipo] || { nome: '', descricao: '' };
  }

  getTipoLabel(tipo: string): string {
    const tipos = {
      'dinheiro': 'Dinheiro',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'pix': 'PIX',
      'transferencia': 'Transferência Bancária',
      'boleto': 'Boleto Bancário',
      'cheque': 'Cheque'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  }

  getTipoIcon(tipo: string): string {
    const icones = {
      'dinheiro': 'attach_money',
      'cartao_credito': 'credit_card',
      'cartao_debito': 'payment',
      'pix': 'qr_code',
      'transferencia': 'swap_horiz',
      'boleto': 'receipt',
      'cheque': 'description'
    };
    return icones[tipo as keyof typeof icones] || 'payment';
  }

  getTipoDescricao(tipo: string): string {
    const descricoes = {
      'dinheiro': 'Pagamento à vista em espécie. Não possui taxas ou prazos.',
      'cartao_credito': 'Pagamento com cartão de crédito. Pode ter taxas e prazos configuráveis.',
      'cartao_debito': 'Pagamento com cartão de débito. Geralmente à vista.',
      'pix': 'Pagamento instantâneo via PIX. Transferência imediata entre contas.',
      'transferencia': 'Transferência bancária entre contas. Pode ter prazo de compensação.',
      'boleto': 'Pagamento via boleto bancário. Geralmente com prazo de vencimento.',
      'cheque': 'Pagamento com cheque. Possui prazo para compensação.'
    };
    return descricoes[tipo as keyof typeof descricoes] || '';
  }

  voltar(): void {
    this.router.navigate(['/configuracoes/cadastros/formas-pagamento']);
  }

  onSubmit(): void {
    if (this.formaPagamentoForm.valid) {
      this.isSubmitting = true;
      const formData = this.formaPagamentoForm.value;

      console.log('Dados da forma de pagamento:', formData);

      // Simular chamada à API
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open(
          `Forma de pagamento ${this.isEditing ? 'atualizada' : 'criada'} com sucesso!`,
          'OK',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.voltar();
      }, 2000);

    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Por favor, corrija os erros no formulário', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.formaPagamentoForm.controls).forEach(key => {
      this.formaPagamentoForm.get(key)?.markAsTouched();
    });
  }
}
