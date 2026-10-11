import { EntityAdapter, EntityState, createEntityAdapter } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { ApiError } from '../../../core/models/api-response.model';
import { DEFAULT_PAGE_SIZE, Pagination } from '../../../core/models/pagination.model';
import { EMPTY_RELEASE_FILTERS, Release, ReleaseFilters } from '../../../models/release.model';
import { ReleaseDetailPageActions, ReleasesApiActions, ReleasesPageActions, ReleasesView } from './releases.actions';

export interface ReleasesState extends EntityState<Release> {
  /** IDs da página atual, na ordem em que vieram da fonte de dados. */
  pageIds: string[];
  pagination: Pagination;
  filters: ReleaseFilters;
  view: ReleasesView;
  selectedIds: string[];
  detailId: string | null;
  loading: boolean;
  detailLoading: boolean;
  actionPending: boolean;
  error: ApiError | null;
}

export const releasesAdapter: EntityAdapter<Release> = createEntityAdapter<Release>();

/** Na visão por release train buscamos o máximo permitido para agrupar tudo. */
export const TRAINS_VIEW_LIMIT = 100;

export const initialReleasesState: ReleasesState = releasesAdapter.getInitialState({
  pageIds: [],
  pagination: { page: 1, limit: TRAINS_VIEW_LIMIT, total: 0 },
  filters: EMPTY_RELEASE_FILTERS,
  view: 'trains',
  selectedIds: [],
  detailId: null,
  loading: false,
  detailLoading: false,
  actionPending: false,
  error: null,
});

export const releasesFeature = createFeature({
  name: 'releases',
  reducer: createReducer(
    initialReleasesState,

    on(ReleasesPageActions.opened, (s): ReleasesState => ({ ...s, loading: true, error: null })),

    on(ReleasesPageActions.filtersChanged, (s, { filters }): ReleasesState => ({
      ...s,
      filters: { ...s.filters, ...filters },
      pagination: { ...s.pagination, page: 1 },
      selectedIds: [],
      loading: true,
    })),

    on(ReleasesPageActions.pageChanged, (s, { page, limit }): ReleasesState => ({
      ...s,
      pagination: { ...s.pagination, page, limit },
      loading: true,
    })),

    on(ReleasesPageActions.viewChanged, (s, { view }): ReleasesState => ({
      ...s,
      view,
      selectedIds: [],
      pagination: { ...s.pagination, page: 1, limit: view === 'trains' ? TRAINS_VIEW_LIMIT : DEFAULT_PAGE_SIZE },
      loading: true,
    })),

    on(ReleasesPageActions.selectionChanged, (s, { ids }): ReleasesState => ({ ...s, selectedIds: ids })),

    on(ReleasesPageActions.mockResetRequested, ReleasesPageActions.mockImported, (s): ReleasesState => ({
      ...s,
      selectedIds: [],
      loading: true,
    })),

    on(ReleasesApiActions.loadSuccess, (s, { page }): ReleasesState =>
      releasesAdapter.upsertMany(page.items, {
        ...s,
        pageIds: page.items.map((r) => r.id),
        pagination: page.pagination,
        loading: false,
        error: null,
      }),
    ),

    on(ReleasesApiActions.loadFailure, (s, { error }): ReleasesState => ({ ...s, loading: false, error })),

    on(ReleaseDetailPageActions.opened, (s, { id }): ReleasesState => ({
      ...s,
      detailId: id,
      detailLoading: true,
      error: null,
    })),

    on(ReleasesApiActions.detailLoadSuccess, (s, { release }): ReleasesState =>
      releasesAdapter.upsertOne(release, { ...s, detailLoading: false }),
    ),

    on(ReleasesApiActions.detailLoadFailure, (s, { error }): ReleasesState => ({ ...s, detailLoading: false, error })),

    on(
      ReleasesPageActions.batchActionRequested,
      ReleaseDetailPageActions.actionRequested,
      (s): ReleasesState => ({ ...s, actionPending: true }),
    ),

    on(ReleasesApiActions.actionSuccess, (s, { releases }): ReleasesState =>
      releasesAdapter.upsertMany(releases, { ...s, actionPending: false, selectedIds: [] }),
    ),

    on(ReleasesApiActions.actionFailure, (s, { error }): ReleasesState => ({ ...s, actionPending: false, error })),
  ),
});
