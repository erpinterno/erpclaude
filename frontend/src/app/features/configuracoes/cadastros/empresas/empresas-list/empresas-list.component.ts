import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmpresasService, Empresa, EmpresaResponse } from '../../../../../core/services/empresas.service';

@Component({
  selector: 'app-empresas-list',
  templateUrl: './empresas-list.component.html',
  styleUrls: ['./empresas-list.component.scss']
})
export class EmpresasListComponent implements OnInit {
  empresas: Empresa[] = [];
  loading = false;
  error: string | null = null;
  
  // Paginação
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Filtros
  searchTerm = '';
  ativoApenas = false;

  constructor(
    private empresasService: EmpresasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmpresas();
  }

  loadEmpresas(): void {
    this.loading = true;
    this.error = null;

    this.empresasService.getEmpresas(
      this.currentPage,
      this.pageSize,
      this.searchTerm || undefined,
      this.ativoApenas
    ).subscribe({
      next: (response: EmpresaResponse) => {
        this.empresas = response.items;
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar empresas: ' + (error.error?.detail || error.message);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadEmpresas();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadEmpresas();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadEmpresas();
  }

  editEmpresa(empresa: Empresa): void {
    this.router.navigate(['/configuracoes/cadastros/empresas/editar', empresa.id]);
  }

  deleteEmpresa(empresa: Empresa): void {
    if (confirm(`Tem certeza que deseja excluir a empresa "${empresa.razao_social}"?`)) {
      this.empresasService.deleteEmpresa(empresa.id!).subscribe({
        next: () => {
          this.loadEmpresas();
        },
        error: (error) => {
          this.error = 'Erro ao excluir empresa: ' + (error.error?.detail || error.message);
        }
      });
    }
  }

  newEmpresa(): void {
    this.router.navigate(['/configuracoes/cadastros/empresas/novo']);
  }

  getStatusText(empresa: Empresa): string {
    if (empresa.inativo === 'S') return 'Inativo';
    if (empresa.bloqueado === 'S') return 'Bloqueado';
    return 'Ativo';
  }

  getStatusClass(empresa: Empresa): string {
    if (empresa.inativo === 'S') return 'status-inactive';
    if (empresa.bloqueado === 'S') return 'status-blocked';
    return 'status-active';
  }

  formatCnpj(cnpj: string | undefined): string {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  formatTelefone(ddd: string | undefined, numero: string | undefined): string {
    if (!ddd || !numero) return '';
    return `(${ddd}) ${numero}`;
  }
}
