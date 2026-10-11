/** Ações individuais (Cenário 2 — detalhe da release). */
export type IndividualReleaseAction = 'pause' | 'resume' | 'cancel' | 'rollback' | 'stepback';

/** Ações em lote (Cenário 1 — tabela da release train). */
export type BatchReleaseAction = 'pause' | 'resume' | 'cancel' | 'reschedule';

export type ReleaseAction = IndividualReleaseAction | BatchReleaseAction;

export interface ReleaseActionMeta {
  label: string;
  icon: string;
  /** Ações destrutivas pedem confirmação com motivo. */
  destructive: boolean;
}

export const RELEASE_ACTION_META: Record<ReleaseAction, ReleaseActionMeta> = {
  pause: { label: 'Pausar', icon: 'pause-circle', destructive: false },
  resume: { label: 'Retomar', icon: 'play-circle', destructive: false },
  cancel: { label: 'Cancelar', icon: 'stop', destructive: true },
  reschedule: { label: 'Reagendar', icon: 'schedule', destructive: false },
  rollback: { label: 'Rollback', icon: 'rollback', destructive: true },
  stepback: { label: 'Stepback', icon: 'step-backward', destructive: true },
};

export interface ReleaseActionRequest {
  action: ReleaseAction;
  reason: string;
  /** Usado apenas em `reschedule`. */
  scheduledAt?: string;
}
