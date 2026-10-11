import { AppEnvironment } from '../app/core/models/environment.model';

/**
 * Ambiente de produção (Vercel).
 * Enquanto não houver backend publicado, a produção também usa os mocks locais
 * (dados do usuário ficam no localStorage). Para ligar o backend, troque
 * `dataSource` para 'api' e ajuste `apiUrl`.
 */
export const environment: AppEnvironment = {
  production: true,
  dataSource: 'mock',
  apiUrl: 'https://api.rollout-service.example.com',
  apiPrefix: '/v1',
  mockDelayMs: 0,
};
