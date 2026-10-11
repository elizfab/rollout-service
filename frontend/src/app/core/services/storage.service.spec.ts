import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(StorageService);
  });

  it('grava e lê JSON com o prefixo rollout.', () => {
    service.set('filtros', { a: 1 });
    expect(localStorage.getItem('rollout.filtros')).toBe('{"a":1}');
    expect(service.get('filtros', null)).toEqual({ a: 1 });
  });

  it('devolve o padrão quando a chave não existe ou o JSON é inválido', () => {
    expect(service.get('nada', 'padrao')).toBe('padrao');
    localStorage.setItem('rollout.quebrado', '{oops');
    expect(service.get('quebrado', 42)).toBe(42);
  });

  it('remove uma chave e limpa só as chaves do app', () => {
    service.set('a', 1);
    service.set('b', 2);
    localStorage.setItem('outro-app', 'x');
    service.remove('a');
    expect(service.get('a', null)).toBeNull();
    service.clearAll();
    expect(service.get('b', null)).toBeNull();
    expect(localStorage.getItem('outro-app')).toBe('x');
  });

  it('não quebra quando o storage recusa a escrita', () => {
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    expect(service.set('x', 1)).toBe(false);
    spy.mockRestore();
  });
});
