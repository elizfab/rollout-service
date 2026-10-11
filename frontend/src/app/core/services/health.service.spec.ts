import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_ENVIRONMENT } from '../config/environment.token';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it.each([
    ['mock', 'mocks/checks.json'],
    ['api', 'http://api/v1/checks'],
  ])('no modo %s chama %s', (dataSource, url) => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_ENVIRONMENT, useValue: { production: false, dataSource, apiUrl: 'http://api', apiPrefix: '/v1', mockDelayMs: 0 } },
      ],
    });
    TestBed.inject(HealthService).check().subscribe();
    TestBed.inject(HttpTestingController).expectOne(url).flush({ status: 'ok', service: 'x' });
  });
});
