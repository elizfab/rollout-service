/**
 * Estados possíveis de uma release (docs/proposta/regras-permissionamentos/regras-acoes.md).
 *
 * Os valores usam o padrão snake_case do backend. Se o backend renomear algum
 * status, ajuste SÓ este arquivo: rótulos, cores e regras leem daqui.
 */
export const RELEASE_STATUSES = [
  'scheduled',
  'rescheduled',
  'in_progress',
  'expansion_paused',
  'expansion_completed',
  'rollback',
  'stepback',
  'canceled',
] as const;

export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

/** Estados terminais: nenhuma ação em lote é permitida a partir deles. */
export const TERMINAL_STATUSES: readonly ReleaseStatus[] = ['rollback', 'stepback', 'canceled'];

export interface ReleaseStatusMeta {
  label: string;
  /** Sufixo do token de cor no tema: --rs-status-<token>-bg/-fg/-dot */
  token: string;
  description: string;
}

export const RELEASE_STATUS_META: Record<ReleaseStatus, ReleaseStatusMeta> = {
  scheduled: { label: 'Agendado', token: 'scheduled', description: 'Release agendada, aguardando execução.' },
  rescheduled: { label: 'Reagendado', token: 'rescheduled', description: 'Release reagendada para outra data/horário.' },
  in_progress: { label: 'Em progresso', token: 'in-progress', description: 'Expansão em execução ativa.' },
  expansion_paused: {
    label: 'Expansão pausada',
    token: 'expansion-paused',
    description: 'Expansão em andamento foi pausada manualmente.',
  },
  expansion_completed: {
    label: 'Expansão concluída',
    token: 'expansion-completed',
    description: 'Expansão finalizada com sucesso.',
  },
  rollback: { label: 'Rollback', token: 'rollback', description: 'Release revertida completamente (terminal).' },
  stepback: { label: 'Stepback', token: 'stepback', description: 'Release revertida para a audiência anterior (terminal).' },
  canceled: { label: 'Cancelado', token: 'canceled', description: 'Release cancelada (terminal).' },
};

export function isTerminalStatus(status: ReleaseStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}
