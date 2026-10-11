import { createSelector } from '@ngrx/store';
import { allowedBatchActions, allowedIndividualActions } from '../../../models/release-action.rules';
import { RELEASE_STATUSES, ReleaseStatus } from '../../../models/release-status.model';
import { Release } from '../../../models/release.model';
import { releasesFeature } from './releases.reducer';

const { selectEntities, selectPageIds, selectSelectedIds, selectDetailId } = releasesFeature;

/** Releases da página atual, na ordem da fonte de dados. */
export const selectPageReleases = createSelector(selectEntities, selectPageIds, (entities, ids) =>
  ids.map((id) => entities[id]).filter((r): r is Release => !!r),
);

export interface ReleaseTrainGroup {
  key: string;
  releaseTrainId: string | null;
  name: string;
  scheduledAt: string;
  releases: Release[];
  counts: Partial<Record<ReleaseStatus, number>>;
}

/** Agrupa as releases por release train (acordeões). Releases sem trem vão para "Individuais". */
export const selectReleaseTrainGroups = createSelector(selectPageReleases, (releases): ReleaseTrainGroup[] => {
  const groups = new Map<string, ReleaseTrainGroup>();
  for (const r of releases) {
    const key = r.releaseTrainId ?? 'individual';
    let g = groups.get(key);
    if (!g) {
      g = {
        key,
        releaseTrainId: r.releaseTrainId,
        name: r.releaseTrainName ?? 'Releases individuais',
        scheduledAt: r.scheduledAt,
        releases: [],
        counts: {},
      };
      groups.set(key, g);
    }
    g.releases.push(r);
    g.counts[r.status] = (g.counts[r.status] ?? 0) + 1;
    if (r.scheduledAt < g.scheduledAt) g.scheduledAt = r.scheduledAt;
  }
  return [...groups.values()].sort((a, b) => {
    if (a.releaseTrainId === null) return 1;
    if (b.releaseTrainId === null) return -1;
    return a.scheduledAt.localeCompare(b.scheduledAt);
  });
});

/** Contagem por status da página atual (cards de resumo). */
export const selectStatusCounts = createSelector(selectPageReleases, (releases) =>
  RELEASE_STATUSES.map((status) => ({ status, count: releases.filter((r) => r.status === status).length })),
);

export const selectSelectedReleases = createSelector(selectEntities, selectSelectedIds, (entities, ids) =>
  ids.map((id) => entities[id]).filter((r): r is Release => !!r),
);

/** Ações em lote válidas para TODAS as releases selecionadas (Cenário 1). */
export const selectAllowedBatchActions = createSelector(selectSelectedReleases, (selected) =>
  allowedBatchActions(selected.map((r) => r.status)),
);

export const selectDetailRelease = createSelector(selectEntities, selectDetailId, (entities, id) =>
  id ? (entities[id] ?? null) : null,
);

/** Ações individuais válidas para a release aberta (Cenário 2). */
export const selectDetailAllowedActions = createSelector(selectDetailRelease, (release) =>
  release ? allowedIndividualActions(release.status) : [],
);
