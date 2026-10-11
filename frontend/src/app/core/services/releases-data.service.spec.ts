import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { APP_ENVIRONMENT } from '../config/environment.token';
import { AppEnvironment } from '../models/environment.model';
import { makeRelease } from '../../testing/release.fixture';
import { ReleasesDataService, filterReleases, paginate } from './releases-data.service';

const seed = [
  makeRelease({ id: 'r1', status: 'scheduled', applicationName: 'superapp-pix' }),
  makeRelease({ id: 'r2', status: 'in_progress', gmud: 'GMUD999', releaseTrainId: 'rt-2' }),
  makeRelease({ id: 'r3', status: 'expansion_completed', releaseTrainId: null, releaseTrainName: null }),
];

function setup(dataSource: AppEnvironment['dataSource']) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: APP_ENVIRONMENT, useValue: { production: false, dataSource, apiUrl: 'http://api', apiPrefix: '/v1', mockDelayMs: 0 } },
    ],
  });
  return { service: TestBed.inject(ReleasesDataService), http: TestBed.inject(HttpTestingController) };
}

describe('ReleasesDataService', () => {
  beforeEach(() => localStorage.clear());

  describe('modo mock', () => {
    it('lê o JSON do mock, filtra e pagina no navegador', async () => {
      const { service, http } = setup('mock');
      const result = firstValueFrom(service.list({ page: 1, limit: 2, filters: { statuses: ['scheduled', 'in_progress'] } }));
      http.expectOne('mocks/releases.json').flush({ success: true, data: { items: seed, pagination: { page: 1, limit: 3, total: 3 } } });
      const page = await result;
      expect(page.items.map((r) => r.id)).toEqual(['r1', 'r2']);
      expect(page.pagination).toEqual({ page: 1, limit: 2, total: 2 });
      expect(service.isMock).toBe(true);
    });

    it('executa a ação, persiste no localStorage e as próximas leituras usam o banco salvo', async () => {
      const { service, http } = setup('mock');
      const done = firstValueFrom(service.executeAction(['r2'], { action: 'pause', reason: 'teste' }, 'batch'));
      http.expectOne('mocks/releases.json').flush({ success: true, data: { items: seed, pagination: { page: 1, limit: 3, total: 3 } } });
      const [updated] = await done;
      expect(updated.status).toBe('expansion_paused');

      const detail = await firstValueFrom(service.getById('r2'));
      expect(detail.status).toBe('expansion_paused');
      http.expectNone('mocks/releases.json');

      service.resetMock();
      expect(localStorage.getItem('rollout.releases.db')).toBeNull();
    });

    it('getById falha com id inexistente', async () => {
      const { service } = setup('mock');
      service.replaceMock(seed);
      await expect(firstValueFrom(service.getById('nao-existe'))).rejects.toThrow('não encontrada');
    });
  });

  describe('modo api', () => {
    afterEach(() => TestBed.inject(HttpTestingController).verify());

    it('lista com filtros na query', () => {
      const { service, http } = setup('api');
      service.list({ page: 3, limit: 500, filters: { statuses: ['scheduled'], search: 'pix' } }).subscribe();
      const req = http.expectOne((r) => r.url === 'http://api/v1/releases');
      expect(req.request.params.get('page')).toBe('3');
      expect(req.request.params.get('limit')).toBe('100'); // limite máximo
      expect(req.request.params.getAll('status')).toEqual(['scheduled']);
      req.flush({ success: true, data: { items: [], pagination: { page: 3, limit: 100, total: 0 } } });
    });

    it('detalhe e ações usam os endpoints certos', () => {
      const { service, http } = setup('api');
      service.getById('r1').subscribe();
      http.expectOne('http://api/v1/releases/r1').flush({ success: true, data: seed[0] });

      service.executeAction(['r1'], { action: 'cancel', reason: 'x' }, 'individual').subscribe();
      const single = http.expectOne('http://api/v1/releases/r1');
      expect(single.request.method).toBe('PUT');
      single.flush({ success: true, data: seed[0] });

      service.executeAction(['r1', 'r2'], { action: 'cancel', reason: 'x' }, 'batch').subscribe();
      const batch = http.expectOne('http://api/v1/release-trains/batch-actions');
      expect(batch.request.body).toEqual({ releaseIds: ['r1', 'r2'], action: 'cancel', reason: 'x' });
      batch.flush({ success: true, data: [seed[0], seed[1]] });
    });
  });

  it('filterReleases busca por id, GMUD, aplicação e filtra por trem', () => {
    expect(filterReleases(seed, { search: 'gmud999' }).map((r) => r.id)).toEqual(['r2']);
    expect(filterReleases(seed, { search: 'PIX' }).map((r) => r.id)).toContain('r1');
    expect(filterReleases(seed, { releaseTrainId: 'rt-2' }).map((r) => r.id)).toEqual(['r2']);
    expect(filterReleases(seed)).toHaveLength(3);
  });

  it('paginate corta a página certa', () => {
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toEqual({ items: [3, 4], pagination: { page: 2, limit: 2, total: 5 } });
  });
});
