import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ThemeMode } from '../models/theme.model';
import { StorageService } from './storage.service';

/**
 * Controla o tema claro/escuro.
 *
 * Fluxo: escolha salva → senão, tema do sistema → grava `data-theme` no <html>.
 * O CSS (shared/styles/base/_theme.scss) reage a esse atributo.
 * A chave `theme` (→ `rollout.theme`) é a mesma lida pelo script do index.html.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  static readonly STORAGE_KEY = 'theme';

  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(StorageService);

  private readonly _mode = signal<ThemeMode>(this.initialMode());
  readonly mode = this._mode.asReadonly();
  readonly isDark = computed(() => this._mode() === 'dark');

  constructor() {
    effect(() => {
      const mode = this._mode();
      this.document.documentElement.setAttribute('data-theme', mode);
      this.storage.set(ThemeService.STORAGE_KEY, mode);
    });
  }

  set(mode: ThemeMode): void {
    this._mode.set(mode);
  }

  toggle(): void {
    this._mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }

  private initialMode(): ThemeMode {
    const saved = this.storage.get<ThemeMode | null>(ThemeService.STORAGE_KEY, null);
    if (saved === 'dark' || saved === 'light') return saved;
    const prefersDark = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    return prefersDark ? 'dark' : 'light';
  }
}
