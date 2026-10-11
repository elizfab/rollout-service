import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { filter, map, startWith } from 'rxjs';
import { RouteMeta } from '../../../core/models/route-data.model';
import { StorageService } from '../../../core/services/storage.service';
import { DataSourceBadgeComponent } from '../data-source-badge/data-source-badge.component';
import { LogoComponent } from '../logo/logo.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { NAV_GROUPS } from './nav-items';

/**
 * Casca do app: menu lateral fixo + cabeçalho + área de conteúdo.
 * Todas as páginas são renderizadas dentro do <router-outlet> daqui.
 */
@Component({
  selector: 'rs-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NzIconModule,
    NzButtonModule,
    NzAvatarModule,
    NzToolTipModule,
    LogoComponent,
    ThemeToggleComponent,
    DataSourceBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  static readonly COLLAPSED_KEY = 'sidebar.collapsed';

  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);

  readonly groups = NAV_GROUPS;
  readonly collapsed = signal(this.storage.get(ShellComponent.COLLAPSED_KEY, false));

  /** Metadados da rota ativa mais profunda (título no cabeçalho). */
  readonly meta = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        let snapshot = this.router.routerState.snapshot.root;
        while (snapshot.firstChild) snapshot = snapshot.firstChild;
        return (snapshot.data ?? {}) as Partial<RouteMeta>;
      }),
    ),
    { initialValue: {} as Partial<RouteMeta> },
  );

  toggleSidebar(): void {
    this.collapsed.update((c) => !c);
    this.storage.set(ShellComponent.COLLAPSED_KEY, this.collapsed());
  }
}
