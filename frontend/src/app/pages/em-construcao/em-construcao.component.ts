import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RouteMeta } from '../../core/models/route-data.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

/**
 * Página genérica para rotas já definidas, mas ainda sem tela.
 * Lê título, descrição e endpoints do `data` da rota, então cada rota nova
 * já nasce documentada e navegável. Troque pelo componente real quando
 * a issue da tela for implementada.
 */
@Component({
  selector: 'rs-em-construcao',
  imports: [RouterLink, NzButtonModule, NzIconModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header [eyebrow]="meta.section ?? 'Rollout'" [title]="meta.title" [description]="meta.description" />
    <section class="rs-wip" data-testid="em-construcao">
      <span nz-icon nzType="tool" class="rs-wip__icon"></span>
      <h2>Tela planejada</h2>
      <p class="rs-text-muted">A rota já existe; a interface será construída a partir destes endpoints:</p>
      <ul>
        @for (e of meta.endpoints ?? []; track e) {
          <li><code>{{ e }}</code></li>
        }
      </ul>
      <a nz-button nzType="primary" routerLink="/releases">Ir para releases</a>
    </section>
  `,
  styles: `
    .rs-wip {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--rs-space-3);
      padding: var(--rs-space-7) var(--rs-space-5);
      border: 1px dashed var(--rs-border-strong);
      border-radius: var(--rs-radius-lg);
      background:
        radial-gradient(circle at 50% 0%, var(--rs-color-lilac-soft), transparent 60%),
        var(--rs-surface);
      text-align: center;
    }
    .rs-wip__icon {
      font-size: 36px;
      color: var(--rs-color-accent);
    }
    ul {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
  `,
})
export class EmConstrucaoComponent {
  readonly meta = inject(ActivatedRoute).snapshot.data as RouteMeta;
}
