import { BatchReleaseAction, IndividualReleaseAction, ReleaseActionRequest } from './release-action.model';
import { Release } from './release.model';
import { ReleaseStatus } from './release-status.model';

/**
 * Regras de ações por estado — fonte: docs/proposta/regras-permissionamentos/regras-acoes.md
 *
 * Duas matrizes, uma por cenário:
 *   • Cenário 1 (lote / release train): pausar, retomar, cancelar, reagendar.
 *   • Cenário 2 (individual / detalhe):  pausar, retomar, cancelar, rollback, stepback.
 *
 * Analogia: é a tabela de "o que cada botão pode fazer em cada semáforo".
 * A tela só pergunta "posso?" — quem responde é esta tabela, e ela é testada
 * em release-action.rules.spec.ts. Assim a regra não fica espalhada em *ngIfs.
 */

export const BATCH_ACTIONS_BY_STATUS: Record<ReleaseStatus, readonly BatchReleaseAction[]> = {
  scheduled: ['cancel', 'reschedule'],
  rescheduled: ['cancel', 'reschedule'],
  expansion_paused: ['resume', 'cancel', 'reschedule'],
  in_progress: ['pause'],
  stepback: [],
  canceled: [],
  rollback: [],
  expansion_completed: [],
};

export const INDIVIDUAL_ACTIONS_BY_STATUS: Record<ReleaseStatus, readonly IndividualReleaseAction[]> = {
  scheduled: ['cancel'],
  rescheduled: ['cancel'],
  expansion_paused: ['resume', 'cancel', 'rollback'],
  in_progress: ['pause'],
  stepback: [],
  canceled: [],
  rollback: [],
  expansion_completed: ['rollback', 'stepback'],
};

/** Ordem fixa de exibição dos botões. */
export const BATCH_ACTION_ORDER: readonly BatchReleaseAction[] = ['pause', 'resume', 'cancel', 'reschedule'];
export const INDIVIDUAL_ACTION_ORDER: readonly IndividualReleaseAction[] = ['pause', 'resume', 'cancel', 'rollback', 'stepback'];

export function allowedIndividualActions(status: ReleaseStatus): IndividualReleaseAction[] {
  return INDIVIDUAL_ACTION_ORDER.filter((a) => INDIVIDUAL_ACTIONS_BY_STATUS[status].includes(a));
}

/**
 * Ações em lote permitidas para um conjunto de releases selecionadas.
 * Uma ação só aparece se for permitida para TODAS as selecionadas (interseção):
 * se uma release em progresso e outra agendada estão marcadas, nenhuma ação
 * vale para as duas, e a lista volta vazia.
 */
export function allowedBatchActions(statuses: readonly ReleaseStatus[]): BatchReleaseAction[] {
  if (statuses.length === 0) return [];
  return BATCH_ACTION_ORDER.filter((action) => statuses.every((s) => BATCH_ACTIONS_BY_STATUS[s].includes(action)));
}

/** Status resultante de cada ação. */
export const STATUS_AFTER_ACTION: Record<IndividualReleaseAction | BatchReleaseAction, ReleaseStatus> = {
  pause: 'expansion_paused',
  resume: 'in_progress',
  cancel: 'canceled',
  reschedule: 'rescheduled',
  rollback: 'rollback',
  stepback: 'stepback',
};

export class ReleaseActionNotAllowedError extends Error {
  constructor(
    readonly releaseId: string,
    readonly action: string,
    readonly status: ReleaseStatus,
  ) {
    super(`Ação "${action}" não é permitida para a release ${releaseId} no status "${status}".`);
    this.name = 'ReleaseActionNotAllowedError';
  }
}

/**
 * Aplica uma ação a uma release (usado no modo mock e para atualização otimista).
 * Função pura: não altera o objeto recebido, devolve uma cópia nova.
 */
export function applyReleaseAction(
  release: Release,
  request: ReleaseActionRequest,
  scenario: 'batch' | 'individual',
  changedBy: string,
  now: Date = new Date(),
): Release {
  const allowed: readonly string[] =
    scenario === 'batch' ? BATCH_ACTIONS_BY_STATUS[release.status] : INDIVIDUAL_ACTIONS_BY_STATUS[release.status];

  if (!allowed.includes(request.action)) {
    throw new ReleaseActionNotAllowedError(release.id, request.action, release.status);
  }

  const status = STATUS_AFTER_ACTION[request.action];
  const iso = now.toISOString();

  return {
    ...release,
    status,
    scheduledAt: request.action === 'reschedule' && request.scheduledAt ? request.scheduledAt : release.scheduledAt,
    statusHistory: [
      ...release.statusHistory,
      { status, observation: request.reason, changedBy, createdAt: iso },
    ],
    updatedAt: iso,
  };
}
