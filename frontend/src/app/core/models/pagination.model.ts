/**
 * Paginação padrão das listagens (docs/pagination.md):
 * `{ data: { items: [...], pagination: { page, total, limit } } }`
 */
export interface Pagination {
  page: number;
  total: number;
  limit: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface PageQuery {
  page?: number;
  /** Itens por página (default 10, máximo 100). */
  limit?: number;
}

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
