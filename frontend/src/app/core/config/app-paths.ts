/**
 * Caminhos das rotas do frontend, em um só lugar.
 * Use sempre estas constantes em routerLink e navigate(); nunca strings soltas.
 *
 * Os segmentos seguem os recursos da API (docs/proposta/endpoints), para que
 * cada tela seja fácil de ligar ao endpoint correspondente.
 */
export const APP_PATHS = {
  releases: 'releases',
  releaseTrains: 'release-trains',
  releaseTrainSchedules: 'release-train-schedules',
  releaseTrainBlocks: 'release-train-blocks',
  applications: 'applications',
  packages: 'packages',
  packageValidations: 'validations',
  audiences: 'audiences',
  releaseStatuses: 'release-statuses',
  releaseTrainStatuses: 'release-train-statuses',
  checks: 'checks',
} as const;

/** Monta um link absoluto, ex.: link('releases', id) → ['/', 'releases', id] */
export function link(...segments: (string | number)[]): string[] {
  return ['/', ...segments.map(String)];
}
