import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, concatMap, exhaustMap, map, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { toApiError } from '../../../core/interceptors/api-error.interceptor';
import { ReleasesDataService } from '../../../core/services/releases-data.service';
import { RELEASE_ACTION_META, ReleaseAction } from '../../../models/release-action.model';
import { ReleaseDetailPageActions, ReleasesApiActions, ReleasesPageActions } from './releases.actions';
import { releasesFeature } from './releases.reducer';

/** Carrega a lista sempre que algo que muda o resultado acontece. */
export const loadReleases = createEffect(
  (actions$ = inject(Actions), store = inject(Store), data = inject(ReleasesDataService)) =>
    actions$.pipe(
      ofType(
        ReleasesPageActions.opened,
        ReleasesPageActions.filtersChanged,
        ReleasesPageActions.pageChanged,
        ReleasesPageActions.viewChanged,
        ReleasesPageActions.mockResetRequested,
        ReleasesPageActions.mockImported,
      ),
      tap((action) => {
        if (action.type === ReleasesPageActions.mockResetRequested.type) data.resetMock();
        if (action.type === ReleasesPageActions.mockImported.type) data.replaceMock(action.releases);
      }),
      withLatestFrom(store.select(releasesFeature.selectFilters), store.select(releasesFeature.selectPagination)),
      switchMap(([, filters, pagination]) =>
        data.list({ filters, page: pagination.page, limit: pagination.limit }).pipe(
          map((page) => ReleasesApiActions.loadSuccess({ page })),
          catchError((err: unknown) => of(ReleasesApiActions.loadFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const loadReleaseDetail = createEffect(
  (actions$ = inject(Actions), data = inject(ReleasesDataService)) =>
    actions$.pipe(
      ofType(ReleaseDetailPageActions.opened),
      switchMap(({ id }) =>
        data.getById(id).pipe(
          map((release) => ReleasesApiActions.detailLoadSuccess({ release })),
          catchError((err: unknown) => of(ReleasesApiActions.detailLoadFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

/** Ação em lote (Cenário 1). `exhaustMap` ignora cliques repetidos enquanto a anterior roda. */
export const executeBatchAction = createEffect(
  (actions$ = inject(Actions), data = inject(ReleasesDataService)) =>
    actions$.pipe(
      ofType(ReleasesPageActions.batchActionRequested),
      exhaustMap(({ ids, request }) =>
        data.executeAction(ids, request, 'batch').pipe(
          map((releases) => ReleasesApiActions.actionSuccess({ releases, action: request.action })),
          catchError((err: unknown) => of(ReleasesApiActions.actionFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

/** Ação individual (Cenário 2). */
export const executeIndividualAction = createEffect(
  (actions$ = inject(Actions), data = inject(ReleasesDataService)) =>
    actions$.pipe(
      ofType(ReleaseDetailPageActions.actionRequested),
      concatMap(({ id, request }) =>
        data.executeAction([id], request, 'individual').pipe(
          map((releases) => ReleasesApiActions.actionSuccess({ releases, action: request.action })),
          catchError((err: unknown) => of(ReleasesApiActions.actionFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

/** Feedback visual (não altera estado). */
export const notifyActionResult = createEffect(
  (actions$ = inject(Actions), message = inject(NzMessageService)) =>
    actions$.pipe(
      ofType(ReleasesApiActions.actionSuccess, ReleasesApiActions.actionFailure, ReleasesApiActions.loadFailure),
      tap((action) => {
        if (action.type === ReleasesApiActions.actionSuccess.type) {
          const label = RELEASE_ACTION_META[action.action as ReleaseAction]?.label ?? action.action;
          const n = action.releases.length;
          message.success(`${label}: ${n} release${n === 1 ? '' : 's'} atualizada${n === 1 ? '' : 's'}.`);
        } else {
          message.error(action.error.message);
        }
      }),
    ),
  { functional: true, dispatch: false },
);
