import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

interface Fornecedor {
  id?: number;
  nome: string;
  tipo_pessoa: 'fisica' | 'juridica';
  cpf_cnpj: string;
  rg_ie?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  ativo: boolean;
  observacoes?: string;
  contatos?: Contato[];
  dados_bancarios?: DadosBancarios[];
}

interface Contato {
  id?: number;
  nome: string;
  cargo?: string;
  email?: string;
  telefone?: string;
  principal: boolean;
}

interface DadosBancarios {
  id?: number;
  banco: string;
  agencia: string;
  conta: string;
  tipo_conta: 'corrente' | 'poupanca';
  pix?: string;
  principal: boolean;
}

@Component({
  selector: 'app-fornecedores-form',
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
    MatTabsModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  template: `
    <div class="fornecedor-form-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <button mat-icon-button (click)="voltar()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-text">
            <h1>{{ isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor' }}</h1>
            <p>{{ isEditing ? 'Atualize as informações do fornecedor' : 'Cadastre um novo fornecedor' }}</p>
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
                  [disabled]="fornecedorForm.invalid || isSubmitting">
            <mat-icon>{{ isSubmitting ? 'hourglass_empty' : 'save' }}</mat-icon>
            {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <!-- Formulário com Tabs -->
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="fornecedorForm" class="fornecedor-form">
            
            <mat-tab-group animationDuration="300ms">
              
              <!-- Tab 1: Dados Básicos -->
              <mat-tab label="Dados Básicos">
                <div class="tab-content">
                  
                  <!-- Tipo de Pessoa -->
                  <div class="form-section">
                    <h3 class="section-title">
                      <mat-icon>person</mat-icon>
                      Tipo de Pessoa
                    </h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Tipo de Pessoa *</mat-label>
                        <mat-select formControlName="tipo_pessoa" (selectionChange)="onTipoPessoaChange($event.value)">
                          <mat-option value="fisica">Pessoa Física</mat-option>
                          <mat-option value="juridica">Pessoa Jurídica</mat-option>
                        </mat-select>
                        <mat-icon matSuffix>business</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="half-width">
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
                  </div>

                  <!-- Identificação -->
                  <div class="form-section">
                    <h3 class="section-title">
                      <mat-icon>badge</mat-icon>
                      Identificação
                    </h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>{{ getTipoPessoaLabel() }} *</mat-label>
                        <input matInput 
                               formControlName="nome" 
                               [placeholder]="getTipoPessoaPlaceholder()"
                               maxlength="200">
                        <mat-icon matSuffix>{{ getTipoPessoaIcon() }}</mat-icon>
                        <mat-error *ngIf="fornecedorForm.get('nome')?.hasError('required')">
                          {{ getTipoPessoaLabel() }} é obrigatório
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>{{ getCpfCnpjLabel() }} *</mat-label>
                        <input matInput 
                               formControlName="cpf_cnpj" 
                               [placeholder]="getCpfCnpjPlaceholder()">
                        <mat-icon matSuffix>fingerprint</mat-icon>
                        <mat-error *ngIf="fornecedorForm.get('cpf_cnpj')?.hasError('required')">
                          {{ getCpfCnpjLabel() }} é obrigatório
                        </mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>{{ getRgIeLabel() }}</mat-label>
                        <input matInput 
                               formControlName="rg_ie" 
                               [placeholder]="getRgIePlaceholder()">
                        <mat-icon matSuffix>assignment_ind</mat-icon>
                      </mat-form-field>
                    </div>
                  </div>

                  <!-- Contato -->
                  <div class="form-section">
                    <h3 class="section-title">
                      <mat-icon>contact_phone</mat-icon>
                      Contato
                    </h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>E-mail</mat-label>
                        <input matInput 
                               type="email"
                               formControlName="email" 
                               placeholder="exemplo@email.com">
                        <mat-icon matSuffix>email</mat-icon>
                        <mat-error *ngIf="fornecedorForm.get('email')?.hasError('email')">
                          E-mail inválido
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Telefone</mat-label>
                        <input matInput 
                               formControlName="telefone" 
                               placeholder="(11) 3333-4444">
                        <mat-icon matSuffix>phone</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Celular</mat-label>
                        <input matInput 
                               formControlName="celular" 
                               placeholder="(11) 99999-8888">
                        <mat-icon matSuffix>smartphone</mat-icon>
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
                                  placeholder="Informações adicionais sobre o fornecedor..."></textarea>
                        <mat-icon matSuffix>comment</mat-icon>
                        <mat-hint align="end">
                          {{ fornecedorForm.get('observacoes')?.value?.length || 0 }}/500
                        </mat-hint>
                      </mat-form-field>
                    </div>
                  </div>

                </div>
              </mat-tab>

              <!-- Tab 2: Endereço -->
              <mat-tab label="Endereço">
                <div class="tab-content">
                  
                  <div class="form-section">
                    <h3 class="section-title">
                      <mat-icon>location_on</mat-icon>
                      Endereço Completo
                    </h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="cep-field">
                        <mat-label>CEP</mat-label>
                        <input matInput 
                               formControlName="cep" 
                               placeholder="00000-000"
                               (blur)="buscarCep()">
                        <mat-icon matSuffix>location_searching</mat-icon>
                      </mat-form-field>

                      <button mat-icon-button 
                              type="button"
                              (click)="buscarCep()"
                              [disabled]="!fornecedorForm.get('cep')?.value"
                              class="cep-button"
                              matTooltip="Buscar CEP">
                        <mat-icon>search</mat-icon>
                      </button>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="endereco-field">
                        <mat-label>Endereço</mat-label>
                        <input matInput 
                               formControlName="endereco" 
                               placeholder="Rua, Avenida, etc.">
                        <mat-icon matSuffix>home</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="numero-field">
                        <mat-label>Número</mat-label>
                        <input matInput 
                               formControlName="numero" 
                               placeholder="123">
                        <mat-icon matSuffix>tag</mat-icon>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Complemento</mat-label>
                        <input matInput 
                               formControlName="complemento" 
                               placeholder="Apto, Sala, etc.">
                        <mat-icon matSuffix>add_location</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Bairro</mat-label>
                        <input matInput 
                               formControlName="bairro" 
                               placeholder="Nome do bairro">
                        <mat-icon matSuffix>location_city</mat-icon>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="cidade-field">
                        <mat-label>Cidade</mat-label>
                        <input matInput 
                               formControlName="cidade" 
                               placeholder="Nome da cidade">
                        <mat-icon matSuffix>location_city</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="estado-field">
                        <mat-label>Estado</mat-label>
                        <mat-select formControlName="estado">
                          <mat-option value="">Selecione</mat-option>
                          <mat-option *ngFor="let estado of estados" [value]="estado.sigla">
                            {{ estado.nome }}
                          </mat-option>
                        </mat-select>
                        <mat-icon matSuffix>map</mat-icon>
                      </mat-form-field>
                    </div>

                  </div>

                </div>
              </mat-tab>

              <!-- Tab 3: Contatos -->
              <mat-tab label="Contatos">
                <div class="tab-content">
                  
                  <div class="form-section">
                    <div class="section-header">
                      <h3 class="section-title">
                        <mat-icon>contacts</mat-icon>
                        Contatos do Fornecedor
                      </h3>
                      <button mat-raised-button 
                              color="accent" 
                              type="button"
                              (click)="adicionarContato()">
                        <mat-icon>add</mat-icon>
                        Adicionar Contato
                      </button>
                    </div>

                    <div formArrayName="contatos" class="contatos-list">
                      <div *ngFor="let contato of contatos.controls; let i = index" 
                           [formGroupName]="i" 
                           class="contato-item">
                        
                        <div class="contato-header">
                          <h4>Contato {{ i + 1 }}</h4>
                          <div class="contato-actions">
                            <mat-checkbox formControlName="principal">
                              Contato Principal
                            </mat-checkbox>
                            <button mat-icon-button 
                                    color="warn" 
                                    type="button"
                                    (click)="removerContato(i)"
                                    [disabled]="contatos.length === 1">
                              <mat-icon>delete</mat-icon>
                            </button>
                          </div>
                        </div>

                        <div class="form-row">
                          <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Nome *</mat-label>
                            <input matInput formControlName="nome" placeholder="Nome do contato">
                            <mat-icon matSuffix>person</mat-icon>
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Cargo</mat-label>
                            <input matInput formControlName="cargo" placeholder="Cargo/Função">
                            <mat-icon matSuffix>work</mat-icon>
                          </mat-form-field>
                        </div>

                        <div class="form-row">
                          <mat-form-field appearance="outline" class="half-width">
                            <mat-label>E-mail</mat-label>
                            <input matInput type="email" formControlName="email" placeholder="email@exemplo.com">
                            <mat-icon matSuffix>email</mat-icon>
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Telefone</mat-label>
                            <input matInput formControlName="telefone" placeholder="(11) 99999-8888">
                            <mat-icon matSuffix>phone</mat-icon>
                          </mat-form-field>
                        </div>

                        <mat-divider *ngIf="i < contatos.length - 1"></mat-divider>
                      </div>
                    </div>

                  </div>

                </div>
              </mat-tab>

              <!-- Tab 4: Dados Bancários -->
              <mat-tab label="Dados Bancários">
                <div class="tab-content">
                  
                  <div class="form-section">
                    <div class="section-header">
                      <h3 class="section-title">
                        <mat-icon>account_balance</mat-icon>
                        Dados Bancários
                      </h3>
                      <button mat-raised-button 
                              color="accent" 
                              type="button"
                              (click)="adicionarDadosBancarios()">
                        <mat-icon>add</mat-icon>
                        Adicionar Conta
                      </button>
                    </div>

                    <div formArrayName="dados_bancarios" class="dados-bancarios-list">
                      <div *ngFor="let dados of dadosBancarios.controls; let i = index" 
                           [formGroupName]="i" 
                           class="dados-bancarios-item">
                        
                        <div class="dados-header">
                          <h4>Conta {{ i + 1 }}</h4>
                          <div class="dados-actions">
                            <mat-checkbox formControlName="principal">
                              Conta Principal
                            </mat-checkbox>
                            <button mat-icon-button 
                                    color="warn" 
                                    type="button"
                                    (click)="removerDadosBancarios(i)"
                                    [disabled]="dadosBancarios.length === 1">
                              <mat-icon>delete</mat-icon>
                            </button>
                          </div>
                        </div>

                        <div class="form-row">
                          <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Banco *</mat-label>
                            <input matInput formControlName="banco" placeholder="Nome do banco">
                            <mat-icon matSuffix>account_balance</mat-icon>
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Tipo de Conta</mat-label>
                            <mat-select formControlName="tipo_conta">
                              <mat-option value="corrente">Conta Corrente</mat-option>
                              <mat-option value="poupanca">Conta Poupança</mat-option>
                            </mat-select>
                            <mat-icon matSuffix>savings</mat-icon>
                          </mat-form-field>
                        </div>

                        <div class="form-row">
                          <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Agência</mat-label>
                            <input matInput formControlName="agencia" placeholder="0000">
                            <mat-icon matSuffix>business</mat-icon>
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Conta</mat-label>
                            <input matInput formControlName="conta" placeholder="00000-0">
                            <mat-icon matSuffix>credit_card</mat-icon>
                          </mat-form-field>
                        </div>

                        <div class="form-row">
                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>PIX (Opcional)</mat-label>
                            <input matInput formControlName="pix" placeholder="CPF, CNPJ, E-mail ou Telefone">
                            <mat-icon matSuffix>qr_code</mat-icon>
                          </mat-form-field>
                        </div>

                        <mat-divider *ngIf="i < dadosBancarios.length - 1"></mat-divider>
                      </div>
                    </div>

                  </div>

                </div>
              </mat-tab>

            </mat-tab-group>

          </form>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .fornecedor-form-container {
      padding: 20px;
      max-width: 1200px;
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

    .tab-content {
      padding: 24px 0;
    }

    .form-section {
      margin-bottom: 32px;
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

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
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

    .cep-field {
      flex: 1;
    }

    .cep-button {
      margin-top: 8px;
      margin-left: 8px;
    }

    .endereco-field {
      flex: 3;
    }

    .numero-field {
      flex: 1;
    }

    .cidade-field {
      flex: 2;
    }

    .estado-field {
      flex: 1;
    }

    .status-icon {
      margin-right: 8px;
      font-size: 16px;
    }

    .status-icon.active { color: #4caf50; }
    .status-icon.inactive { color: #f44336; }

    .contatos-list, .dados-bancarios-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .contato-item, .dados-bancarios-item {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      background: white;
    }

    .contato-header, .dados-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }

    .contato-header h4, .dados-header h4 {
      margin: 0;
      color: #333;
    }

    .contato-actions, .dados-actions {
      display: flex;
      align-items: center;
      gap: 12px;
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

      .half-width, .endereco-field, .numero-field, .cidade-field, .estado-field {
        width: 100%;
      }
    }
  `]
})
export class FornecedoresFormComponent implements OnInit {
  fornecedorForm: FormGroup;
  isEditing = false;
  isSubmitting = false;
  fornecedorId?: number;

  estados = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.fornecedorForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.fornecedorId = +params['id'];
        this.isEditing = true;
        this.loadFornecedor(this.fornecedorId);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.minLength(2)]],
      tipo_pessoa: ['juridica', [Validators.required]],
      cpf_cnpj: ['', [Validators.required]],
      rg_ie: [''],
      email: ['', [Validators.email]],
      telefone: [''],
      celular: [''],
      endereco: [''],
      numero: [''],
      complemento: [''],
      bairro: [''],
      cidade: [''],
      estado: [''],
      cep: [''],
      ativo: [true, [Validators.required]],
      observacoes: [''],
      contatos: this.fb.array([this.createContatoForm()]),
      dados_bancarios: this.fb.array([this.createDadosBancariosForm()])
    });
  }

  private createContatoForm(): FormGroup {
    return this.fb.group({
      id: [null],
      nome: ['', [Validators.required]],
      cargo: [''],
      email: ['', [Validators.email]],
      telefone: [''],
      principal: [false]
    });
  }

  private createDadosBancariosForm(): FormGroup {
    return this.fb.group({
      id: [null],
      banco: ['', [Validators.required]],
      agencia: [''],
      conta: [''],
      tipo_conta: ['corrente'],
      pix: [''],
      principal: [false]
    });
  }

  get contatos(): FormArray {
    return this.fornecedorForm.get('contatos') as FormArray;
  }

  get dadosBancarios(): FormArray {
    return this.fornecedorForm.get('dados_bancarios') as FormArray;
  }

  // Métodos auxiliares para labels dinâmicos
  getTipoPessoaLabel(): string {
    const tipo = this.fornecedorForm.get('tipo_pessoa')?.value;
    return tipo === 'fisica' ? 'Nome Completo' : 'Razão Social';
  }

  getTipoPessoaPlaceholder(): string {
    const tipo = this.fornecedorForm.get('tipo_pessoa')?.value;
    return tipo === 'fisica' ? 'Digite o nome completo' : 'Digite a razão social';
  }

  getTipoPessoaIcon(): string {
    const tipo = this.fornecedorForm.get('tipo_pessoa')?.value;
    return tipo === 'fisica' ? 'person' : 'business';
  }

  getCpfCnpjLabel(): string {
    const tipo = this.fornecedorForm.get('tipo_pessoa')?.value;
    return tipo === 'fisica' ? 'CPF' : 'CNPJ';
  }

  getCpfCnpjPlaceholder(): string {
    const tipo = this.fornecedorForm.get('tipo_pessoa')?.value;
    return tipo === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00';
  }

  getCpfCnpjMask(): string {
    const tipo = this.fornecedorForm.get('tipo_pessoa')?.value;
    return tipo === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00';
  }

  getRgIeLabel(): string {
    const tipo = this.fornecedorForm.get('tipo_pessoa')?.value;
    return tipo === 'fisica' ? 'RG' : 'Inscrição Estadual';
  }

  getRgIePlaceholder(): string {
    const tipo = this.fornecedorForm.get('tipo_pessoa')?.value;
    return tipo === 'fisica' ? '00.000.000-0' : '000.000.000.000';
  }

  // Eventos
  onTipoPessoaChange(tipo: string): void {
    // Limpar campos quando mudar o tipo
    this.fornecedorForm.patchValue({
      cpf_cnpj: '',
      rg_ie: ''
    });
  }

  // Métodos de manipulação de arrays
  adicionarContato(): void {
    this.contatos.push(this.createContatoForm());
  }

  removerContato(index: number): void {
    if (this.contatos.length > 1) {
      this.contatos.removeAt(index);
    }
  }

  adicionarDadosBancarios(): void {
    this.dadosBancarios.push(this.createDadosBancariosForm());
  }

  removerDadosBancarios(index: number): void {
    if (this.dadosBancarios.length > 1) {
      this.dadosBancarios.removeAt(index);
    }
  }

  // Busca de CEP
  buscarCep(): void {
    const cep = this.fornecedorForm.get('cep')?.value;
    if (cep && cep.length === 9) {
      // Simular busca de CEP - substituir por serviço real
      this.snackBar.open('Buscando CEP...', '', { duration: 1000 });
      
      // Exemplo de dados fictícios
      setTimeout(() => {
        this.fornecedorForm.patchValue({
          endereco: 'Rua das Flores',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP'
        });
        this.snackBar.open('CEP encontrado!', 'OK', { duration: 2000 });
      }, 1000);
    }
  }

  // Carregamento de dados
  private loadFornecedor(id: number): void {
    // Simular carregamento - substituir por serviço real
    const fornecedorExemplo: Fornecedor = {
      id: id,
      nome: 'Fornecedor Exemplo Ltda',
      tipo_pessoa: 'juridica',
      cpf_cnpj: '12.345.678/0001-90',
      rg_ie: '123456789',
      email: 'contato@fornecedor.com',
      telefone: '(11) 3333-4444',
      celular: '(11) 99999-8888',
      endereco: 'Rua das Empresas, 123',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      ativo: true,
      observacoes: 'Fornecedor de confiança',
      contatos: [
        {
          id: 1,
          nome: 'João Silva',
          cargo: 'Gerente',
          email: 'joao@fornecedor.com',
          telefone: '(11) 99999-1111',
          principal: true
        }
      ],
      dados_bancarios: [
        {
          id: 1,
          banco: 'Banco do Brasil',
          agencia: '1234',
          conta: '56789-0',
          tipo_conta: 'corrente',
          pix: 'contato@fornecedor.com',
          principal: true
        }
      ]
    };

    this.populateForm(fornecedorExemplo);
  }

  private populateForm(fornecedor: Fornecedor): void {
    // Limpar arrays existentes
    while (this.contatos.length > 0) {
      this.contatos.removeAt(0);
    }
    while (this.dadosBancarios.length > 0) {
      this.dadosBancarios.removeAt(0);
    }

    // Preencher dados básicos
    this.fornecedorForm.patchValue({
      id: fornecedor.id,
      nome: fornecedor.nome,
      tipo_pessoa: fornecedor.tipo_pessoa,
      cpf_cnpj: fornecedor.cpf_cnpj,
      rg_ie: fornecedor.rg_ie,
      email: fornecedor.email,
      telefone: fornecedor.telefone,
      celular: fornecedor.celular,
      endereco: fornecedor.endereco,
      numero: fornecedor.numero,
      complemento: fornecedor.complemento,
      bairro: fornecedor.bairro,
      cidade: fornecedor.cidade,
      estado: fornecedor.estado,
      cep: fornecedor.cep,
      ativo: fornecedor.ativo,
      observacoes: fornecedor.observacoes
    });

    // Preencher contatos
    if (fornecedor.contatos && fornecedor.contatos.length > 0) {
      fornecedor.contatos.forEach(contato => {
        const contatoForm = this.createContatoForm();
        contatoForm.patchValue(contato);
        this.contatos.push(contatoForm);
      });
    } else {
      this.contatos.push(this.createContatoForm());
    }

    // Preencher dados bancários
    if (fornecedor.dados_bancarios && fornecedor.dados_bancarios.length > 0) {
      fornecedor.dados_bancarios.forEach(dados => {
        const dadosForm = this.createDadosBancariosForm();
        dadosForm.patchValue(dados);
        this.dadosBancarios.push(dadosForm);
      });
    } else {
      this.dadosBancarios.push(this.createDadosBancariosForm());
    }
  }

  // Navegação
  voltar(): void {
    this.router.navigate(['/configuracoes/cadastros/fornecedores']);
  }

  // Submissão do formulário
  onSubmit(): void {
    if (this.fornecedorForm.valid) {
      this.isSubmitting = true;
      const formData = this.fornecedorForm.value;

      console.log('Dados do fornecedor:', formData);

      // Simular chamada à API
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open(
          `Fornecedor ${this.isEditing ? 'atualizado' : 'criado'} com sucesso!`,
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
    Object.keys(this.fornecedorForm.controls).forEach(key => {
      const control = this.fornecedorForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            Object.keys(arrayControl.controls).forEach(arrayKey => {
              arrayControl.get(arrayKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }
}
