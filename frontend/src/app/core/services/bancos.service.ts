// src/app/core/services/bancos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Banco {
  id?: number;
  codigo: string;
  nome: string;
  nome_fantasia?: string;
  site?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BancosResponse {
  items: Banco[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BancosSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BancosService {
  private readonly apiUrl = `${environment.apiUrl}/bancos`;

  constructor(private http: HttpClient) {}

  getBancos(params: BancosSearchParams = {}): Promise<BancosResponse> {
    let httpParams = new HttpParams();
    
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.ativo !== undefined) {
      httpParams = httpParams.set('ativo', params.ativo.toString());
    }

    return this.http.get<BancosResponse>(this.apiUrl, { params: httpParams }).toPromise() as Promise<BancosResponse>;
  }

  getBanco(id: number): Promise<Banco> {
    return this.http.get<Banco>(`${this.apiUrl}/${id}`).toPromise() as Promise<Banco>;
  }

  createBanco(banco: Omit<Banco, 'id' | 'created_at' | 'updated_at'>): Promise<Banco> {
    return this.http.post<Banco>(this.apiUrl, banco).toPromise() as Promise<Banco>;
  }

  updateBanco(id: number, banco: Partial<Banco>): Promise<Banco> {
    return this.http.put<Banco>(`${this.apiUrl}/${id}`, banco).toPromise() as Promise<Banco>;
  }

  deleteBanco(id: number): Promise<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).toPromise() as Promise<void>;
  }

  // Método para validar se código do banco já existe
  validateCodigo(codigo: string, excludeId?: number): Promise<{ exists: boolean }> {
    let httpParams = new HttpParams().set('codigo', codigo);
    if (excludeId) {
      httpParams = httpParams.set('exclude_id', excludeId.toString());
    }
    
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/validate-codigo`, { params: httpParams }).toPromise() as Promise<{ exists: boolean }>;
  }

  // Método para buscar bancos ativos (usado em dropdowns)
  getBancosAtivos(): Promise<Banco[]> {
    const httpParams = new HttpParams()
      .set('ativo', 'true')
      .set('limit', '1000');
    
    return this.http.get<BancosResponse>(this.apiUrl, { params: httpParams })
      .toPromise()
      .then(response => response?.items || []) as Promise<Banco[]>;
  }

  // Método para buscar banco por código
  getBancoPorCodigo(codigo: string): Promise<Banco | null> {
    const httpParams = new HttpParams().set('codigo', codigo);
    
    return this.http.get<Banco>(`${this.apiUrl}/por-codigo`, { params: httpParams })
      .toPromise()
      .catch(() => null) as Promise<Banco | null>;
  }
}