import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Empresa {
  id?: number;
  codigo_cliente_omie?: number;
  codigo_cliente_integracao?: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  inscricao_suframa?: string;
  
  // Endereço
  endereco?: string;
  endereco_numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  codigo_pais?: string;
  
  // Contato
  telefone1_ddd?: string;
  telefone1_numero?: string;
  telefone2_ddd?: string;
  telefone2_numero?: string;
  fax_ddd?: string;
  fax_numero?: string;
  email?: string;
  homepage?: string;
  
  // Informações fiscais
  optante_simples_nacional?: string;
  data_abertura?: string;
  cnae?: string;
  tipo_atividade?: string;
  codigo_regime_tributario?: string;
  
  // Informações bancárias
  codigo_banco?: string;
  agencia?: string;
  conta_corrente?: string;
  doc_titular?: string;
  nome_titular?: string;
  
  // Observações
  observacoes?: string;
  
  // Status
  inativo?: string;
  bloqueado?: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface EmpresaResponse {
  items: Empresa[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresasService {
  private apiUrl = `${environment.apiUrl}/empresas`;

  constructor(private http: HttpClient) {}

  getEmpresas(page: number = 1, limit: number = 10, search?: string, ativo_apenas: boolean = false): Observable<EmpresaResponse> {
    let params = new HttpParams()
      .set('skip', ((page - 1) * limit).toString())
      .set('limit', limit.toString())
      .set('ativo_apenas', ativo_apenas.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<EmpresaResponse>(this.apiUrl, { params });
  }

  getEmpresa(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/${id}`);
  }

  createEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(this.apiUrl, empresa);
  }

  updateEmpresa(id: number, empresa: Partial<Empresa>): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}/${id}`, empresa);
  }

  deleteEmpresa(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  importFromOmie(empresasData: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/import-omie`, empresasData);
  }
}
