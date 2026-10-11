import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { pt_BR, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NZ_ICONS } from '../core/config/ng-zorro.config';
import { APP_ENVIRONMENT } from '../core/config/environment.token';

/** Providers comuns para testes de componentes com NG-ZORRO. */
export function provideComponentTesting(dataSource: 'mock' | 'api' = 'mock'): (Provider | EnvironmentProviders)[] {
  return [
    provideRouter([]),
    provideHttpClient(),
    provideHttpClientTesting(),
    provideNoopAnimations(),
    provideNzI18n(pt_BR),
    provideNzIcons(NZ_ICONS),
    { provide: APP_ENVIRONMENT, useValue: { production: false, dataSource, apiUrl: 'http://api', apiPrefix: '/v1', mockDelayMs: 0 } },
  ];
}
