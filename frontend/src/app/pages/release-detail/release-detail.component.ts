import { DatePipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import {
  INDIVIDUAL_ACTION_ORDER,
  STATUS_AFTER_ACTION,
} from '../../models/release-action.rules';
import { IndividualReleaseAction, RELEASE_ACTION_META, ReleaseActionRequest } from '../../models/release-action.model';
import { RELEASE_STATUS_META, isTerminalStatus } from '../../models/release-status.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ReleaseActionModalComponent } from '../../shared/components/release-action-modal/release-action-modal.component';
import { StatusTagComponent } from '../../shared/components/status-tag/status-tag.component';
import { ReleaseDetailPageActions, releasesFeature, selectDetailAllowedActions, selectDetailRelease } from '../releases/store';

/**
 * Detalhe de uma release — Cenário 2 (ações individuais).
 * Mostra todos os botões do cenário; os não permitidos ficam desabilitados com
 * a explicação no tooltip, para o dev enxergar a regra em ação.
 */
@Component({
  selector: 'rs-release-detail',
  imports: [
    DatePipe,
    JsonPipe,
    RouterLink,
    NzButtonModule,
    NzCollapseModule,
    NzDescriptionsModule,
    NzIconModule,
    NzProgressModule,
    NzResultModule,
    NzSkeletonModule,
    NzTagModule,
    NzTimelineModule,
    NzToolTipModule,
    PageHeaderComponent,
    StatusTagComponent,
    ReleaseActionModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './release-detail.component.html',
  styleUrl: './release-detail.component.scss',
})
export class ReleaseDetailComponent {
  private readonly store = inject(Store);

  /** Vem do parâmetro `:id` da rota (withComponentInputBinding). */
  readonly id = input.required<string>();

  readonly release = this.store.selectSignal(selectDetailRelease);
  readonly allowed = this.store.selectSignal(selectDetailAllowedActions);
  readonly loading = this.store.selectSignal(releasesFeature.selectDetailLoading);
  readonly actionPending = this.store.selectSignal(releasesFeature.selectActionPending);
  readonly error = this.store.selectSignal(releasesFeature.selectError);

  readonly pendingAction = signal<IndividualReleaseAction | null>(null);

  readonly actions = INDIVIDUAL_ACTION_ORDER;
  readonly actionMeta = RELEASE_ACTION_META;
  readonly statusMeta = RELEASE_STATUS_META;
  readonly statusAfter = STATUS_AFTER_ACTION;

  readonly history = computed(() => [...(this.release()?.statusHistory ?? [])].reverse());
  readonly terminal = computed(() => {
    const r = this.release();
    return r ? isTerminalStatus(r.status) : false;
  });

  constructor() {
    effect(() => this.store.dispatch(ReleaseDetailPageActions.opened({ id: this.id() })));
  }

  isAllowed(action: IndividualReleaseAction): boolean {
    return this.allowed().includes(action);
  }

  disabledReason(action: IndividualReleaseAction): string {
    const r = this.release();
    if (!r || this.isAllowed(action)) return '';
    return `${RELEASE_ACTION_META[action].label} não é permitido com status "${RELEASE_STATUS_META[r.status].label}".`;
  }

  confirm(request: ReleaseActionRequest): void {
    this.store.dispatch(ReleaseDetailPageActions.actionRequested({ id: this.id(), request }));
    this.pendingAction.set(null);
  }
}
