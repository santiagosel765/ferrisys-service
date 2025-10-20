/* auth.service.ts */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces para el tipado
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  // Agrega otros campos que devuelva tu API
  user?: any;
  expiresIn?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  constructor() { }

  /**
   * Método para autenticar usuario y obtener token
   * @param credentials - Objeto con username y password
   * @returns Observable con la respuesta del servidor
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = `${this.apiUrl}auth/login`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Log para debug - quitar en producción
    console.log('URL de login:', url);
    console.log('Credenciales enviadas:', credentials);

    return this.http.post<LoginResponse>(url, credentials, { headers });
  }

  /**
   * Método para guardar el token en localStorage
   * @param token - Token JWT a guardar
   */
  saveToken(token: string): void {
    sessionStorage.setItem('authToken', token);
  }

  /**
   * Método para obtener el token guardado
   * @returns Token JWT o null si no existe
   */
  getToken(): string | null {
    return sessionStorage.getItem('authToken');
  }

  /**
   * Método para verificar si el usuario está autenticado
   * @returns true si existe un token, false en caso contrario
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Método para cerrar sesión (eliminar token)
   */
  logout(): void {
    sessionStorage.removeItem('authToken');
  }
}