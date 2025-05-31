// src/app/features/configuracoes/cadastros/bancos/bancos-form/bancos-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BancosService, Banco } from '../../../../../core/services/bancos.service';

@Component({
  selector: 'app-bancos-form',
  templateUrl: './bancos-form.component.html',
  styleUrls: ['./bancos-form.component.scss']
})
export class BancosFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  saving = false;
  isEditMode = false;
  bancoId: number | null = null;
  
  constructor(
    private fb: FormBuilder,
    private bancosService: BancosService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.createForm();
  }

  ngOnInit() {
    this.bancoId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.bancoId;
    
    if (this.isEditMode) {
      this.loadBanco();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      codigo: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(3),
        Validators.pattern(/^\d{3}$/)
      ]],
      nome: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      nome_fantasia: ['', [
        Validators.maxLength(100)
      ]],
      site: ['', [
        Validators.pattern(/^https?:\/\/.+\..+/)
      ]],
      ativo: [true, Validators.required]
    });
  }

  async loadBanco() {
    if (!this.bancoId) return;
    
    this.loading = true;
    try {
      const banco = await this.bancosService.getBanco(this.bancoId);
      this.form.patchValue(banco);
    } catch (error) {
      console.error('Erro ao carregar banco:', error);
      alert('Erro ao carregar dados do banco.');
      this.router.navigate(['/configuracoes/cadastros/bancos']);
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
        const validation = await this.bancosService.validateCodigo(codigo, this.bancoId || undefined);
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
      const formData = this.form.value;
      
      if (this.isEditMode && this.bancoId) {
        await this.bancosService.updateBanco(this.bancoId, formData);
      } else {
        await this.bancosService.createBanco(formData);
      }
      
      this.router.navigate(['/configuracoes/cadastros/bancos']);
    } catch (error) {
      console.error('Erro ao salvar banco:', error);
      alert('Erro ao salvar banco. Tente novamente.');
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
        this.router.navigate(['/configuracoes/cadastros/bancos']);
      }
    } else {
      this.router.navigate(['/configuracoes/cadastros/bancos']);
    }
  }

  // Getters para facilitar acesso aos controles no template
  get codigo() { return this.form.get('codigo'); }
  get nome() { return this.form.get('nome'); }
  get nome_fantasia() { return this.form.get('nome_fantasia'); }
  get site() { return this.form.get('site'); }
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
          return 'O código deve ter exatamente 3 dígitos';
        }
        if (fieldName === 'site') {
          return 'Digite uma URL válida (ex: https://www.banco.com.br)';
        }
      }
      if (field.errors['codigoExists']) {
        return 'Este código já está sendo usado por outro banco';
      }
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.errors && field.touched);
  }
}