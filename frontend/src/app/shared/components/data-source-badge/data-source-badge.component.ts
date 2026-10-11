import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { APP_ENVIRONMENT } from '../../../core/config/environment.token';

/** Mostra de onde os dados estão vindo: mock local ou API. */
@Component({
  selector: 'rs-data-source-badge',
  imports: [NzIconModule, NzToolTipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="rs-source"
      [class.rs-source--mock]="isMock()"
      data-testid="data-source"
      nz-tooltip
      [nzTooltipTitle]="tooltip()"
    >
      <span nz-icon [nzType]="isMock() ? 'database' : 'api'"></span>
      {{ isMock() ? 'Mock local' : 'API' }}
    </span>
  `,
  styles: `
    .rs-source {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-pill);
      color: var(--rs-color-primary-text);
      background: var(--rs-color-primary-soft);
      font-family: var(--rs-font-mono);
      font-size: var(--rs-font-size-xs);
      font-weight: 600;
    }
    .rs-source--mock {
      color: var(--rs-color-accent-text);
      background: var(--rs-color-accent-soft);
    }
  `,
})
export class DataSourceBadgeComponent {
  private readonly env = inject(APP_ENVIRONMENT);
  readonly isMock = computed(() => this.env.dataSource === 'mock');
  readonly tooltip = computed(() =>
    this.isMock()
      ? 'Dados de public/mocks; alterações ficam no localStorage'
      : `${this.env.apiUrl}${this.env.apiPrefix}`,
  );
}
