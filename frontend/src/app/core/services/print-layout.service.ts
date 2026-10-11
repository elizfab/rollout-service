import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

/**
 * Prepara a página para impressão (ou "Salvar como PDF").
 *
 * Adiciona a classe `rs-printing` no <body> — o CSS de impressão
 * (shared/styles/base/_print.scss) força o tema claro, esconde a navegação e
 * abre os acordeões — e troca o título do documento, que vira o nome do PDF.
 */
@Injectable({ providedIn: 'root' })
export class PrintLayoutService {
  static readonly BODY_CLASS = 'rs-printing';

  private readonly document = inject(DOCUMENT);

  print(title?: string): void {
    const win = this.document.defaultView;
    if (!win) return;

    const body = this.document.body;
    const originalTitle = this.document.title;

    body.classList.add(PrintLayoutService.BODY_CLASS);
    if (title) this.document.title = title;

    const restore = () => {
      body.classList.remove(PrintLayoutService.BODY_CLASS);
      this.document.title = originalTitle;
      win.removeEventListener('afterprint', restore);
    };

    win.addEventListener('afterprint', restore);
    win.print();
  }
}
