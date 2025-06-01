import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmpresasService, Empresa } from '../../../../../core/services/empresas.service';

@Component({
  selector: 'app-empresas-form',
  templateUrl: './empresas-form.component.html',
  styleUrls: ['./empresas-form.component.scss']
})
export class EmpresasFormComponent implements OnInit {
  empresaForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  isEditing = false;
  empresaId: number | null = null;

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
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  constructor(
    private fb: FormBuilder,
    private empresasService: EmpresasService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.empresaForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.empresaId = +params['id'];
        this.loadEmpresa();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Dados básicos
      razao_social: ['', [Validators.required, Validators.maxLength(200)]],
      nome_fantasia: ['', Validators.maxLength(200)],
      cnpj: ['', Validators.maxLength(18)],
      inscricao_estadual: ['', Validators.maxLength(20)],
      inscricao_municipal: ['', Validators.maxLength(20)],
      inscricao_suframa: ['', Validators.maxLength(20)],
      
      // Endereço
      endereco: ['', Validators.maxLength(255)],
      endereco_numero: ['', Validators.maxLength(10)],
      bairro: ['', Validators.maxLength(100)],
      complemento: ['', Validators.maxLength(100)],
      cidade: ['', Validators.maxLength(100)],
      estado: ['', Validators.maxLength(2)],
      cep: ['', Validators.maxLength(10)],
      codigo_pais: ['1058'], // Brasil por padrão
      
      // Contato
      telefone1_ddd: ['', Validators.maxLength(3)],
      telefone1_numero: ['', Validators.maxLength(15)],
      telefone2_ddd: ['', Validators.maxLength(3)],
      telefone2_numero: ['', Validators.maxLength(15)],
      fax_ddd: ['', Validators.maxLength(3)],
      fax_numero: ['', Validators.maxLength(15)],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      homepage: ['', Validators.maxLength(255)],
      
      // Informações fiscais
      optante_simples_nacional: ['N'],
      data_abertura: [''],
      cnae: ['', Validators.maxLength(10)],
      tipo_atividade: ['0'],
      codigo_regime_tributario: ['1'],
      
      // Informações bancárias
      codigo_banco: ['', Validators.maxLength(10)],
      agencia: ['', Validators.maxLength(10)],
      conta_corrente: ['', Validators.maxLength(20)],
      doc_titular: ['', Validators.maxLength(18)],
      nome_titular: ['', Validators.maxLength(100)],
      
      // Observações
      observacoes: [''],
      
      // Status
      inativo: ['N'],
      bloqueado: ['N']
    });
  }

  loadEmpresa(): void {
    if (!this.empresaId) return;

    this.loading = true;
    this.empresasService.getEmpresa(this.empresaId).subscribe({
      next: (empresa: Empresa) => {
        this.empresaForm.patchValue(empresa);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar empresa: ' + (error.error?.detail || error.message);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.empresaForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const empresaData = this.empresaForm.value;

    const operation = this.isEditing
      ? this.empresasService.updateEmpresa(this.empresaId!, empresaData)
      : this.empresasService.createEmpresa(empresaData);

    operation.subscribe({
      next: () => {
        this.success = this.isEditing ? 'Empresa atualizada com sucesso!' : 'Empresa criada com sucesso!';
        this.loading = false;
        
        setTimeout(() => {
          this.router.navigate(['/configuracoes/cadastros/empresas']);
        }, 2000);
      },
      error: (error) => {
        this.error = 'Erro ao salvar empresa: ' + (error.error?.detail || error.message);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/configuracoes/cadastros/empresas']);
  }

  markFormGroupTouched(): void {
    Object.keys(this.empresaForm.controls).forEach(key => {
      const control = this.empresaForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.empresaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.empresaForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Campo obrigatório';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  // Formatação de campos
  formatCnpj(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      this.empresaForm.patchValue({ cnpj: value });
    }
  }

  formatCep(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      value = value.replace(/^(\d{5})(\d{3})/, '$1-$2');
      this.empresaForm.patchValue({ cep: value });
    }
  }

  formatTelefone(field: string, event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      if (value.length <= 10) {
        value = value.replace(/^(\d{2})(\d{4})(\d{4})/, '$1 $2-$3');
      } else {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '$1 $2-$3');
      }
      this.empresaForm.patchValue({ [field]: value });
    }
  }
}
