/** De onde o frontend busca os dados. */
export type DataSource = 'mock' | 'api';

export interface AppEnvironment {
  production: boolean;
  dataSource: DataSource;
  /** URL base do backend (sem barra no final). */
  apiUrl: string;
  /** Prefixo de versão de todas as rotas do backend. */
  apiPrefix: string;
  /** Atraso artificial dos mocks, para simular rede e testar loadings. */
  mockDelayMs: number;
}
