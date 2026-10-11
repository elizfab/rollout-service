/**
 * Metadados de cada rota (campo `data` do app.routes.ts).
 * Servem para o título da página, o breadcrumb e para deixar explícito
 * quais endpoints do backend aquela tela consome.
 */
export interface RouteMeta {
  /** Título exibido no cabeçalho da página. */
  title: string;
  /** Texto curto abaixo do título. */
  description?: string;
  /** Endpoints do backend usados pela tela (ex.: 'GET /v1/releases'). */
  endpoints?: string[];
  /** Grupo do menu lateral. */
  section?: 'rollouts' | 'catalogo' | 'configuracoes' | 'sistema';
}
