import { HttpErrorResponse } from '@angular/common/http';
import { toApiError } from './api-error.interceptor';

describe('toApiError', () => {
  it('usa o erro do envelope do backend', () => {
    const err = new HttpErrorResponse({ status: 422, error: { error: { code: 'INVALID', message: 'Campo obrigatório' } } });
    expect(toApiError(err)).toEqual({ code: 'INVALID', message: 'Campo obrigatório', details: undefined });
  });

  it('explica erro de rede (backend fora do ar)', () => {
    expect(toApiError(new HttpErrorResponse({ status: 0 })).code).toBe('NETWORK');
  });

  it('cai para HTTP_<status> e para erros genéricos', () => {
    expect(toApiError(new HttpErrorResponse({ status: 500, statusText: 'x' })).code).toBe('HTTP_500');
    expect(toApiError(new Error('boom'))).toEqual({ code: 'UNKNOWN', message: 'boom' });
    expect(toApiError('?').code).toBe('UNKNOWN');
  });
});
