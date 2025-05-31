// src/app/features/configuracoes/cadastros/bancos/bancos-list/bancos-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BancosService } from '../../../../../core/services/bancos.service';

@Component({
  selector: 'app-bancos-list',
  templateUrl: './bancos-list.component.html',
  styleUrls: ['./bancos-list.component.scss']
})
export class BancosListComponent implements OnInit {
  bancos: any[] = [];
  loading = false;
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  constructor(
    private bancosService: BancosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBancos();
  }

  async loadBancos() {
    this.loading = true;
    try {
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        search: this.searchTerm
      };
      
      const response = await this.bancosService.getBancos(params);
      this.bancos = response.items;
      this.totalItems = response.total;
    } catch (error) {
      console.error('Erro ao carregar bancos:', error);
    } finally {
      this.loading = false;
    }
  }

  onSearch() {
    this.currentPage = 1;
    this.loadBancos();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadBancos();
  }

  editBanco(id: number) {
    this.router.navigate(['/configuracoes/cadastros/bancos/editar', id]);
  }

  async deleteBanco(id: number, nome: string) {
    if (confirm(`Tem certeza que deseja excluir o banco "${nome}"?`)) {
      try {
        await this.bancosService.deleteBanco(id);
        this.loadBancos();
      } catch (error) {
        console.error('Erro ao excluir banco:', error);
        alert('Erro ao excluir banco. Tente novamente.');
      }
    }
  }

  newBanco() {
    this.router.navigate(['/configuracoes/cadastros/bancos/novo']);
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
}