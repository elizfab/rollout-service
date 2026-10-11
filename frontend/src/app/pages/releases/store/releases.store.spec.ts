import { makeRelease } from '../../../testing/release.fixture';
import { ReleaseDetailPageActions, ReleasesApiActions, ReleasesPageActions } from './releases.actions';
import { TRAINS_VIEW_LIMIT, initialReleasesState, releasesFeature } from './releases.reducer';
import {
  selectAllowedBatchActions,
  selectDetailAllowedActions,
  selectDetailRelease,
  selectPageReleases,
  selectReleaseTrainGroups,
  selectStatusCounts,
} from './releases.selectors';

const reducer = releasesFeature.reducer;

const r1 = makeRelease({ id: 'r1', status: 'scheduled', releaseTrainId: 'rt-b', releaseTrainName: 'B', scheduledAt: '2026-10-12T13:00:00Z' });
const r2 = makeRelease({ id: 'r2', status: 'expansion_paused', releaseTrainId: 'rt-a', releaseTrainName: 'A', scheduledAt: '2026-10-12T06:00:00Z' });
const r3 = makeRelease({ id: 'r3', status: 'in_progress', releaseTrainId: null, releaseTrainName: null });
const page = { items: [r1, r2, r3], pagination: { page: 1, limit: 100, total: 3 } };

function loaded() {
  return reducer(initialReleasesState, ReleasesApiActions.loadSuccess({ page }));
}

describe('releases reducer', () => {
  it('abre carregando e guarda a página', () => {
    expect(reducer(initialReleasesState, ReleasesPageActions.opened()).loading).toBe(true);
    const s = loaded();
    expect(s.pageIds).toEqual(['r1', 'r2', 'r3']);
    expect(s.loading).toBe(false);
  });

  it('filtro volta para a página 1 e limpa a seleção', () => {
    let s = reducer(loaded(), ReleasesPageActions.selectionChanged({ ids: ['r1'] }));
    s = reducer({ ...s, pagination: { ...s.pagination, page: 3 } }, ReleasesPageActions.filtersChanged({ filters: { search: 'pix' } }));
    expect(s.filters.search).toBe('pix');
    expect(s.pagination.page).toBe(1);
    expect(s.selectedIds).toEqual([]);
  });

  it('trocar a visão ajusta o tamanho da página', () => {
    const table = reducer(loaded(), ReleasesPageActions.viewChanged({ view: 'table' }));
    expect(table.pagination.limit).toBe(10);
    expect(reducer(table, ReleasesPageActions.viewChanged({ view: 'trains' })).pagination.limit).toBe(TRAINS_VIEW_LIMIT);
    expect(reducer(table, ReleasesPageActions.pageChanged({ page: 2, limit: 20 })).pagination).toMatchObject({ page: 2, limit: 20 });
  });

  it('ação: pendente → sucesso atualiza a entidade e limpa a seleção', () => {
    let s = reducer(loaded(), ReleasesPageActions.selectionChanged({ ids: ['r1'] }));
    s = reducer(s, ReleasesPageActions.batchActionRequested({ ids: ['r1'], request: { action: 'cancel', reason: 'x' } }));
    expect(s.actionPending).toBe(true);
    s = reducer(s, ReleasesApiActions.actionSuccess({ releases: [{ ...r1, status: 'canceled' }], action: 'cancel' }));
    expect(s.actionPending).toBe(false);
    expect(s.entities['r1']?.status).toBe('canceled');
    expect(s.selectedIds).toEqual([]);
  });

  it('erros ficam no estado', () => {
    const error = { code: 'X', message: 'falhou' };
    expect(reducer(initialReleasesState, ReleasesApiActions.loadFailure({ error })).error).toEqual(error);
    expect(reducer(initialReleasesState, ReleasesApiActions.actionFailure({ error })).actionPending).toBe(false);
    expect(reducer(initialReleasesState, ReleasesApiActions.detailLoadFailure({ error })).detailLoading).toBe(false);
    expect(reducer(initialReleasesState, ReleasesPageActions.mockResetRequested()).loading).toBe(true);
  });

  it('detalhe: abre e recebe a release', () => {
    let s = reducer(initialReleasesState, ReleaseDetailPageActions.opened({ id: 'r2' }));
    expect(s.detailLoading).toBe(true);
    s = reducer(s, ReleasesApiActions.detailLoadSuccess({ release: r2 }));
    expect(selectDetailRelease.projector(s.entities, s.detailId)).toEqual(r2);
  });
});

describe('releases selectors', () => {
  const s = loaded();
  const releases = selectPageReleases.projector(s.entities, s.pageIds);

  it('agrupa por trem em ordem de horário, com individuais por último', () => {
    const groups = selectReleaseTrainGroups.projector(releases);
    expect(groups.map((g) => g.name)).toEqual(['A', 'B', 'Releases individuais']);
    expect(groups[0].counts).toEqual({ expansion_paused: 1 });
  });

  it('conta releases por status', () => {
    const counts = selectStatusCounts.projector(releases);
    expect(counts.find((c) => c.status === 'scheduled')?.count).toBe(1);
    expect(counts).toHaveLength(8);
  });

  it('ações em lote e individuais seguem as regras', () => {
    expect(selectAllowedBatchActions.projector([r1, r2])).toEqual(['cancel', 'reschedule']);
    expect(selectDetailAllowedActions.projector(r2)).toEqual(['resume', 'cancel', 'rollback']);
    expect(selectDetailAllowedActions.projector(null)).toEqual([]);
  });
});
