import { MonoTypeOperatorFunction, delay, identity } from 'rxjs';

/** Atraso artificial só quando configurado (> 0). Com 0, a resposta é síncrona. */
export function simulateLatency<T>(ms: number): MonoTypeOperatorFunction<T> {
  return ms > 0 ? delay(ms) : identity;
}
