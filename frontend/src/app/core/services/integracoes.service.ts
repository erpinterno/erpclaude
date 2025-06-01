import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Integracao {
  id?: number;
  nome: string;
  tipo: string;
  descricao?: string;
  base_url?: string;
  app_key?: string;
  app_secret?: string;
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
  descricao?: string;
  base_url?: string;
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

  configurarOmie(app_key: string, app_secret: string): Observable<IntegracaoPublic> {
    const params = new HttpParams()
      .set('app_key', app_key)
      .set('app_secret', app_secret);

    return this.http.post<IntegracaoPublic>(`${this.apiUrl}/omie/configurar`, null, { params });
  }

  sincronizarDados(request: SincronizacaoRequest): Observable<SincronizacaoResponse> {
    return this.http.post<SincronizacaoResponse>(`${this.apiUrl}/sincronizar`, request);
  }

  getTiposDisponiveis(): Observable<{ tipos: TipoIntegracao[] }> {
    return this.http.get<{ tipos: TipoIntegracao[] }>(`${this.apiUrl}/tipos/disponiveis`);
  }

  getTemplateOmie(): Observable<any> {
    return this.http.get(`${this.apiUrl}/templates/omie`);
  }
}
