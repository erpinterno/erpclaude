import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IntegracoesService, IntegracaoPublic, IntegracaoResponse, IntegracaoTeste } from '../../../../core/services/integracoes.service';

@Component({
  selector: 'app-integracoes-list',
  templateUrl: './integracoes-list.component.html',
  styleUrls: ['./integracoes-list.component.scss']
})
export class IntegracoesListComponent implements OnInit {
  integracoes: IntegracaoPublic[] = [];
  loading = false;
  error: string | null = null;
  
  // Paginação
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Filtros
  searchTerm = '';
  tipoFiltro = '';
  ativoApenas = false;

  // Tipos disponíveis
  tipos: any[] = [];

  // Expose Math to template
  Math = Math;

  constructor(
    private integracoesService: IntegracoesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTipos();
    this.loadIntegracoes();
  }

  loadTipos(): void {
    this.integracoesService.getTiposDisponiveis().subscribe({
      next: (response: any) => {
        this.tipos = response.tipos;
      },
      error: (error: any) => {
        console.error('Erro ao carregar tipos:', error);
      }
    });
  }

  loadIntegracoes(): void {
    this.loading = true;
    this.error = null;

    this.integracoesService.getIntegracoes(
      this.currentPage,
      this.pageSize,
      this.searchTerm || undefined,
      this.tipoFiltro || undefined,
      this.ativoApenas
    ).subscribe({
      next: (response: IntegracaoResponse) => {
        this.integracoes = response.items;
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Erro ao carregar integrações: ' + (error.error?.detail || error.message);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadIntegracoes();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadIntegracoes();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadIntegracoes();
  }

  editIntegracao(integracao: IntegracaoPublic): void {
    this.router.navigate(['/configuracoes/integracoes/editar', integracao.id]);
  }

  deleteIntegracao(integracao: IntegracaoPublic): void {
    if (confirm(`Tem certeza que deseja excluir a integração "${integracao.nome}"?`)) {
      this.integracoesService.deleteIntegracao(integracao.id).subscribe({
        next: () => {
          this.loadIntegracoes();
        },
        error: (error: any) => {
          this.error = 'Erro ao excluir integração: ' + (error.error?.detail || error.message);
        }
      });
    }
  }

  newIntegracao(): void {
    this.router.navigate(['/configuracoes/integracoes/novo']);
  }

  testarIntegracao(integracao: IntegracaoPublic): void {
    this.integracoesService.testarIntegracao(integracao.id).subscribe({
      next: (resultado: IntegracaoTeste) => {
        if (resultado.sucesso) {
          alert(`✅ Teste realizado com sucesso!\n\n${resultado.mensagem}`);
        } else {
          alert(`❌ Falha no teste:\n\n${resultado.mensagem}`);
        }
        this.loadIntegracoes(); // Recarregar para atualizar status
      },
      error: (error: any) => {
        alert(`❌ Erro ao testar integração:\n\n${error.error?.detail || error.message}`);
      }
    });
  }

  configurarOmie(): void {
    const appKey = prompt('Digite a APP_KEY do Omie:');
    if (!appKey) return;

    const appSecret = prompt('Digite a APP_SECRET do Omie:');
    if (!appSecret) return;

    this.integracoesService.configurarOmie(appKey, appSecret).subscribe({
      next: () => {
        alert('✅ Integração do Omie configurada com sucesso!');
        this.loadIntegracoes();
      },
      error: (error: any) => {
        alert(`❌ Erro ao configurar Omie:\n\n${error.error?.detail || error.message}`);
      }
    });
  }

  irParaTesteApi(): void {
    this.router.navigate(['/configuracoes/integracoes/teste-api']);
  }

  getStatusText(integracao: IntegracaoPublic): string {
    if (!integracao.ativo) return 'Inativo';
    if (!integracao.testado) return 'Não testado';
    return 'Ativo';
  }

  getStatusClass(integracao: IntegracaoPublic): string {
    if (!integracao.ativo) return 'status-inactive';
    if (!integracao.testado) return 'status-warning';
    return 'status-active';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  }
}
