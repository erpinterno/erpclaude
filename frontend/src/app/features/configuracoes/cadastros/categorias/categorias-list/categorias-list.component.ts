// src/app/features/configuracoes/cadastros/categorias/categorias-list/categorias-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriasService, Categoria } from '../../../../../core/services/categorias.service';

@Component({
  selector: 'app-categorias-list',
  templateUrl: './categorias-list.component.html',
  styleUrls: ['./categorias-list.component.scss']
})
export class CategoriasListComponent implements OnInit {
  categorias: Categoria[] = [];
  loading = false;
  searchTerm = '';
  tipoFilter = '';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  // Opções para filtros
  tipoOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'RECEITA', label: 'Receita' },
    { value: 'DESPESA', label: 'Despesa' }
  ];

  constructor(
    private categoriasService: CategoriasService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategorias();
  }

  async loadCategorias() {
    this.loading = true;
    try {
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        search: this.searchTerm,
        tipo: this.tipoFilter as 'RECEITA' | 'DESPESA' | undefined
      };
      
      // Remove filtro de tipo se vazio
      if (!this.tipoFilter) {
        delete params.tipo;
      }
      
      const response = await this.categoriasService.getCategorias(params);
      this.categorias = response.items;
      this.totalItems = response.total;
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      this.loading = false;
    }
  }

  onSearch() {
    this.currentPage = 1;
    this.loadCategorias();
  }

  onTipoFilterChange() {
    this.currentPage = 1;
    this.loadCategorias();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadCategorias();
  }

  editCategoria(id: number) {
    this.router.navigate(['/configuracoes/cadastros/categorias/editar', id]);
  }

  async deleteCategoria(id: number, nome: string) {
    if (confirm(`Tem certeza que deseja excluir a categoria "${nome}"?`)) {
      try {
        await this.categoriasService.deleteCategoria(id);
        this.loadCategorias();
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        alert('Erro ao excluir categoria. Tente novamente.');
      }
    }
  }

  newCategoria() {
    this.router.navigate(['/configuracoes/cadastros/categorias/nova']);
  }

  clearFilters() {
    this.searchTerm = '';
    this.tipoFilter = '';
    this.currentPage = 1;
    this.loadCategorias();
  }

  // Método para formatar o tipo
  formatTipo(tipo: string): string {
    switch (tipo) {
      case 'RECEITA':
        return 'Receita';
      case 'DESPESA':
        return 'Despesa';
      default:
        return tipo;
    }
  }

  // Método para obter classe CSS do tipo
  getTipoClass(tipo: string): string {
    switch (tipo) {
      case 'RECEITA':
        return 'tipo-receita';
      case 'DESPESA':
        return 'tipo-despesa';
      default:
        return '';
    }
  }

  // Track by function para performance
  trackByFn(index: number, item: Categoria): number {
    return item.id || index;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get hasFilters(): boolean {
    return !!(this.searchTerm || this.tipoFilter);
  }
}