import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Integracao {
  id?: number;
  nome: string;
  tipo: string;
  tipo_requisicao: 'GET' | 'POST' | 'PUT' | 'DELETE';
  tipo_importacao: 'TOTAL' | 'INCREMENTAL';
  descricao?: string;
  estrutura_dados?: any;
  formato_exemplo?: string;
  intervalo_execucao?: number;
  cron_expression?: string;
  tabela_destino?: string;
  tela_origem?: string;
  consulta_sql?: string;
  base_url?: string;
  metodo_integracao?: string;
  app_key?: string;
  app_secret?: string;
  link_integracao?: string;
  link_documentacao?: string;
  token?: string;
  configuracoes_extras?: any;
  ativo: boolean;
  testado?: boolean;
  ultima_sincronizacao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IntegracaoPublic {
  id: number;
  nome: string;
  tipo: string;
  tipo_requisicao: 'GET' | 'POST' | 'PUT' | 'DELETE';
  tipo_importacao: 'TOTAL' | 'INCREMENTAL';
  descricao?: string;
  base_url?: string;
  metodo_integracao?: string;
  link_integracao?: string;
  link_documentacao?: string;
  tabela_destino?: string;
  tela_origem?: string;
  intervalo_execucao?: number;
  cron_expression?: string;
  ativo: boolean;
  testado: boolean;
  ultima_sincronizacao?: string;
  created_at: string;
  updated_at?: string;
}

export interface IntegracaoResponse {
  items: IntegracaoPublic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IntegracaoTeste {
  sucesso: boolean;
  mensagem: string;
  detalhes?: any;
}

export interface IntegracaoLog {
  id: number;
  integracao_id: number;
  data_execucao: string;
  status: 'SUCCESS' | 'ERROR' | 'WARNING' | 'RUNNING';
  mensagem?: string;
  detalhes?: any;
  tempo_execucao?: number;
  registros_processados: number;
  registros_importados: number;
  registros_atualizados: number;
  registros_erro: number;
  created_at: string;
}

export interface LogsResponse {
  items: IntegracaoLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SincronizacaoRequest {
  integracao_id: number;
  tipo_dados: string;
  parametros?: any;
}

export interface SincronizacaoResponse {
  sucesso: boolean;
  total_processados: number;
  total_importados: number;
  total_atualizadas: number;
  total_erros: number;
  mensagens: string[];
  detalhes?: any;
}

export interface TipoIntegracao {
  codigo: string;
  nome: string;
  descricao: string;
}

export interface TabelaDisponivel {
  nome: string;
  descricao: string;
  campos: string[];
}

export interface ValidarSQLRequest {
  consulta_sql: string;
  tabela_destino: string;
}

export interface ValidarSQLResponse {
  valida: boolean;
  mensagem: string;
  campos_retornados?: string[];
  erro?: string;
}

export interface ImportarDocumentacaoRequest {
  integracao_id: number;
  arquivo_conteudo: string;
  nome_arquivo: string;
  tipo_arquivo: string;
}

export interface ImportarDocumentacaoResponse {
  sucesso: boolean;
  mensagem: string;
  campos_preenchidos: string[];
  detalhes?: any;
}

export interface ExecutarIntegracaoRequest {
  integracao_id: number;
  parametros?: any;
  executar_agora: boolean;
}

export interface ExecutarIntegracaoResponse {
  sucesso: boolean;
  mensagem: string;
  log_id?: number;
  detalhes?: any;
}

@Injectable({
  providedIn: 'root'
})
export class IntegracoesService {
  private apiUrl = `${environment.apiUrl}/integracoes`;

  constructor(private http: HttpClient) {}

  getIntegracoes(page: number = 1, limit: number = 10, search?: string, tipo?: string, ativo_apenas: boolean = false): Observable<IntegracaoResponse> {
    let params = new HttpParams()
      .set('skip', ((page - 1) * limit).toString())
      .set('limit', limit.toString())
      .set('ativo_apenas', ativo_apenas.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (tipo) {
      params = params.set('tipo', tipo);
    }

    return this.http.get<IntegracaoResponse>(this.apiUrl, { params });
  }

  getIntegracao(id: number): Observable<Integracao> {
    return this.http.get<Integracao>(`${this.apiUrl}/${id}`);
  }

  createIntegracao(integracao: Integracao): Observable<IntegracaoPublic> {
    return this.http.post<IntegracaoPublic>(this.apiUrl, integracao);
  }

  updateIntegracao(id: number, integracao: Partial<Integracao>): Observable<IntegracaoPublic> {
    return this.http.put<IntegracaoPublic>(`${this.apiUrl}/${id}`, integracao);
  }

  deleteIntegracao(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  testarIntegracao(id: number): Observable<IntegracaoTeste> {
    return this.http.post<IntegracaoTeste>(`${this.apiUrl}/${id}/testar`, {});
  }

  executarIntegracao(request: ExecutarIntegracaoRequest): Observable<ExecutarIntegracaoResponse> {
    return this.http.post<ExecutarIntegracaoResponse>(`${this.apiUrl}/executar`, request);
  }

  getLogs(integracaoId?: number, status?: string, dataInicio?: string, dataFim?: string, page: number = 1, limit: number = 50): Observable<LogsResponse> {
    let params = new HttpParams()
      .set('skip', ((page - 1) * limit).toString())
      .set('limit', limit.toString());

    if (integracaoId && integracaoId > 0) {
      params = params.set('integracao_id', integracaoId.toString());
    }

    if (status && status.trim() !== '') {
      params = params.set('status', status);
    }

    if (dataInicio && dataInicio.trim() !== '') {
      params = params.set('data_inicio', dataInicio);
    }

    if (dataFim && dataFim.trim() !== '') {
      params = params.set('data_fim', dataFim);
    }

    return this.http.get<LogsResponse>(`${this.apiUrl}/logs`, { params });
  }

  importarDocumentacao(request: ImportarDocumentacaoRequest): Observable<ImportarDocumentacaoResponse> {
    return this.http.post<ImportarDocumentacaoResponse>(`${this.apiUrl}/importar-documentacao`, request);
  }

  getTabelasDisponiveis(): Observable<{ tabelas: TabelaDisponivel[] }> {
    return this.http.get<{ tabelas: TabelaDisponivel[] }>(`${this.apiUrl}/tabelas-disponiveis`);
  }

  validarSQL(request: ValidarSQLRequest): Observable<ValidarSQLResponse> {
    return this.http.post<ValidarSQLResponse>(`${this.apiUrl}/validar-sql`, request);
  }

  configurarOmie(app_key: string, app_secret: string): Observable<IntegracaoPublic> {
    const params = new HttpParams()
      .set('app_key', app_key)
      .set('app_secret', app_secret);

    return this.http.post<IntegracaoPublic>(`${this.apiUrl}/omie/configurar`, null, { params });
  }

  sincronizarDados(request: SincronizacaoRequest): Observable<SincronizacaoResponse> {
    return this.http.post<SincronizacaoResponse>(`${this.apiUrl}/sincronizar`, request);
  }

  getTiposDisponiveis(): Observable<{ 
    tipos: TipoIntegracao[], 
    tipos_requisicao: TipoIntegracao[], 
    tipos_importacao: TipoIntegracao[] 
  }> {
    return this.http.get<{ 
      tipos: TipoIntegracao[], 
      tipos_requisicao: TipoIntegracao[], 
      tipos_importacao: TipoIntegracao[] 
    }>(`${this.apiUrl}/tipos/disponiveis`);
  }

  getTemplateOmie(): Observable<any> {
    return this.http.get(`${this.apiUrl}/templates/omie`);
  }
}
