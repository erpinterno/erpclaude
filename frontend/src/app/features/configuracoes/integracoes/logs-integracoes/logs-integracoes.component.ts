import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IntegracoesService, IntegracaoLog, IntegracaoPublic } from '../../../../core/services/integracoes.service';

@Component({
  selector: 'app-logs-integracoes',
  templateUrl: './logs-integracoes.component.html',
  styleUrls: ['./logs-integracoes.component.scss']
})
export class LogsIntegracoesComponent implements OnInit {
  logs: IntegracaoLog[] = [];
  integracoes: IntegracaoPublic[] = [];
  loading = false;
  error: string | null = null;
  
  // Paginação
  currentPage = 1;
  totalPages = 0;
  totalItems = 0;
  itemsPerPage = 50;
  
  // Filtros
  filtrosForm: FormGroup;
  
  // Status disponíveis
  statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'SUCCESS', label: 'Sucesso', class: 'badge-success' },
    { value: 'ERROR', label: 'Erro', class: 'badge-danger' },
    { value: 'WARNING', label: 'Aviso', class: 'badge-warning' },
    { value: 'RUNNING', label: 'Executando', class: 'badge-info' }
  ];

  constructor(
    private integracoesService: IntegracoesService,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.createFiltrosForm();
  }

  ngOnInit(): void {
    this.loadIntegracoes();
    this.loadLogs();
  }

  createFiltrosForm(): FormGroup {
    return this.fb.group({
      integracao_id: [''],
      status: [''],
      data_inicio: [''],
      data_fim: ['']
    });
  }

  loadIntegracoes(): void {
    this.integracoesService.getIntegracoes(1, 100).subscribe({
      next: (response: any) => {
        this.integracoes = response.items;
      },
      error: (error: any) => {
        console.error('Erro ao carregar integrações:', error);
      }
    });
  }

  loadLogs(): void {
    this.loading = true;
    this.error = null;
    
    const filtros = this.filtrosForm.value;
    
    // Converter valores vazios para undefined
    const integracaoId = filtros.integracao_id && filtros.integracao_id !== '' ? Number(filtros.integracao_id) : undefined;
    const status = filtros.status && filtros.status !== '' ? filtros.status : undefined;
    const dataInicio = filtros.data_inicio && filtros.data_inicio !== '' ? filtros.data_inicio : undefined;
    const dataFim = filtros.data_fim && filtros.data_fim !== '' ? filtros.data_fim : undefined;
    
    this.integracoesService.getLogs(
      integracaoId,
      status,
      dataInicio,
      dataFim,
      this.currentPage,
      this.itemsPerPage
    ).subscribe({
      next: (response: any) => {
        this.logs = response.items || [];
        this.totalPages = response.totalPages || 0;
        this.totalItems = response.total || 0;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Erro ao carregar logs: ' + (error.error?.detail || error.message || 'Erro desconhecido');
        this.logs = [];
        this.totalPages = 0;
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  onFiltroChange(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadLogs();
  }

  limparFiltros(): void {
    this.filtrosForm.reset();
    this.currentPage = 1;
    this.loadLogs();
  }

  getStatusClass(status: string): string {
    const statusOption = this.statusOptions.find(opt => opt.value === status);
    return statusOption ? (statusOption.class || 'badge-secondary') : 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    const statusOption = this.statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.label : status;
  }

  getIntegracaoNome(integracaoId: number): string {
    const integracao = this.integracoes.find(i => i.id === integracaoId);
    return integracao ? integracao.nome : `ID: ${integracaoId}`;
  }

  formatDuration(seconds: number | null | undefined): string {
    if (!seconds) return '-';
    
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('pt-BR');
  }

  exportarLogs(): void {
    // Implementar exportação de logs para CSV/Excel
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `logs_integracoes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private generateCSV(): string {
    const headers = [
      'Data/Hora',
      'Integração',
      'Status',
      'Mensagem',
      'Tempo Execução',
      'Processados',
      'Importados',
      'Atualizados',
      'Erros'
    ];
    
    const rows = this.logs.map(log => [
      this.formatDate(log.data_execucao),
      this.getIntegracaoNome(log.integracao_id),
      this.getStatusLabel(log.status),
      log.mensagem || '',
      this.formatDuration(log.tempo_execucao),
      log.registros_processados.toString(),
      log.registros_importados.toString(),
      log.registros_atualizados.toString(),
      log.registros_erro.toString()
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return csvContent;
  }

  executarIntegracao(integracaoId: number): void {
    this.loading = true;
    
    const request = {
      integracao_id: integracaoId,
      executar_agora: true
    };
    
    this.integracoesService.executarIntegracao(request).subscribe({
      next: (response: any) => {
        if (response.sucesso) {
          this.loadLogs(); // Recarregar logs para mostrar a nova execução
        } else {
          this.error = response.mensagem;
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Erro ao executar integração: ' + (error.error?.detail || error.message);
        this.loading = false;
      }
    });
  }

  verDetalhes(log: IntegracaoLog): void {
    // Implementar modal ou navegação para detalhes do log
    console.log('Detalhes do log:', log);
  }

  getPages(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getStatusCount(status: string): number {
    return this.logs.filter(log => log.status === status).length;
  }

  getTotalProcessados(): number {
    return this.logs.reduce((total, log) => total + log.registros_processados, 0);
  }

  getTotalImportados(): number {
    return this.logs.reduce((total, log) => total + log.registros_importados, 0);
  }

  getTotalAtualizados(): number {
    return this.logs.reduce((total, log) => total + log.registros_atualizados, 0);
  }

  getTotalErros(): number {
    return this.logs.reduce((total, log) => total + log.registros_erro, 0);
  }
}
