import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IntegracoesService, IntegracaoPublic, IntegracaoTeste, SincronizacaoRequest, SincronizacaoResponse } from '../../../../core/services/integracoes.service';

@Component({
  selector: 'app-teste-api',
  templateUrl: './teste-api.component.html',
  styleUrls: ['./teste-api.component.scss']
})
export class TesteApiComponent implements OnInit {
  testeForm: FormGroup;
  integracoes: IntegracaoPublic[] = [];
  loading = false;
  testando = false;
  sincronizando = false;
  
  // Resultados
  ultimoTeste: IntegracaoTeste | null = null;
  ultimaSincronizacao: SincronizacaoResponse | null = null;
  
  // Configuração rápida do Omie
  omieForm: FormGroup;
  configurandoOmie = false;

  // Tipos de dados para sincronização
  tiposDados = [
    { value: 'empresas', label: 'Empresas' },
    { value: 'clientes', label: 'Clientes' },
    { value: 'fornecedores', label: 'Fornecedores' },
    { value: 'produtos', label: 'Produtos' }
  ];

  constructor(
    private fb: FormBuilder,
    private integracoesService: IntegracoesService,
    private router: Router
  ) {
    this.testeForm = this.createTesteForm();
    this.omieForm = this.createOmieForm();
  }

  ngOnInit(): void {
    this.loadIntegracoes();
  }

  createTesteForm(): FormGroup {
    return this.fb.group({
      integracao_id: ['', Validators.required],
      tipo_dados: ['empresas', Validators.required],
      registros_por_pagina: [50, [Validators.min(1), Validators.max(100)]]
    });
  }

  createOmieForm(): FormGroup {
    return this.fb.group({
      app_key: ['', Validators.required],
      app_secret: ['', Validators.required]
    });
  }

  loadIntegracoes(): void {
    this.loading = true;
    this.integracoesService.getIntegracoes(1, 100, undefined, undefined, true).subscribe({
      next: (response: any) => {
        this.integracoes = response.items || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar integrações:', error);
        this.integracoes = [];
        this.loading = false;
      }
    });
  }

  testarConexao(): void {
    if (this.testeForm.invalid) {
      this.markFormGroupTouched(this.testeForm);
      return;
    }

    const integracaoId = this.testeForm.get('integracao_id')?.value;
    this.testando = true;
    this.ultimoTeste = null;

    this.integracoesService.testarIntegracao(integracaoId).subscribe({
      next: (resultado: IntegracaoTeste) => {
        this.ultimoTeste = resultado;
        this.testando = false;
      },
      error: (error: any) => {
        this.ultimoTeste = {
          sucesso: false,
          mensagem: `Erro ao testar: ${error.error?.detail || error.message}`,
          detalhes: error
        };
        this.testando = false;
      }
    });
  }

  sincronizarDados(): void {
    if (this.testeForm.invalid) {
      this.markFormGroupTouched(this.testeForm);
      return;
    }

    const formData = this.testeForm.value;
    const request: SincronizacaoRequest = {
      integracao_id: formData.integracao_id,
      tipo_dados: formData.tipo_dados,
      parametros: {
        registros_por_pagina: formData.registros_por_pagina
      }
    };

    this.sincronizando = true;
    this.ultimaSincronizacao = null;

    this.integracoesService.sincronizarDados(request).subscribe({
      next: (resultado: SincronizacaoResponse) => {
        this.ultimaSincronizacao = resultado;
        this.sincronizando = false;
      },
      error: (error: any) => {
        this.ultimaSincronizacao = {
          sucesso: false,
          total_processados: 0,
          total_importados: 0,
          total_atualizadas: 0,
          total_erros: 1,
          mensagens: [`Erro na sincronização: ${error.error?.detail || error.message}`],
          detalhes: error
        };
        this.sincronizando = false;
      }
    });
  }

  configurarOmieRapido(): void {
    if (this.omieForm.invalid) {
      this.markFormGroupTouched(this.omieForm);
      return;
    }

    const { app_key, app_secret } = this.omieForm.value;
    this.configurandoOmie = true;

    this.integracoesService.configurarOmie(app_key, app_secret).subscribe({
      next: () => {
        this.configurandoOmie = false;
        this.omieForm.reset();
        this.loadIntegracoes(); // Recarregar lista
        alert('✅ Integração do Omie configurada com sucesso!');
      },
      error: (error: any) => {
        this.configurandoOmie = false;
        alert(`❌ Erro ao configurar Omie: ${error.error?.detail || error.message}`);
      }
    });
  }

  voltarParaLista(): void {
    this.router.navigate(['/configuracoes/integracoes']);
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Campo obrigatório';
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;
    }
    return '';
  }

  getIntegracaoNome(id: number): string {
    const integracao = this.integracoes.find(i => i.id === id);
    return integracao ? integracao.nome : 'Desconhecida';
  }

  getTipoDadosLabel(tipo: string): string {
    const tipoObj = this.tiposDados.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }
}
