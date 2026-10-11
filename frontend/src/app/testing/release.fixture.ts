import { Release } from '../models/release.model';
import { ReleaseStatus } from '../models/release-status.model';

/** Fábrica de releases para testes. Sobrescreva só o que importa no cenário. */
export function makeRelease(overrides: Partial<Release> = {}): Release {
  const id = overrides.id ?? 'rel-0001';
  const status: ReleaseStatus = overrides.status ?? 'scheduled';
  return {
    id,
    packageId: 'pkg-0001',
    packageStory: 'STORY-1 · Teste',
    applicationId: 'app-01',
    applicationName: 'superapp-pix',
    releaseTrainId: 'rt-1',
    releaseTrainName: 'RT 12/10 · Manhã',
    releaseTrainScheduleId: 'sch-manha',
    status,
    gmud: 'GMUD0000001',
    racf: 'RACF001',
    progress: 0,
    releaseDate: '2026-10-12',
    scheduledAt: '2026-10-12T09:00:00.000Z',
    audiences: ['ITUBER'],
    statusHistory: [{ status, observation: 'criada', changedBy: 'teste', createdAt: '2026-10-10T09:00:00.000Z' }],
    createdAt: '2026-10-10T09:00:00.000Z',
    updatedAt: '2026-10-10T09:00:00.000Z',
    ...overrides,
  };
}
