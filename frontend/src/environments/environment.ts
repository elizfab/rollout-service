import { AppEnvironment } from '../app/core/models/environment.model';

/**
 * Ambiente de desenvolvimento (`npm start`).
 *
 * `dataSource: 'mock'` → lê os JSON de `public/mocks` e guarda as alterações no localStorage.
 * `dataSource: 'api'`  → chama o backend Go em `apiUrl` + `apiPrefix`.
 */
export const environment: AppEnvironment = {
  production: false,
  dataSource: 'mock',
  apiUrl: 'http://localhost:8080',
  apiPrefix: '/v1',
  mockDelayMs: 350,
};
