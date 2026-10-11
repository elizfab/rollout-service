import { Injectable } from '@angular/core';

/**
 * Persistência local tipada sobre o localStorage.
 *
 * Todas as chaves ganham o prefixo `rollout.` para não colidir com outros apps
 * no mesmo domínio. Leitura e escrita nunca quebram a tela: em aba anônima,
 * com cota cheia ou storage bloqueado, o serviço devolve o valor padrão.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  static readonly PREFIX = 'rollout.';

  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(StorageService.PREFIX + key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(StorageService.PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(StorageService.PREFIX + key);
    } catch {
      /* storage indisponível: nada a remover */
    }
  }

  /** Remove todas as chaves do app (útil para "restaurar dados do mock"). */
  clearAll(): void {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(StorageService.PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* storage indisponível */
    }
  }
}
