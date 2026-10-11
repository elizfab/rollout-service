/**
 * Endpoints do backend (docs/proposta/endpoints).
 * Os caminhos são relativos a `environment.apiUrl + environment.apiPrefix`.
 */
export const API_ENDPOINTS = {
  checks: '/checks',
  releases: '/releases',
  release: (id: string) => `/releases/${id}`,
  releaseTrains: '/release-trains',
  releaseTrain: (id: string) => `/release-trains/${id}`,
  releaseTrainReleases: (id: string) => `/release-trains/${id}/releases`,
  releaseTrainBatchActions: '/release-trains/batch-actions',
  releaseTrainSchedules: '/release-train-schedules',
  releaseTrainSchedule: (id: string) => `/release-train-schedules/${id}`,
  releaseTrainBlocks: '/release-train-blocks',
  releaseTrainBlock: (id: string) => `/release-train-blocks/${id}`,
  applications: '/applications',
  application: (id: string) => `/applications/${id}`,
  applicationPackages: (id: string) => `/applications/${id}/packages`,
  packages: '/packages',
  package: (id: string) => `/packages/${id}`,
  packageReleaseAudiences: (id: string) => `/packages/${id}/releases/audiences`,
  packageValidations: '/packages/validations',
  audiences: '/audiences',
  audience: (id: string) => `/audiences/${id}`,
  audiencesByParent: (parentId: string) => `/audiences/by-parent/${parentId}`,
  releaseStatuses: '/release-statuses',
  releaseStatus: (id: string) => `/release-statuses/${id}`,
  releaseTrainStatuses: '/release-train-statuses',
  releaseTrainStatus: (id: string) => `/release-train-statuses/${id}`,
} as const;

/** Arquivos de mock em `public/mocks` usados quando dataSource = 'mock'. */
export const MOCK_FILES = {
  releases: 'mocks/releases.json',
  checks: 'mocks/checks.json',
} as const;
