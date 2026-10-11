import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Logo do Rollout: barras crescentes (rollout gradual) sobre um gradiente
 * azul → lilás → rosa, com um arco pêssego que termina no ponto laranja
 * (a release chegando ao destino). Ver docs/tema.md.
 */
@Component({
  selector: 'rs-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="rs-logo" [class.rs-logo--compact]="compact()">
      <svg class="rs-logo__mark" viewBox="0 0 64 64" [attr.width]="size()" [attr.height]="size()" aria-hidden="true">
        <defs>
          <linearGradient id="rs-logo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#6474E5" />
            <stop offset="0.6" stop-color="#9A7FE6" />
            <stop offset="1" stop-color="#E26D9C" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill="url(#rs-logo-gradient)" />
        <rect x="15" y="38" width="7" height="12" rx="3.5" fill="#fff" fill-opacity="0.55" />
        <rect x="26.5" y="31" width="7" height="19" rx="3.5" fill="#fff" fill-opacity="0.78" />
        <rect x="38" y="24" width="7" height="26" rx="3.5" fill="#fff" />
        <path d="M12 31C21 17 35 12 46 15.5" fill="none" stroke="#FFD6C2" stroke-width="3.2" stroke-linecap="round" />
        <circle cx="49" cy="16.5" r="5.5" fill="#FF8552" stroke="#fff" stroke-width="2" />
      </svg>
      @if (!compact()) {
        <span class="rs-logo__text">
          <span class="rs-logo__name">rollout</span>
          <span class="rs-logo__suffix">service</span>
        </span>
      }
    </span>
  `,
  styles: `
    .rs-logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    .rs-logo__mark {
      flex-shrink: 0;
      filter: drop-shadow(0 4px 10px rgba(100, 116, 229, 0.25));
    }
    .rs-logo__text {
      display: flex;
      flex-direction: column;
      line-height: 1.05;
    }
    .rs-logo__name {
      color: var(--rs-text);
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .rs-logo__suffix {
      color: var(--rs-color-accent-text);
      font-family: var(--rs-font-mono);
      font-size: 0.68rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
  `,
})
export class LogoComponent {
  readonly compact = input(false);
  readonly size = input(36);
}
