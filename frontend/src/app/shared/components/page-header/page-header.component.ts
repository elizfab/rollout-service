import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

/**
 * Cabeçalho padrão de página. Mostra também os endpoints que a tela consome:
 * a interface é voltada para devs, então a origem dos dados fica à vista.
 */
@Component({
  selector: 'rs-page-header',
  imports: [NzToolTipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="rs-page-header">
      <div class="rs-page-header__text">
        @if (eyebrow()) {
          <span class="rs-eyebrow">{{ eyebrow() }}</span>
        }
        <h1 data-testid="page-title">{{ title() }}</h1>
        @if (description()) {
          <p class="rs-text-muted">{{ description() }}</p>
        }
        @if (endpoints().length) {
          <ul class="rs-page-header__endpoints" aria-label="Endpoints consumidos">
            @for (e of endpoints(); track e) {
              <li><code nz-tooltip nzTooltipTitle="Endpoint do backend">{{ e }}</code></li>
            }
          </ul>
        }
      </div>
      <div class="rs-page-header__actions rs-no-print">
        <ng-content />
      </div>
    </header>
  `,
  styles: `
    .rs-page-header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--rs-space-4);
      margin-bottom: var(--rs-space-5);
    }
    .rs-page-header__text {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }
    .rs-page-header__endpoints {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 4px 0 0;
      padding: 0;
      list-style: none;
    }
    .rs-page-header__endpoints code {
      font-size: var(--rs-font-size-xs);
    }
    .rs-page-header__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--rs-space-2);
    }
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly eyebrow = input<string>();
  readonly endpoints = input<readonly string[]>([]);
}
