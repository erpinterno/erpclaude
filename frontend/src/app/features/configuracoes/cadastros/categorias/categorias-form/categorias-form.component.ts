// src/app/features/configuracoes/cadastros/categorias/categorias-form/categorias-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoriasService, Categoria } from '../../../../../core/services/categorias.service';

@Component({
  selector: 'app-categorias-form',
  templateUrl: './categorias-form.component.html',
  styleUrls: ['./categorias-form.component.scss']
})
export class CategoriasFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  saving = false;
  isEditMode = false;
  categoriaId: number | null = null;
  categoriasPai: Categoria[] = [];
  loadingCategoriasPai = false;
  
  // Opções para tipo
  tipoOptions = [
    { value: 'RECEITA', label: 'Receita', icon: 'fa-arrow-up', class: 'text-success' },
    { value: 'DESPESA', label: 'Despesa', icon: 'fa-arrow-down', class: 'text-danger' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private categoriasService: CategoriasService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.createForm();
  }

  ngOnInit() {
    this.categoriaId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.categoriaId;
    
    this.loadCategoriasPai();
    
    if (this.isEditMode) {
      this.loadCategoria();
    }

    // Monitorar mudanças no tipo para atualizar categorias pai
    this.form.get('tipo')?.valueChanges.subscribe((tipo: string) => {
      this.loadCategoriasPai(tipo);
      // Limpar categoria pai selecionada quando mudar o tipo
      this.form.get('categoria_pai_id')?.setValue(null);
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      codigo: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9_-]+$/)
      ]],
      nome: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      descricao: ['', [
        Validators.maxLength(500)
      ]],
      tipo: ['', Validators.required],
      categoria_pai_id: [null],
      ativo: [true, Validators.required]
    });
  }

  async loadCategoriasPai(tipo?: string) {
    this.loadingCategoriasPai = true;
    try {
      const tipoFilter = tipo || this.form.get('tipo')?.value;
      this.categoriasPai = await this.categoriasService.getCategoriasPai(tipoFilter);
      
      // Se estiver editando, filtrar a própria categoria da lista de pais
      if (this.isEditMode && this.categoriaId) {
        this.categoriasPai = this.categoriasPai.filter(cat => cat.id !== this.categoriaId);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias pai:', error);
      this.categoriasPai = [];
    } finally {
      this.loadingCategoriasPai = false;
    }
  }

  async loadCategoria() {
    if (!this.categoriaId) return;
    
    this.loading = true;
    try {
      const categoria = await this.categoriasService.getCategoria(this.categoriaId);
      this.form.patchValue({
        codigo: categoria.codigo,
        nome: categoria.nome,
        descricao: categoria.descricao,
        tipo: categoria.tipo,
        categoria_pai_id: categoria.categoria_pai_id,
        ativo: categoria.ativo
      });
    } catch (error) {
      console.error('Erro ao carregar categoria:', error);
      alert('Erro ao carregar dados da categoria.');
      this.router.navigate(['/configuracoes/cadastros/categorias']);
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    // Validar código único
    const codigo = this.form.get('codigo')?.value;
    if (codigo) {
      try {
        const validation = await this.categoriasService.validateCodigo(codigo, this.categoriaId || undefined);
        if (validation.exists) {
          this.form.get('codigo')?.setErrors({ codigoExists: true });
          return;
        }
      } catch (error) {
        console.error('Erro ao validar código:', error);
      }
    }

    this.saving = true;
    try {
      const formData = { ...this.form.value };
      
      // Converter categoria_pai_id para null se for uma string vazia
      if (!formData.categoria_pai_id) {
        formData.categoria_pai_id = null;
      }
      
      if (this.isEditMode && this.categoriaId) {
        await this.categoriasService.updateCategoria(this.categoriaId, formData);
      } else {
        await this.categoriasService.createCategoria(formData);
      }
      
      this.router.navigate(['/configuracoes/cadastros/categorias']);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria. Tente novamente.');
    } finally {
      this.saving = false;
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  onCancel() {
    if (this.form.dirty) {
      if (confirm('Há alterações não salvas. Deseja realmente cancelar?')) {
        this.router.navigate(['/configuracoes/cadastros/categorias']);
      }
    } else {
      this.router.navigate(['/configuracoes/cadastros/categorias']);
    }
  }

  // Getters para facilitar acesso aos controles no template
  get codigo() { return this.form.get('codigo'); }
  get nome() { return this.form.get('nome'); }
  get descricao() { return this.form.get('descricao'); }
  get tipo() { return this.form.get('tipo'); }
  get categoria_pai_id() { return this.form.get('categoria_pai_id'); }
  get ativo() { return this.form.get('ativo'); }

  // Método para exibir erros de validação
  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo é obrigatório';
      }
      if (field.errors['minlength']) {
        return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'codigo') {
          return 'Use apenas letras, números, traços e sublinhados';
        }
      }
      if (field.errors['codigoExists']) {
        return 'Este código já está sendo usado por outra categoria';
      }
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  // Método para obter informações do tipo selecionado
  getTipoInfo(): any {
    const tipoValue = this.form.get('tipo')?.value;
    return this.tipoOptions.find(option => option.value === tipoValue);
  }

  // Método para obter nome da categoria pai
  getCategoriaPaiNome(): string {
    const categoriaPaiId = this.form.get('categoria_pai_id')?.value;
    if (!categoriaPaiId || !this.categoriasPai) {
      return '';
    }
    const categoriaPai = this.categoriasPai.find(c => c.id === categoriaPaiId);
    return categoriaPai?.nome || '';
  }
}
