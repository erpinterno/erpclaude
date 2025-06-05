import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IntegracoesService, Integracao, TipoIntegracao, TabelaDisponivel } from '../../../../core/services/integracoes.service';

@Component({
  selector: 'app-integracoes-form',
  templateUrl: './integracoes-form.component.html',
  styleUrls: ['./integracoes-form.component.scss']
})
export class IntegracoesFormComponent implements OnInit {
  integracaoForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  isEditing = false;
  integracaoId: number | null = null;

  // Tipos disponíveis
  tiposDisponiveis: TipoIntegracao[] = [];
  tiposRequisicao: TipoIntegracao[] = [];
  tiposImportacao: TipoIntegracao[] = [];
  tabelasDisponiveis: TabelaDisponivel[] = [];

  // Controle de abas
  activeTab = 'basico';

  // Upload de documentação
  uploadingDoc = false;
  docFile: File | null = null;

  // Propriedades para template de exemplo
  APP_KEY = 'sua_app_key_aqui';
  APP_SECRET = 'sua_app_secret_aqui';

  constructor(
    private fb: FormBuilder,
    private integracoesService: IntegracoesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.integracaoForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadTipos();
    this.loadTabelas();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.integracaoId = +params['id'];
        this.loadIntegracao();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Informações básicas
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['', Validators.required],
      descricao: ['', Validators.maxLength(500)],
      
      // Configuração da requisição
      tipo_requisicao: ['', Validators.required],
      tipo_importacao: ['', Validators.required],
      base_url: ['', [Validators.maxLength(255)]],
      metodo_integracao: ['', Validators.maxLength(100)],
      link_integracao: ['', Validators.maxLength(500)],
      link_documentacao: ['', Validators.maxLength(500)],
      
      // Estrutura de dados
      estrutura_dados: [''],
      formato_exemplo: [''],
      
      // Configuração de execução
      intervalo_execucao: [null, [Validators.min(1)]],
      cron_expression: ['', Validators.maxLength(100)],
      
      // Destino dos dados
      tabela_destino: ['', Validators.maxLength(100)],
      tela_origem: ['', Validators.maxLength(100)],
      consulta_sql: [''],
      
      // Autenticação
      app_key: ['', Validators.maxLength(255)],
      app_secret: ['', Validators.maxLength(255)],
      token: ['', Validators.maxLength(500)],
      
      // Configurações extras
      configuracoes_extras: [''],
      
      // Status
      ativo: [true]
    });
  }

  loadTipos(): void {
    this.integracoesService.getTiposDisponiveis().subscribe({
      next: (response: { 
        tipos: TipoIntegracao[], 
        tipos_requisicao: TipoIntegracao[], 
        tipos_importacao: TipoIntegracao[] 
      }) => {
        this.tiposDisponiveis = response.tipos || [];
        this.tiposRequisicao = response.tipos_requisicao || [];
        this.tiposImportacao = response.tipos_importacao || [];
      },
      error: (error: any) => {
        console.error('Erro ao carregar tipos:', error);
        this.tiposDisponiveis = [];
        this.tiposRequisicao = [];
        this.tiposImportacao = [];
      }
    });
  }

  loadTabelas(): void {
    this.integracoesService.getTabelasDisponiveis().subscribe({
      next: (response: { tabelas: TabelaDisponivel[] }) => {
        this.tabelasDisponiveis = response.tabelas;
      },
      error: (error: any) => {
        console.error('Erro ao carregar tabelas:', error);
      }
    });
  }

  loadIntegracao(): void {
    if (!this.integracaoId) return;

    this.loading = true;
    this.integracoesService.getIntegracao(this.integracaoId).subscribe({
      next: (integracao: Integracao) => {
        this.integracaoForm.patchValue({
          ...integracao,
          estrutura_dados: integracao.estrutura_dados ? JSON.stringify(integracao.estrutura_dados, null, 2) : '',
          configuracoes_extras: integracao.configuracoes_extras ? JSON.stringify(integracao.configuracoes_extras, null, 2) : ''
        });
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Erro ao carregar integração: ' + (error.error?.detail || error.message);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.integracaoForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const formData = { ...this.integracaoForm.value };
    
    // Parse JSON fields
    ['estrutura_dados', 'configuracoes_extras'].forEach(field => {
      if (formData[field]) {
        try {
          formData[field] = JSON.parse(formData[field]);
        } catch (e) {
          this.error = `${field} deve estar em formato JSON válido`;
          this.loading = false;
          return;
        }
      } else {
        formData[field] = null;
      }
    });

    // Gerar link da integração automaticamente
    if (formData.base_url && formData.metodo_integracao) {
      formData.link_integracao = `${formData.base_url.replace(/\/$/, '')}/${formData.metodo_integracao}`;
    }

    const operation = this.isEditing
      ? this.integracoesService.updateIntegracao(this.integracaoId!, formData)
      : this.integracoesService.createIntegracao(formData);

    operation.subscribe({
      next: () => {
        this.success = this.isEditing ? 'Integração atualizada com sucesso!' : 'Integração criada com sucesso!';
        this.loading = false;
        
        setTimeout(() => {
          this.router.navigate(['/configuracoes/integracoes']);
        }, 2000);
      },
      error: (error: any) => {
        this.error = 'Erro ao salvar integração: ' + (error.error?.detail || error.message);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/configuracoes/integracoes']);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  markFormGroupTouched(): void {
    Object.keys(this.integracaoForm.controls).forEach(key => {
      const control = this.integracaoForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.integracaoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.integracaoForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Campo obrigatório';
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['url']) return 'URL inválida';
    }
    return '';
  }

  onTipoChange(): void {
    const tipo = this.integracaoForm.get('tipo')?.value;
    
    // Configurações específicas por tipo
    if (tipo === 'ERP') {
      this.integracaoForm.patchValue({
        tipo_requisicao: 'POST',
        tipo_importacao: 'INCREMENTAL'
      });
    }
  }

  onTipoRequisicaoChange(): void {
    const tipoRequisicao = this.integracaoForm.get('tipo_requisicao')?.value;
    
    // Se for POST, mostrar campo de consulta SQL
    if (tipoRequisicao === 'POST') {
      this.integracaoForm.get('consulta_sql')?.setValidators([Validators.required]);
    } else {
      this.integracaoForm.get('consulta_sql')?.clearValidators();
    }
    this.integracaoForm.get('consulta_sql')?.updateValueAndValidity();
  }

  getTipoDescricao(codigo: string): string {
    const tipo = this.tiposDisponiveis.find(t => t.codigo === codigo);
    return tipo ? tipo.descricao : '';
  }

  formatJson(fieldName: string): void {
    const field = this.integracaoForm.get(fieldName);
    if (field?.value) {
      try {
        const parsed = JSON.parse(field.value);
        field.setValue(JSON.stringify(parsed, null, 2));
      } catch (e) {
        // Ignora erro de formatação
      }
    }
  }

  validarSQL(): void {
    const consultaSQL = this.integracaoForm.get('consulta_sql')?.value;
    const tabelaDestino = this.integracaoForm.get('tabela_destino')?.value;

    if (!consultaSQL || !tabelaDestino) {
      this.error = 'Preencha a consulta SQL e a tabela de destino para validar';
      return;
    }

    this.loading = true;
    this.integracoesService.validarSQL({ consulta_sql: consultaSQL, tabela_destino: tabelaDestino }).subscribe({
      next: (response: any) => {
        if (response.valida) {
          this.success = `SQL válida! Campos retornados: ${response.campos_retornados?.join(', ')}`;
        } else {
          this.error = `SQL inválida: ${response.erro}`;
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Erro ao validar SQL: ' + (error.error?.detail || error.message);
        this.loading = false;
      }
    });
  }

  carregarTemplateOmie(): void {
    this.integracoesService.getTemplateOmie().subscribe({
      next: (template: any) => {
        this.integracaoForm.patchValue({
          nome: template.nome,
          tipo: template.tipo,
          descricao: template.descricao,
          base_url: template.base_url,
          metodo_integracao: template.metodo_integracao,
          tipo_requisicao: template.tipo_requisicao,
          tipo_importacao: template.tipo_importacao,
          tabela_destino: template.tabela_destino,
          estrutura_dados: JSON.stringify(template.estrutura_dados, null, 2),
          formato_exemplo: template.formato_exemplo,
          configuracoes_extras: JSON.stringify(template.configuracoes_extras, null, 2),
          link_documentacao: template.link_documentacao,
          intervalo_execucao: template.intervalo_execucao,
          cron_expression: template.cron_expression
        });
        this.success = 'Template do Omie carregado com sucesso!';
      },
      error: (error: any) => {
        this.error = 'Erro ao carregar template: ' + (error.error?.detail || error.message);
      }
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.docFile = file;
    }
  }

  importarDocumentacao(): void {
    if (!this.docFile || !this.integracaoId) {
      this.error = 'Selecione um arquivo e salve a integração primeiro';
      return;
    }

    this.uploadingDoc = true;
    const reader = new FileReader();
    
    reader.onload = () => {
      const conteudo = reader.result as string;
      const tipoArquivo = this.docFile!.name.split('.').pop()?.toLowerCase() || 'txt';
      
      const request = {
        integracao_id: this.integracaoId!,
        arquivo_conteudo: conteudo,
        nome_arquivo: this.docFile!.name,
        tipo_arquivo: tipoArquivo
      };

      this.integracoesService.importarDocumentacao(request).subscribe({
        next: (response: any) => {
          if (response.sucesso) {
            this.success = `Documentação importada! Campos preenchidos: ${response.campos_preenchidos.join(', ')}`;
            // Recarregar a integração para ver os campos preenchidos
            this.loadIntegracao();
          } else {
            this.error = response.mensagem;
          }
          this.uploadingDoc = false;
        },
        error: (error: any) => {
          this.error = 'Erro ao importar documentação: ' + (error.error?.detail || error.message);
          this.uploadingDoc = false;
        }
      });
    };

    reader.readAsText(this.docFile);
  }

  gerarCronExpression(): void {
    const intervalo = this.integracaoForm.get('intervalo_execucao')?.value;
    if (intervalo) {
      let cronExpression = '';
      
      if (intervalo < 60) {
        // Minutos
        cronExpression = `*/${intervalo} * * * *`;
      } else if (intervalo < 1440) {
        // Horas
        const horas = Math.floor(intervalo / 60);
        cronExpression = `0 */${horas} * * *`;
      } else {
        // Dias
        const dias = Math.floor(intervalo / 1440);
        cronExpression = `0 0 */${dias} * *`;
      }
      
      this.integracaoForm.patchValue({ cron_expression: cronExpression });
    }
  }

  previewLinkIntegracao(): string {
    const baseUrl = this.integracaoForm.get('base_url')?.value;
    const metodo = this.integracaoForm.get('metodo_integracao')?.value;
    
    if (baseUrl && metodo) {
      return `${baseUrl.replace(/\/$/, '')}/${metodo}`;
    }
    
    return '';
  }
}
