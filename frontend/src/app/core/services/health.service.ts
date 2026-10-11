import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS, MOCK_FILES } from '../config/api-endpoints';
import { APP_ENVIRONMENT } from '../config/environment.token';
import { HealthCheck } from '../../models/health.model';
import { simulateLatency } from './simulate-latency';

/**
 * Saúde do backend: GET /v1/checks.
 * Exceção à regra do envelope: este endpoint devolve o objeto puro.
 */
@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);

  check(): Observable<HealthCheck> {
    if (this.env.dataSource === 'mock') {
      return this.http.get<HealthCheck>(MOCK_FILES.checks).pipe(simulateLatency(this.env.mockDelayMs));
    }
    return this.http.get<HealthCheck>(`${this.env.apiUrl}${this.env.apiPrefix}${API_ENDPOINTS.checks}`);
  }
}
