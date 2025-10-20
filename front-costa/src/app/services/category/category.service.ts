import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interfaces para el tipado
export interface Category {
  id?: number;
  name: string;
  description: string;
  status: number;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data?: Category | Category[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  constructor() { }

  /**
   * Obtiene los headers con el token de autorización
   * @returns Headers con Content-Type y Authorization
   */
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('authToken');
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Guardar una categoría (crear o actualizar según tenga ID o no)
   * @param category - Objeto con los datos de la categoría
   * @returns Observable con la respuesta del servidor
   */
  saveCategory(category: Category): Observable<CategoryResponse> {
    const url = `${this.apiUrl}inventory/category/save`;
    const headers = this.getHeaders();

    // Log para debug - quitar en producción
    console.log('URL de guardado:', url);
    console.log('Datos enviados:', category);

    return this.http.post<CategoryResponse>(url, category, { headers });
  }

  /**
   * Obtener todas las categorías
   * @returns Observable con la lista de categorías
   */
  getCategories(): Observable<CategoryResponse> {
    const url = `${this.apiUrl}inventory/category/list`;
    const headers = this.getHeaders();

    console.log('URL de obtención:', url);

    return this.http.get<CategoryResponse>(url, { headers });
  }

  /**
   * Deshabilitar una categoría (basado en tu endpoint)
   * @param id - ID de la categoría a deshabilitar
   * @returns Observable con la respuesta del servidor
   */
  disableCategory(id: number): Observable<CategoryResponse> {
    const url = `${this.apiUrl}inventory/category/disable?id=${id}`;
    const headers = this.getHeaders();

    console.log('URL de deshabilitación:', url);

    return this.http.post<CategoryResponse>(url, null, { headers });
  }
}