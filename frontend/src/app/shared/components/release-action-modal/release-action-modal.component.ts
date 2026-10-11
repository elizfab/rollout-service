import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { RELEASE_ACTION_META, ReleaseAction, ReleaseActionRequest } from '../../../models/release-action.model';

/**
 * Confirmação de ação de release. Todo pedido de ação leva um motivo, que vai
 * para o histórico de status (auditoria). "Reagendar" pede também a nova data.
 */
@Component({
  selector: 'rs-release-action-modal',
  imports: [FormsModule, NzModalModule, NzFormModule, NzInputModule, NzDatePickerModule, NzAlertModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-modal
      [nzVisible]="!!action()"
      [nzTitle]="title()"
      [nzOkText]="'Confirmar'"
      nzCancelText="Voltar"
      [nzOkDanger]="meta()?.destructive ?? false"
      [nzOkDisabled]="!valid()"
      [nzOkLoading]="loading()"
      (nzOnOk)="submit()"
      (nzOnCancel)="cancelled.emit()"
    >
      <ng-container *nzModalContent>
        @if (meta()?.destructive) {
          <nz-alert
            nzType="warning"
            nzShowIcon
            [nzMessage]="'Esta ação não pode ser desfeita pela interface.'"
            class="rs-action-modal__alert"
          />
        }
        <form nz-form nzLayout="vertical" (ngSubmit)="submit()">
          @if (action() === 'reschedule') {
            <nz-form-item>
              <nz-form-label nzRequired nzFor="rs-action-date">Nova data e horário</nz-form-label>
              <nz-form-control>
                <nz-date-picker
                  id="rs-action-date"
                  nzShowTime
                  nzFormat="dd/MM/yyyy HH:mm"
                  [ngModel]="scheduledAt()"
                  (ngModelChange)="scheduledAt.set($event)"
                  name="scheduledAt"
                  data-testid="action-date"
                />
              </nz-form-control>
            </nz-form-item>
          }
          <nz-form-item>
            <nz-form-label nzRequired nzFor="rs-action-reason">Motivo</nz-form-label>
            <nz-form-control nzExtra="Fica registrado no histórico de status da release.">
              <textarea
                nz-input
                id="rs-action-reason"
                rows="3"
                name="reason"
                data-testid="action-reason"
                [ngModel]="reason()"
                (ngModelChange)="reason.set($event)"
                placeholder="Ex.: aumento de erros 5xx no Datadog"
              ></textarea>
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>
    </nz-modal>
  `,
  styles: `
    .rs-action-modal__alert {
      margin-bottom: var(--rs-space-4);
    }
  `,
})
export class ReleaseActionModalComponent {
  /** Ação a confirmar; `null` fecha o modal. */
  readonly action = input<ReleaseAction | null>(null);
  /** Quantas releases serão afetadas (lote). */
  readonly count = input(1);
  readonly loading = input(false);

  readonly confirmed = output<ReleaseActionRequest>();
  readonly cancelled = output<void>();

  readonly reason = signal('');
  readonly scheduledAt = signal<Date | null>(null);

  readonly meta = computed(() => {
    const a = this.action();
    return a ? RELEASE_ACTION_META[a] : null;
  });

  readonly title = computed(() => {
    const m = this.meta();
    if (!m) return '';
    const n = this.count();
    return n > 1 ? `${m.label} ${n} releases` : `${m.label} release`;
  });

  readonly valid = computed(
    () => this.reason().trim().length >= 5 && (this.action() !== 'reschedule' || this.scheduledAt() !== null),
  );

  constructor() {
    // Limpa o formulário sempre que o modal abre para uma nova ação.
    effect(() => {
      this.action();
      this.reason.set('');
      this.scheduledAt.set(null);
    });
  }

  submit(): void {
    const action = this.action();
    if (!action || !this.valid()) return;
    this.confirmed.emit({
      action,
      reason: this.reason().trim(),
      scheduledAt: this.scheduledAt()?.toISOString(),
    });
  }
}
