// src/app/core/services/categorias.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Categoria {
  id?: number;
  codigo: string;
  nome: string;
  descricao?: string;
  tipo: 'RECEITA' | 'DESPESA';
  categoria_pai_id?: number;
  categoria_pai?: Categoria;
  subcategorias?: Categoria[];
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriasResponse {
  items: Categoria[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoriasSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: 'RECEITA' | 'DESPESA';
  ativo?: boolean;
  categoria_pai_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private readonly apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  getCategorias(params: CategoriasSearchParams = {}): Promise<CategoriasResponse> {
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
    if (params.tipo) {
      httpParams = httpParams.set('tipo', params.tipo);
    }
    if (params.ativo !== undefined) {
      httpParams = httpParams.set('ativo', params.ativo.toString());
    }
    if (params.categoria_pai_id) {
      httpParams = httpParams.set('categoria_pai_id', params.categoria_pai_id.toString());
    }

    return this.http.get<CategoriasResponse>(this.apiUrl, { params: httpParams }).toPromise() as Promise<CategoriasResponse>;
  }

  getCategoria(id: number): Promise<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`).toPromise() as Promise<Categoria>;
  }

  createCategoria(categoria: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>): Promise<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria).toPromise() as Promise<Categoria>;
  }

  updateCategoria(id: number, categoria: Partial<Categoria>): Promise<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria).toPromise() as Promise<Categoria>;
  }

  deleteCategoria(id: number): Promise<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).toPromise() as Promise<void>;
  }

  // Método para validar se código da categoria já existe
  validateCodigo(codigo: string, excludeId?: number): Promise<{ exists: boolean }> {
    let httpParams = new HttpParams().set('codigo', codigo);
    if (excludeId) {
      httpParams = httpParams.set('exclude_id', excludeId.toString());
    }
    
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/validate-codigo`, { params: httpParams }).toPromise() as Promise<{ exists: boolean }>;
  }

  // Método para buscar categorias ativas (usado em dropdowns)
  getCategoriasAtivas(tipo?: 'RECEITA' | 'DESPESA'): Promise<Categoria[]> {
    let httpParams = new HttpParams()
      .set('ativo', 'true')
      .set('limit', '1000');
    
    if (tipo) {
      httpParams = httpParams.set('tipo', tipo);
    }
    
    return this.http.get<CategoriasResponse>(this.apiUrl, { params: httpParams })
      .toPromise()
      .then(response => response?.items || []) as Promise<Categoria[]>;
  }

  // Método para buscar categorias pai (sem categoria_pai_id)
  getCategoriasPai(tipo?: 'RECEITA' | 'DESPESA'): Promise<Categoria[]> {
    let httpParams = new HttpParams()
      .set('ativo', 'true')
      .set('apenas_pais', 'true')
      .set('limit', '1000');
    
    if (tipo) {
      httpParams = httpParams.set('tipo', tipo);
    }
    
    return this.http.get<CategoriasResponse>(this.apiUrl, { params: httpParams })
      .toPromise()
      .then(response => response?.items || []) as Promise<Categoria[]>;
  }

  // Método para buscar categoria por código
  getCategoriaPorCodigo(codigo: string): Promise<Categoria | null> {
    const httpParams = new HttpParams().set('codigo', codigo);
    
    return this.http.get<Categoria>(`${this.apiUrl}/por-codigo`, { params: httpParams })
      .toPromise()
      .catch(() => null) as Promise<Categoria | null>;
  }

  // Método para obter árvore hierárquica de categorias
  getArvoreCategorias(tipo?: 'RECEITA' | 'DESPESA'): Promise<Categoria[]> {
    let httpParams = new HttpParams()
      .set('arvore', 'true')
      .set('ativo', 'true');
    
    if (tipo) {
      httpParams = httpParams.set('tipo', tipo);
    }
    
    return this.http.get<Categoria[]>(`${this.apiUrl}/arvore`, { params: httpParams }).toPromise() as Promise<Categoria[]>;
  }
}