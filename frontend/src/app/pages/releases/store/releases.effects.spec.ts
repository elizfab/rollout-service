import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { ReleasesDataService } from '../../../core/services/releases-data.service';
import { makeRelease } from '../../../testing/release.fixture';
import { ReleaseDetailPageActions, ReleasesApiActions, ReleasesPageActions } from './releases.actions';
import * as effects from './releases.effects';
import { initialReleasesState } from './releases.reducer';

describe('releases effects', () => {
  let actions$: Observable<Action>;
  const data = {
    list: jest.fn(),
    getById: jest.fn(),
    executeAction: jest.fn(),
    resetMock: jest.fn(),
    replaceMock: jest.fn(),
  };
  const message = { success: jest.fn(), error: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({ initialState: { releases: initialReleasesState } }),
        { provide: ReleasesDataService, useValue: data },
        { provide: NzMessageService, useValue: message },
      ],
    });
  });

  const run = <T>(effect: () => Observable<T>) => TestBed.runInInjectionContext(effect);

  it('carrega a lista com filtros e paginação do estado', async () => {
    const page = { items: [makeRelease()], pagination: { page: 1, limit: 100, total: 1 } };
    data.list.mockReturnValue(of(page));
    actions$ = of(ReleasesPageActions.opened());
    expect(await firstValueFrom(run(() => effects.loadReleases()))).toEqual(ReleasesApiActions.loadSuccess({ page }));
    expect(data.list).toHaveBeenCalledWith({ filters: initialReleasesState.filters, page: 1, limit: 100 });
  });

  it('reset e import mexem no mock antes de recarregar', async () => {
    data.list.mockReturnValue(throwError(() => new Error('falhou')));
    actions$ = of(ReleasesPageActions.mockResetRequested());
    const result = await firstValueFrom(run(() => effects.loadReleases()));
    expect(data.resetMock).toHaveBeenCalled();
    expect(result.type).toBe(ReleasesApiActions.loadFailure.type);

    data.list.mockReturnValue(of({ items: [], pagination: { page: 1, limit: 100, total: 0 } }));
    actions$ = of(ReleasesPageActions.mockImported({ releases: [] }));
    await firstValueFrom(run(() => effects.loadReleases()));
    expect(data.replaceMock).toHaveBeenCalledWith([]);
  });

  it('carrega o detalhe (sucesso e falha)', async () => {
    const release = makeRelease();
    data.getById.mockReturnValue(of(release));
    actions$ = of(ReleaseDetailPageActions.opened({ id: release.id }));
    expect(await firstValueFrom(run(() => effects.loadReleaseDetail()))).toEqual(ReleasesApiActions.detailLoadSuccess({ release }));

    data.getById.mockReturnValue(throwError(() => new Error('x')));
    expect((await firstValueFrom(run(() => effects.loadReleaseDetail()))).type).toBe(ReleasesApiActions.detailLoadFailure.type);
  });

  it('ações em lote usam o cenário batch e individuais o cenário individual', async () => {
    const request = { action: 'cancel' as const, reason: 'x' };
    data.executeAction.mockReturnValue(of([makeRelease({ status: 'canceled' })]));

    actions$ = of(ReleasesPageActions.batchActionRequested({ ids: ['a', 'b'], request }));
    await firstValueFrom(run(() => effects.executeBatchAction()));
    expect(data.executeAction).toHaveBeenCalledWith(['a', 'b'], request, 'batch');

    actions$ = of(ReleaseDetailPageActions.actionRequested({ id: 'a', request }));
    await firstValueFrom(run(() => effects.executeIndividualAction()));
    expect(data.executeAction).toHaveBeenCalledWith(['a'], request, 'individual');

    data.executeAction.mockReturnValue(throwError(() => new Error('não pode')));
    actions$ = of(ReleaseDetailPageActions.actionRequested({ id: 'a', request }));
    expect((await firstValueFrom(run(() => effects.executeIndividualAction()))).type).toBe(ReleasesApiActions.actionFailure.type);
    actions$ = of(ReleasesPageActions.batchActionRequested({ ids: ['a'], request }));
    expect((await firstValueFrom(run(() => effects.executeBatchAction()))).type).toBe(ReleasesApiActions.actionFailure.type);
  });

  it('mostra mensagens de sucesso e erro', async () => {
    actions$ = of(ReleasesApiActions.actionSuccess({ releases: [makeRelease(), makeRelease({ id: 'r2' })], action: 'pause' }));
    await firstValueFrom(run(() => effects.notifyActionResult()));
    expect(message.success).toHaveBeenCalledWith('Pausar: 2 releases atualizadas.');

    actions$ = of(ReleasesApiActions.loadFailure({ error: { code: 'X', message: 'Backend fora' } }));
    await firstValueFrom(run(() => effects.notifyActionResult()));
    expect(message.error).toHaveBeenCalledWith('Backend fora');
  });
});
