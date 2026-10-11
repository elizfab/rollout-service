import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AppEnvironment } from '../models/environment.model';

/**
 * Ambiente injetável. Serviços leem o ambiente por aqui (e não importando o
 * arquivo direto), o que permite trocar a fonte de dados nos testes.
 */
export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('APP_ENVIRONMENT', {
  providedIn: 'root',
  factory: () => environment,
});
