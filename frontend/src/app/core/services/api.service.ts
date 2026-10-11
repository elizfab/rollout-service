import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_ENVIRONMENT } from '../config/environment.token';
import { ApiResponse } from '../models/api-response.model';

type QueryValue = string | number | boolean | readonly (string | number | boolean)[] | null | undefined;
export type QueryParams = Record<string, QueryValue>;

/**
 * Wrapper genérico sobre o HttpClient para o backend do Rollout.
 * Monta a URL (`apiUrl + apiPrefix + path`) e desembrulha o envelope
 * `{ success, data, error }`, devolvendo só o `data`.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);

  get<T>(path: string, query?: QueryParams): Observable<T> {
    return this.http.get<ApiResponse<T>>(this.url(path), { params: this.params(query) }).pipe(map((r) => r.data));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<ApiResponse<T>>(this.url(path), body).pipe(map((r) => r.data));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<ApiResponse<T>>(this.url(path), body).pipe(map((r) => r.data));
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<ApiResponse<T>>(this.url(path), body).pipe(map((r) => r.data));
  }

  delete<T = void>(path: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(this.url(path)).pipe(map((r) => r.data));
  }

  url(path: string): string {
    return `${this.env.apiUrl}${this.env.apiPrefix}${path}`;
  }

  private params(query?: QueryParams): HttpParams {
    let params = new HttpParams();
    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      if (Array.isArray(value)) {
        value.forEach((v) => (params = params.append(key, String(v))));
      } else {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
