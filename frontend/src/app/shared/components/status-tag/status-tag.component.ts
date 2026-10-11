import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { RELEASE_STATUS_META, ReleaseStatus } from '../../../models/release-status.model';

/**
 * Selo de status de release: ponto + texto, nunca só cor.
 * As cores vêm dos tokens --rs-status-<token>-* do tema.
 */
@Component({
  selector: 'rs-status-tag',
  imports: [NzToolTipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="rs-status"
      [attr.data-status]="status()"
      [style.--bg]="'var(--rs-status-' + meta().token + '-bg)'"
      [style.--fg]="'var(--rs-status-' + meta().token + '-fg)'"
      [style.--dot]="'var(--rs-status-' + meta().token + '-dot)'"
      nz-tooltip
      [nzTooltipTitle]="meta().description"
    >
      <span class="rs-status__dot" aria-hidden="true"></span>
      {{ meta().label }}
    </span>
  `,
  styles: `
    .rs-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 10px;
      border-radius: var(--rs-radius-pill);
      background: var(--bg);
      color: var(--fg);
      font-size: var(--rs-font-size-xs);
      font-weight: 700;
      white-space: nowrap;
    }
    .rs-status__dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--dot);
    }
    .rs-status[data-status='in_progress'] .rs-status__dot {
      animation: rs-pulse 1.6s ease-in-out infinite;
    }
    @keyframes rs-pulse {
      50% {
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--dot) 25%, transparent);
      }
    }
  `,
})
export class StatusTagComponent {
  readonly status = input.required<ReleaseStatus>();
  readonly meta = computed(() => RELEASE_STATUS_META[this.status()]);
}
