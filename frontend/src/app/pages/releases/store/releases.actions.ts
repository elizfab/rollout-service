import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ApiError } from '../../../core/models/api-response.model';
import { Paginated } from '../../../core/models/pagination.model';
import { ReleaseActionRequest } from '../../../models/release-action.model';
import { Release, ReleaseFilters } from '../../../models/release.model';

export type ReleasesView = 'trains' | 'table';

/** Eventos disparados pela tela de listagem. */
export const ReleasesPageActions = createActionGroup({
  source: 'Releases Page',
  events: {
    Opened: emptyProps(),
    'Filters Changed': props<{ filters: Partial<ReleaseFilters> }>(),
    'Page Changed': props<{ page: number; limit: number }>(),
    'View Changed': props<{ view: ReleasesView }>(),
    'Selection Changed': props<{ ids: string[] }>(),
    'Batch Action Requested': props<{ ids: string[]; request: ReleaseActionRequest }>(),
    'Mock Reset Requested': emptyProps(),
    'Mock Imported': props<{ releases: Release[] }>(),
  },
});

/** Eventos disparados pela tela de detalhe. */
export const ReleaseDetailPageActions = createActionGroup({
  source: 'Release Detail Page',
  events: {
    Opened: props<{ id: string }>(),
    'Action Requested': props<{ id: string; request: ReleaseActionRequest }>(),
  },
});

/** Resultados vindos da fonte de dados (mock ou API). */
export const ReleasesApiActions = createActionGroup({
  source: 'Releases API',
  events: {
    'Load Success': props<{ page: Paginated<Release> }>(),
    'Load Failure': props<{ error: ApiError }>(),
    'Detail Load Success': props<{ release: Release }>(),
    'Detail Load Failure': props<{ error: ApiError }>(),
    'Action Success': props<{ releases: Release[]; action: string }>(),
    'Action Failure': props<{ error: ApiError }>(),
  },
});
