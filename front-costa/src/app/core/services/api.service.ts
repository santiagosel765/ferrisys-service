import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

type HttpOptions = {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?:
    | HttpParams
    | {
        [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
      };
  reportProgress?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
} & Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private readonly http: HttpClient) {}

  private buildUrl(endpoint: string): string {
    if (/^https?:\/\//i.test(endpoint)) {
      return endpoint;
    }

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${normalizedEndpoint}`;
  }

  get<T>(endpoint: string, options: HttpOptions = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.get<T>(url, options);
  }

  post<T>(endpoint: string, body: unknown, options: HttpOptions = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.post<T>(url, body, options);
  }

  put<T>(endpoint: string, body: unknown, options: HttpOptions = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.put<T>(url, body, options);
  }

  delete<T>(endpoint: string, options: HttpOptions = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.delete<T>(url, options);
  }
}
