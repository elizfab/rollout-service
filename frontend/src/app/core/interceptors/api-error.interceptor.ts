import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../models/api-response.model';

/**
 * Padroniza qualquer erro HTTP em um `ApiError` ({ code, message, details }).
 * Assim effects e telas tratam erro sempre do mesmo jeito, venha ele do
 * backend (envelope `error`), da rede ou de um 404 de mock.
 */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(catchError((err: unknown) => throwError(() => toApiError(err))));

export function toApiError(err: unknown): ApiError {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { error?: Partial<ApiError> } | null;
    if (body?.error?.message) {
      return { code: body.error.code ?? `HTTP_${err.status}`, message: body.error.message, details: body.error.details };
    }
    if (err.status === 0) {
      return { code: 'NETWORK', message: 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.' };
    }
    return { code: `HTTP_${err.status}`, message: err.message };
  }
  if (err instanceof Error) return { code: 'UNKNOWN', message: err.message };
  return { code: 'UNKNOWN', message: 'Erro inesperado.' };
}
