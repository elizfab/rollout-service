import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { catchError, map, of, startWith } from 'rxjs';
import { RouteMeta } from '../../core/models/route-data.model';
import { HealthService } from '../../core/services/health.service';
import { HealthCheck } from '../../models/health.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

type HealthState = { loading: true } | { loading: false; data: HealthCheck | null; error: string | null };

/** GET /v1/checks — primeira tela a validar quando o backend for conectado. */
@Component({
  selector: 'rs-health',
  imports: [NzIconModule, NzSkeletonModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header
      eyebrow="Sistema"
      [title]="meta.title"
      [description]="meta.description"
      [endpoints]="meta.endpoints ?? []"
    />
    @let s = state();
    @if (s.loading) {
      <nz-skeleton [nzActive]="true" />
    } @else if (s.data) {
      <section class="rs-health" [class.rs-health--ok]="s.data.status === 'ok'" data-testid="health-status">
        <span nz-icon [nzType]="s.data.status === 'ok' ? 'check-circle' : 'close-circle'" class="rs-health__icon"></span>
        <div>
          <strong>{{ s.data.service }}</strong>
          <p class="rs-text-muted">Status: {{ s.data.status }} · versão {{ s.data.version ?? 'n/d' }}</p>
        </div>
      </section>
      <ul class="rs-checks">
        @for (c of s.data.checks ?? []; track c.name) {
          <li>
            <span class="rs-mono">{{ c.name }}</span>
            <span [class.rs-ok]="c.status === 'ok'">{{ c.status }}</span>
            <span class="rs-text-muted rs-mono">{{ c.latencyMs ?? '-' }} ms</span>
          </li>
        }
      </ul>
    } @else {
      <section class="rs-health" data-testid="health-status">
        <span nz-icon nzType="close-circle" class="rs-health__icon"></span>
        <div>
          <strong>Backend indisponível</strong>
          <p class="rs-text-muted">{{ s.error }}</p>
        </div>
      </section>
    }
  `,
  styles: `
    .rs-health {
      display: flex;
      align-items: center;
      gap: var(--rs-space-4);
      padding: var(--rs-space-4) var(--rs-space-5);
      border: 1px solid var(--rs-border);
      border-left: 4px solid var(--rs-color-danger);
      border-radius: var(--rs-radius-lg);
      background: var(--rs-surface);
    }
    .rs-health--ok {
      border-left-color: var(--rs-color-success);
    }
    .rs-health__icon {
      font-size: 28px;
      color: var(--rs-color-danger);
    }
    .rs-health--ok .rs-health__icon {
      color: var(--rs-color-success);
    }
    .rs-checks {
      display: grid;
      gap: var(--rs-space-2);
      margin: var(--rs-space-4) 0 0;
      padding: 0;
      list-style: none;
    }
    .rs-checks li {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: var(--rs-space-4);
      padding: var(--rs-space-3) var(--rs-space-4);
      border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-md);
      background: var(--rs-surface);
    }
    .rs-ok {
      color: var(--rs-color-success);
      font-weight: 700;
    }
    .rs-mono {
      font-family: var(--rs-font-mono);
    }
  `,
})
export class HealthComponent {
  readonly meta = inject(ActivatedRoute).snapshot.data as RouteMeta;
  readonly state = toSignal(
    inject(HealthService)
      .check()
      .pipe(
        map((data): HealthState => ({ loading: false, data, error: null })),
        catchError((err: { message?: string }) =>
          of<HealthState>({ loading: false, data: null, error: err?.message ?? 'Erro desconhecido' }),
        ),
        startWith<HealthState>({ loading: true }),
      ),
    { requireSync: true },
  );
}
