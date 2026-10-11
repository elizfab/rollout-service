import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'rs-theme-toggle',
  imports: [NzButtonModule, NzIconModule, NzToolTipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      nz-button
      nzType="text"
      nzShape="circle"
      data-testid="theme-toggle"
      (click)="theme.toggle()"
      [attr.aria-label]="theme.isDark() ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'"
      [attr.aria-pressed]="theme.isDark()"
      nz-tooltip
      [nzTooltipTitle]="theme.isDark() ? 'Tema claro' : 'Tema escuro'"
    >
      <span nz-icon [nzType]="theme.isDark() ? 'sun' : 'moon'"></span>
    </button>
  `,
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);
}
