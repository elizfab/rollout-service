import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import pt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import { pt_BR, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';

import { routes } from './app.routes';
import { NZ_CONFIG, NZ_ICONS } from './core/config/ng-zorro.config';
import { apiErrorInterceptor } from './core/interceptors/api-error.interceptor';

registerLocaleData(pt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withFetch(), withInterceptors([apiErrorInterceptor])),
    provideAnimationsAsync(),

    // NG-ZORRO: idioma, ícones (estáticos, sem CDN) e configuração global
    provideNzI18n(pt_BR),
    provideNzIcons(NZ_ICONS),
    provideNzConfig(NZ_CONFIG),
    { provide: LOCALE_ID, useValue: 'pt-BR' },

    // NgRx: store raiz vazio; cada área registra seu estado na própria rota (app.routes.ts)
    provideStore({}, { runtimeChecks: { strictActionImmutability: true, strictStateImmutability: true } }),
    provideEffects(),
    provideStoreDevtools({ maxAge: 50, logOnly: !isDevMode(), name: 'Rollout Service' }),
  ],
};
