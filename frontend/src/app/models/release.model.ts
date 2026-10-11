import { ReleaseStatus } from './release-status.model';

/** Uma mudança de status registrada no histórico da release. */
export interface ReleaseStatusHistoryEntry {
  status: ReleaseStatus;
  observation: string;
  changedBy: string;
  createdAt: string; // ISO 8601
}

/**
 * Release (liberação de um pacote para audiências).
 * Campos alinhados ao plano do backend (docs/plano-desenvolvimento-release-trains.md)
 * e enriquecidos com nomes (application, release train) para a tela não precisar
 * de N chamadas extras.
 */
export interface Release {
  id: string;
  packageId: string;
  packageStory: string;
  applicationId: string;
  applicationName: string;
  releaseTrainId: string | null;
  releaseTrainName: string | null;
  releaseTrainScheduleId: string | null;
  status: ReleaseStatus;
  gmud: string;
  racf: string;
  /** Percentual da expansão (0–100). */
  progress: number;
  releaseDate: string; // YYYY-MM-DD
  scheduledAt: string; // ISO 8601
  audiences: string[];
  statusHistory: ReleaseStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

/** Filtros da listagem de releases. */
export interface ReleaseFilters {
  search: string;
  statuses: ReleaseStatus[];
  releaseTrainId: string | null;
}

export const EMPTY_RELEASE_FILTERS: ReleaseFilters = { search: '', statuses: [], releaseTrainId: null };
