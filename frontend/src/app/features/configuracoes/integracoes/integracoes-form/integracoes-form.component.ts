import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IntegracoesService, Integracao, TipoIntegracao } from '../../../../core/services/integracoes.service';

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
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['', Validators.required],
      descricao: ['', Validators.maxLength(500)],
      base_url: ['', [Validators.maxLength(255)]],
      app_key: ['', Validators.maxLength(100)],
      app_secret: ['', Validators.maxLength(100)],
      token: ['', Validators.maxLength(500)],
      configuracoes_extras: [''],
      ativo: [true]
    });
  }

  loadTipos(): void {
    this.integracoesService.getTiposDisponiveis().subscribe({
      next: (response) => {
        this.tiposDisponiveis = response.tipos;
      },
      error: (error) => {
        console.error('Erro ao carregar tipos:', error);
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
          configuracoes_extras: integracao.configuracoes_extras ? JSON.stringify(integracao.configuracoes_extras, null, 2) : ''
        });
        this.loading = false;
      },
      error: (error) => {
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
    
    // Parse configurações extras se fornecidas
    if (formData.configuracoes_extras) {
      try {
        formData.configuracoes_extras = JSON.parse(formData.configuracoes_extras);
      } catch (e) {
        this.error = 'Configurações extras devem estar em formato JSON válido';
        this.loading = false;
        return;
      }
    } else {
      formData.configuracoes_extras = null;
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
      error: (error) => {
        this.error = 'Erro ao salvar integração: ' + (error.error?.detail || error.message);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/configuracoes/integracoes']);
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
      if (field.errors['url']) return 'URL inválida';
    }
    return '';
  }

  onTipoChange(): void {
    const tipo = this.integracaoForm.get('tipo')?.value;
    
    // Configurações específicas por tipo
    if (tipo === 'omie') {
      this.integracaoForm.patchValue({
        base_url: 'https://app.omie.com.br/api/v1/',
        nome: this.integracaoForm.get('nome')?.value || 'Integração Omie'
      });
    } else if (tipo === 'bling') {
      this.integracaoForm.patchValue({
        base_url: 'https://bling.com.br/Api/v2/',
        nome: this.integracaoForm.get('nome')?.value || 'Integração Bling'
      });
    }
  }

  getTipoDescricao(codigo: string): string {
    const tipo = this.tiposDisponiveis.find(t => t.codigo === codigo);
    return tipo ? tipo.descricao : '';
  }

  formatJson(): void {
    const configField = this.integracaoForm.get('configuracoes_extras');
    if (configField?.value) {
      try {
        const parsed = JSON.parse(configField.value);
        configField.setValue(JSON.stringify(parsed, null, 2));
      } catch (e) {
        // Ignora erro de formatação
      }
    }
  }
}
