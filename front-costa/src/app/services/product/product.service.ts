import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interfaces para el tipado
export interface Product {
  id?: number;
  name: string;
  description: string;
  categoryId: number;
  status: number;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data?: Product | Product[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
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
   * Guardar un producto (crear o actualizar según tenga ID o no)
   * @param product - Objeto con los datos del producto
   * @returns Observable con la respuesta del servidor
   */
  saveProduct(product: Product): Observable<ProductResponse> {
    const url = `${this.apiUrl}inventory/product/save`;
    const headers = this.getHeaders();

    // Log para debug - quitar en producción
    console.log('URL de guardado:', url);
    console.log('Datos enviados:', product);

    return this.http.post<ProductResponse>(url, product, { headers });
  }

  /**
   * Obtener todos los productos
   * @returns Observable con la lista de productos
   */
  getProducts(): Observable<ProductResponse> {
    const url = `${this.apiUrl}inventory/product/list`;
    const headers = this.getHeaders();

    console.log('URL de obtención:', url);

    return this.http.get<ProductResponse>(url, { headers });
  }

  /**
   * Deshabilitar un producto
   * @param id - ID del producto a deshabilitar
   * @returns Observable con la respuesta del servidor
   */
  disableProduct(id: number): Observable<ProductResponse> {
    const url = `${this.apiUrl}inventory/product/disable?id=${id}`;
    const headers = this.getHeaders();

    console.log('URL de deshabilitación:', url);

    return this.http.post<ProductResponse>(url, null, { headers });
  }
}