import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_ENVIRONMENT } from '../config/environment.token';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_ENVIRONMENT, useValue: { production: false, dataSource: 'api', apiUrl: 'http://api', apiPrefix: '/v1', mockDelayMs: 0 } },
      ],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('monta a URL, serializa a query e desembrulha o envelope', () => {
    let result: unknown;
    api.get('/releases', { page: 2, status: ['scheduled', 'in_progress'], search: '', x: null }).subscribe((r) => (result = r));
    const req = http.expectOne((r) => r.url === 'http://api/v1/releases');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.getAll('status')).toEqual(['scheduled', 'in_progress']);
    expect(req.request.params.has('search')).toBe(false);
    req.flush({ success: true, data: { ok: true } });
    expect(result).toEqual({ ok: true });
  });

  it.each(['post', 'put', 'patch'] as const)('%s envia o corpo', (method) => {
    api[method]('/x', { a: 1 }).subscribe();
    const req = http.expectOne('http://api/v1/x');
    expect(req.request.method).toBe(method.toUpperCase());
    expect(req.request.body).toEqual({ a: 1 });
    req.flush({ success: true, data: null });
  });

  it('delete', () => {
    api.delete('/x/1').subscribe();
    http.expectOne({ method: 'DELETE', url: 'http://api/v1/x/1' }).flush({ success: true, data: null });
  });
});
