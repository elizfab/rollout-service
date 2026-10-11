import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, shareReplay, switchMap, throwError } from 'rxjs';
import { API_ENDPOINTS, MOCK_FILES } from '../config/api-endpoints';
import { APP_ENVIRONMENT } from '../config/environment.token';
import { ApiResponse } from '../models/api-response.model';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, PageQuery, Paginated } from '../models/pagination.model';
import { ReleaseActionRequest } from '../../models/release-action.model';
import { applyReleaseAction } from '../../models/release-action.rules';
import { Release, ReleaseFilters } from '../../models/release.model';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { simulateLatency } from './simulate-latency';

export interface ReleaseListQuery extends PageQuery {
  filters?: Partial<ReleaseFilters>;
}

/**
 * Fonte de dados das releases. A tela e o NgRx não sabem se os dados vêm do
 * mock ou do backend: só chamam `list`, `getById` e `executeAction`.
 *
 * Analogia: é a tomada da parede. Hoje ela está ligada num gerador (o mock
 * local); amanhã, na rede elétrica (o backend). O aparelho (a tela) não muda.
 *
 *  • dataSource = 'mock' → lê `public/mocks/releases.json`, aplica filtros e
 *    paginação no navegador e grava as alterações no localStorage.
 *  • dataSource = 'api'  → chama `/v1/releases` no backend.
 */
@Injectable({ providedIn: 'root' })
export class ReleasesDataService {
  static readonly MOCK_DB_KEY = 'releases.db';
  static readonly MOCK_USER = 'dev.local';

  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);
  private readonly env = inject(APP_ENVIRONMENT);

  private mockSeed$?: Observable<Release[]>;

  get isMock(): boolean {
    return this.env.dataSource === 'mock';
  }

  list(query: ReleaseListQuery = {}): Observable<Paginated<Release>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, query.limit ?? DEFAULT_PAGE_SIZE));

    if (!this.isMock) {
      const f = query.filters ?? {};
      return this.api.get<Paginated<Release>>(API_ENDPOINTS.releases, {
        page,
        limit,
        search: f.search,
        status: f.statuses,
        releaseTrainId: f.releaseTrainId,
      });
    }

    return this.mockDb().pipe(
      map((all) => paginate(filterReleases(all, query.filters), page, limit)),
      simulateLatency(this.env.mockDelayMs),
    );
  }

  getById(id: string): Observable<Release> {
    if (!this.isMock) return this.api.get<Release>(API_ENDPOINTS.release(id));

    return this.mockDb().pipe(
      switchMap((all) => {
        const found = all.find((r) => r.id === id);
        return found ? of(found) : throwError(() => new Error(`Release ${id} não encontrada.`));
      }),
      simulateLatency(this.env.mockDelayMs),
    );
  }

  /**
   * Executa uma ação (Cenário 2 — individual) ou em lote (Cenário 1).
   * No backend: PUT /v1/releases/:id com `{ action, reason, scheduledAt }`.
   */
  executeAction(ids: string[], request: ReleaseActionRequest, scenario: 'batch' | 'individual'): Observable<Release[]> {
    if (!this.isMock) {
      if (scenario === 'individual') {
        return this.api.put<Release>(API_ENDPOINTS.release(ids[0]), request).pipe(map((r) => [r]));
      }
      return this.api
        .put<Release[]>(API_ENDPOINTS.releaseTrainBatchActions, { releaseIds: ids, ...request })
        .pipe(map((r) => (Array.isArray(r) ? r : [r])));
    }

    return this.mockDb().pipe(
      map((all) => {
        const updated: Release[] = [];
        const next = all.map((r) => {
          if (!ids.includes(r.id)) return r;
          const changed = applyReleaseAction(r, request, scenario, ReleasesDataService.MOCK_USER);
          updated.push(changed);
          return changed;
        });
        this.storage.set(ReleasesDataService.MOCK_DB_KEY, next);
        return updated;
      }),
      simulateLatency(this.env.mockDelayMs),
    );
  }

  /** Volta o mock ao estado original do arquivo JSON. */
  resetMock(): void {
    this.storage.remove(ReleasesDataService.MOCK_DB_KEY);
  }

  /** Substitui o "banco" mock por uma lista importada (ImportExportService). */
  replaceMock(releases: Release[]): void {
    this.storage.set(ReleasesDataService.MOCK_DB_KEY, releases);
  }

  private mockDb(): Observable<Release[]> {
    const saved = this.storage.get<Release[] | null>(ReleasesDataService.MOCK_DB_KEY, null);
    if (saved) return of(saved);

    this.mockSeed$ ??= this.http
      .get<ApiResponse<Paginated<Release>>>(MOCK_FILES.releases)
      .pipe(
        map((r) => r.data.items),
        shareReplay(1),
      );
    return this.mockSeed$;
  }
}

export function filterReleases(all: readonly Release[], filters: Partial<ReleaseFilters> = {}): Release[] {
  const term = (filters.search ?? '').trim().toLowerCase();
  const statuses = filters.statuses ?? [];

  return all.filter((r) => {
    if (statuses.length && !statuses.includes(r.status)) return false;
    if (filters.releaseTrainId && r.releaseTrainId !== filters.releaseTrainId) return false;
    if (!term) return true;
    return [r.id, r.gmud, r.racf, r.applicationName, r.packageStory, r.releaseTrainName ?? '']
      .some((v) => v.toLowerCase().includes(term));
  });
}

export function paginate<T>(items: readonly T[], page: number, limit: number): Paginated<T> {
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), pagination: { page, limit, total: items.length } };
}
