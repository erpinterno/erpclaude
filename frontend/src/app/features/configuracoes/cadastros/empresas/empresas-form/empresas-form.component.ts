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
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';

interface Empresa {
  id?: number;
  razao_social: string;
  nome_fantasia?: string;
  cnpj?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  inscricao_suframa?: string;
  endereco?: string;
  endereco_numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  codigo_pais?: string;
  telefone1_ddd?: string;
  telefone1_numero?: string;
  telefone2_ddd?: string;
  telefone2_numero?: string;
  fax_ddd?: string;
  fax_numero?: string;
  email?: string;
  homepage?: string;
  optante_simples_nacional?: string;
  data_abertura?: string;
  cnae?: string;
  tipo_atividade?: string;
  codigo_regime_tributario?: string;
  codigo_banco?: string;
  agencia?: string;
  conta_corrente?: string;
  doc_titular?: string;
  nome_titular?: string;
  observacoes?: string;
  inativo?: string;
  bloqueado?: string;
  ativo: boolean;
}

@Component({
  selector: 'app-empresas-form',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule
  ],
  template: `
    <div class="empresa-form-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <button mat-icon-button (click)="voltar()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-text">
            <h1>{{ isEditing ? 'Editar Empresa' : 'Nova Empresa' }}</h1>
            <p>{{ isEditing ? 'Atualize as informações da empresa' : 'Cadastre uma nova empresa' }}</p>
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
                  [disabled]="empresaForm.invalid || isSubmitting">
            <mat-icon>{{ isSubmitting ? 'hourglass_empty' : 'save' }}</mat-icon>
            {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <!-- Formulário com Tabs -->
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="empresaForm" class="empresa-form">
            
            <mat-tab-group animationDuration="300ms">
              
              <!-- Tab 1: Dados Básicos -->
              <mat-tab label="Dados Básicos">
                <div class="tab-content">
                  
                  <!-- Identificação -->
                  <div class="form-section">
                    <h3 class="section-title">
                      <mat-icon>business</mat-icon>
                      Identificação da Empresa
                    </h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Razão Social *</mat-label>
                        <input matInput 
                               formControlName="razao_social" 
                               placeholder="Digite a razão social da empresa"
                               maxlength="200">
                        <mat-icon matSuffix>business</mat-icon>
                        <mat-error *ngIf="empresaForm.get('razao_social')?.hasError('required')">
                          Razão Social é obrigatória
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Nome Fantasia</mat-label>
                        <input matInput 
                               formControlName="nome_fantasia" 
                               placeholder="Digite o nome fantasia"
                               maxlength="200">
                        <mat-icon matSuffix>store</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>CNPJ</mat-label>
                        <input matInput 
                               formControlName="cnpj" 
                               placeholder="00.000.000/0000-00"
                               maxlength="18">
                        <mat-icon matSuffix>fingerprint</mat-icon>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="third-width">
                        <mat-label>Inscrição Estadual</mat-label>
                        <input matInput 
                               formControlName="inscricao_estadual" 
                               placeholder="Digite a IE"
                               maxlength="20">
                        <mat-icon matSuffix>assignment_ind</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="third-width">
                        <mat-label>Inscrição Municipal</mat-label>
                        <input matInput 
                               formControlName="inscricao_municipal" 
                               placeholder="Digite a IM"
                               maxlength="20">
                        <mat-icon matSuffix>location_city</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="third-width">
                        <mat-label>Inscrição SUFRAMA</mat-label>
                        <input matInput 
                               formControlName="inscricao_suframa" 
                               placeholder="Digite a SUFRAMA"
                               maxlength="20">
                        <mat-icon matSuffix>verified</mat-icon>
                      </mat-form-field>
                    </div>
                  </div>

                  <!-- Informações Fiscais -->
                  <div class="form-section">
                    <h3 class="section-title">
                      <mat-icon>account_balance</mat-icon>
                      Informações Fiscais
                    </h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="quarter-width">
                        <mat-label>Tipo de Atividade</mat-label>
                        <mat-select formControlName="tipo_atividade">
                          <mat-option *ngFor="let tipo of tiposAtividade" [value]="tipo.value">
                            {{ tipo.label }}
                          </mat-option>
                        </mat-select>
                        <mat-icon matSuffix>category</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="quarter-width">
                        <mat-label>Regime Tributário</mat-label>
                        <mat-select formControlName="codigo_regime_tributario">
                          <mat-option *ngFor="let regime of regimesTributarios" [value]="regime.value">
                            {{ regime.label }}
                          </mat-option>
                        </mat-select>
                        <mat-icon matSuffix>gavel</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="quarter-width">
                        <mat-label>CNAE</mat-label>
                        <input matInput 
                               formControlName="cnae" 
                               placeholder="0000-0/00"
                               maxlength="10">
                        <mat-icon matSuffix>code</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="quarter-width">
                        <mat-label>Data de Abertura</mat-label>
                        <input matInput 
                               [matDatepicker]="picker"
                               formControlName="data_abertura"
                               placeholder="Selecione a data">
                        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                        <mat-datepicker #picker></mat-datepicker>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <div class="checkbox-group">
                        <mat-checkbox formControlName="optante_simples_nacional">
                          Optante do Simples Nacional
                        </mat-checkbox>
                      </div>
                    </div>
                  </div>

                  <!-- Status -->
                  <div class="form-section">
                    <h3 class="section-title">
                      <mat-icon>flag</mat-icon>
                      Status da Empresa
                    </h3>
                    
                    <div class="form-row">
                      <div class="checkbox-group">
                        <mat-checkbox formControlName="ativo">
                          Empresa Ativa
                        </mat-checkbox>
                      </div>
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
                               maxlength="10">
                        <mat-icon matSuffix>location_searching</mat-icon>
                      </mat-form-field>

                      <button mat-icon-button 
                              type="button"
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
                               placeholder="Rua, Avenida, etc."
                               maxlength="255">
                        <mat-icon matSuffix>home</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="numero-field">
                        <mat-label>Número</mat-label>
                        <input matInput 
                               formControlName="endereco_numero" 
                               placeholder="123"
                               maxlength="10">
                        <mat-icon matSuffix>tag</mat-icon>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Complemento</mat-label>
                        <input matInput 
                               formControlName="complemento" 
                               placeholder="Apto, Sala, etc."
                               maxlength="100">
                        <mat-icon matSuffix>add_location</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Bairro</mat-label>
                        <input matInput 
                               formControlName="bairro" 
                               placeholder="Nome do bairro"
                               maxlength="100">
                        <mat-icon matSuffix>location_city</mat-icon>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="cidade-field">
                        <mat-label>Cidade</mat-label>
                        <input matInput 
                               formControlName="cidade" 
                               placeholder="Nome da cidade"
                               maxlength="100">
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

              <!-- Tab 3: Contato -->
              <mat-tab label="Contato">
                <div class="tab-content">
                  
                  <div class="form-section">
                    <h3 class="section-title">
                      <mat-icon>contact_phone</mat-icon>
                      Informações de Contato
                    </h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>E-mail</mat-label>
                        <input matInput 
                               type="email"
                               formControlName="email" 
                               placeholder="empresa@exemplo.com"
                               maxlength="100">
                        <mat-icon matSuffix>email</mat-icon>
                        <mat-error *ngIf="empresaForm.get('email')?.hasError('email')">
                          E-mail inválido
                        </mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Homepage</mat-label>
                        <input matInput 
                               type="url"
                               formControlName="homepage" 
                               placeholder="https://www.empresa.com.br"
                               maxlength="255">
                        <mat-icon matSuffix>language</mat-icon>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="third-width">
                        <mat-label>Telefone Principal</mat-label>
                        <input matInput 
                               formControlName="telefone1_numero" 
                               placeholder="(11) 3333-4444">
                        <mat-icon matSuffix>phone</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="third-width">
                        <mat-label>Telefone Secundário</mat-label>
                        <input matInput 
                               formControlName="telefone2_numero" 
                               placeholder="(11) 3333-5555">
                        <mat-icon matSuffix>phone</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="third-width">
                        <mat-label>Fax</mat-label>
                        <input matInput 
                               formControlName="fax_numero" 
                               placeholder="(11) 3333-6666">
                        <mat-icon matSuffix>print</mat-icon>
                      </mat-form-field>
                    </div>
                  </div>

                </div>
              </mat-tab>

              <!-- Tab 4: Observações -->
              <mat-tab label="Observações">
                <div class="tab-content">
                  
                  <div class="form-section">
                    <h3 class="section-title">
                      <mat-icon>notes</mat-icon>
                      Observações Gerais
                    </h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Observações</mat-label>
                        <textarea matInput 
                                  formControlName="observacoes" 
                                  rows="6"
                                  maxlength="1000"
                                  placeholder="Informações adicionais sobre a empresa..."></textarea>
                        <mat-icon matSuffix>comment</mat-icon>
                        <mat-hint align="end">
                          {{ empresaForm.get('observacoes')?.value?.length || 0 }}/1000
                        </mat-hint>
                      </mat-form-field>
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
    .empresa-form-container {
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

    .third-width {
      flex: 1;
    }

    .quarter-width {
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

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0;
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

      .half-width, .third-width, .quarter-width, .endereco-field, .numero-field, .cidade-field, .estado-field {
        width: 100%;
      }
    }
  `]
})
export class EmpresasFormComponent implements OnInit {
  empresaForm: FormGroup;
  isEditing = false;
  isSubmitting = false;
  empresaId?: number;

  // Opções para selects
  tiposAtividade = [
    { value: '0', label: 'Outros' },
    { value: '1', label: 'Industrial' },
    { value: '2', label: 'Comercial' },
    { value: '3', label: 'Prestação de serviços' },
    { value: '4', label: 'Construção civil' },
    { value: '5', label: 'Produtor rural' }
  ];

  regimesTributarios = [
    { value: '1', label: 'Simples Nacional' },
    { value: '2', label: 'Simples Nacional - excesso de sublimite de receita bruta' },
    { value: '3', label: 'Regime Normal' }
  ];

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
    this.empresaForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      if (params['id']) {
        this.empresaId = +params['id'];
        this.isEditing = true;
        this.loadEmpresa(this.empresaId);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      razao_social: ['', [Validators.required, Validators.maxLength(200)]],
      nome_fantasia: ['', Validators.maxLength(200)],
      cnpj: ['', Validators.maxLength(18)],
      inscricao_estadual: ['', Validators.maxLength(20)],
      inscricao_municipal: ['', Validators.maxLength(20)],
      inscricao_suframa: ['', Validators.maxLength(20)],
      endereco: ['', Validators.maxLength(255)],
      endereco_numero: ['', Validators.maxLength(10)],
      bairro: ['', Validators.maxLength(100)],
      complemento: ['', Validators.maxLength(100)],
      cidade: ['', Validators.maxLength(100)],
      estado: ['', Validators.maxLength(2)],
      cep: ['', Validators.maxLength(10)],
      codigo_pais: ['1058'], // Brasil por padrão
      telefone1_ddd: ['', Validators.maxLength(3)],
      telefone1_numero: ['', Validators.maxLength(15)],
      telefone2_ddd: ['', Validators.maxLength(3)],
      telefone2_numero: ['', Validators.maxLength(15)],
      fax_ddd: ['', Validators.maxLength(3)],
      fax_numero: ['', Validators.maxLength(15)],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      homepage: ['', Validators.maxLength(255)],
      optante_simples_nacional: [false],
      data_abertura: [''],
      cnae: ['', Validators.maxLength(10)],
      tipo_atividade: ['0'],
      codigo_regime_tributario: ['1'],
      codigo_banco: ['', Validators.maxLength(10)],
      agencia: ['', Validators.maxLength(10)],
      conta_corrente: ['', Validators.maxLength(20)],
      doc_titular: ['', Validators.maxLength(18)],
      nome_titular: ['', Validators.maxLength(100)],
      observacoes: [''],
      ativo: [true, [Validators.required]]
    });
  }

  private loadEmpresa(id: number): void {
    // Simular carregamento - substituir por serviço real
    const empresaExemplo: Empresa = {
      id: id,
      razao_social: 'Empresa Exemplo Ltda',
      nome_fantasia: 'Exemplo Corp',
      cnpj: '12.345.678/0001-90',
      inscricao_estadual: '123456789',
      inscricao_municipal: '987654321',
      endereco: 'Rua das Empresas, 123',
      endereco_numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      email: 'contato@empresa.com.br',
      homepage: 'https://www.empresa.com.br',
      telefone1_numero: '(11) 3333-4444',
      tipo_atividade: '2',
      codigo_regime_tributario: '1',
      cnae: '4711-3/02',
      optante_simples_nacional: 'S',
      ativo: true,
      observacoes: 'Empresa de exemplo para demonstração'
    };

    this.populateForm(empresaExemplo);
  }

  private populateForm(empresa: Empresa): void {
    this.empresaForm.patchValue({
      id: empresa.id,
      razao_social: empresa.razao_social,
      nome_fantasia: empresa.nome_fantasia,
      cnpj: empresa.cnpj,
      inscricao_estadual: empresa.inscricao_estadual,
      inscricao_municipal: empresa.inscricao_municipal,
      inscricao_suframa: empresa.inscricao_suframa,
      endereco: empresa.endereco,
      endereco_numero: empresa.endereco_numero,
      bairro: empresa.bairro,
      complemento: empresa.complemento,
      cidade: empresa.cidade,
      estado: empresa.estado,
      cep: empresa.cep,
      telefone1_numero: empresa.telefone1_numero,
      telefone2_numero: empresa.telefone2_numero,
      fax_numero: empresa.fax_numero,
      email: empresa.email,
      homepage: empresa.homepage,
      optante_simples_nacional: empresa.optante_simples_nacional === 'S',
      data_abertura: empresa.data_abertura,
      cnae: empresa.cnae,
      tipo_atividade: empresa.tipo_atividade,
      codigo_regime_tributario: empresa.codigo_regime_tributario,
      ativo: empresa.ativo,
      observacoes: empresa.observacoes
    });
  }

  // Navegação
  voltar(): void {
    this.router.navigate(['/configuracoes/cadastros/empresas']);
  }

  // Submissão do formulário
  onSubmit(): void {
    if (this.empresaForm.valid) {
      this.isSubmitting = true;
      const formData = this.empresaForm.value;

      console.log('Dados da empresa:', formData);

      // Simular chamada à API
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open(
          `Empresa ${this.isEditing ? 'atualizada' : 'criada'} com sucesso!`,
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
    Object.keys(this.empresaForm.controls).forEach(key => {
      this.empresaForm.get(key)?.markAsTouched();
    });
  }
}
