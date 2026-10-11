/**
 * Envelope padrão das respostas do backend (`{ success, data, error }`).
 * Ver docs/INTEGRACAO-BACKEND.md na raiz do repositório.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
