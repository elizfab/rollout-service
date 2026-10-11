import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { Store, provideStore } from '@ngrx/store';
import { provideState } from '@ngrx/store';
import { NzMessageService } from 'ng-zorro-antd/message';
import { provideComponentTesting } from '../testing/test-providers';
import { makeRelease } from '../testing/release.fixture';
import { ImportExportService } from '../core/services/import-export.service';
import { PrintLayoutService } from '../core/services/print-layout.service';
import { ReleasesComponent, extractReleases } from './releases/releases.component';
import { ReleaseDetailComponent } from './release-detail/release-detail.component';
import { HealthComponent } from './health/health.component';
import { EmConstrucaoComponent } from './em-construcao/em-construcao.component';
import { NaoEncontradaComponent } from './nao-encontrada/nao-encontrada.component';
import { ReleasesApiActions, ReleasesPageActions, releasesFeature } from './releases/store';

const routeMeta = { title: 'Releases', section: 'rollouts', endpoints: ['GET /v1/releases'] };

function setup() {
  const message = { success: jest.fn(), error: jest.fn(), info: jest.fn() };
  TestBed.configureTestingModule({
    providers: [
      ...provideComponentTesting(),
      provideStore(),
      provideState(releasesFeature),
      { provide: ActivatedRoute, useValue: { snapshot: { data: routeMeta } } },
      { provide: NzMessageService, useValue: message },
    ],
  });
  const store = TestBed.inject(Store);
  const dispatch = jest.spyOn(store, 'dispatch');
  return { store, dispatch, message };
}

const items = [
  makeRelease({ id: 'r1', status: 'scheduled', releaseTrainId: 'rt-a', releaseTrainName: 'RT A' }),
  makeRelease({ id: 'r2', status: 'expansion_paused', releaseTrainId: 'rt-a', releaseTrainName: 'RT A' }),
  makeRelease({ id: 'r3', status: 'in_progress', releaseTrainId: null, releaseTrainName: null, audiences: ['A', 'B', 'C'] }),
];

describe('ReleasesComponent', () => {
  it('abre a página, mostra um acordeão por trem e o resumo por status', () => {
    const { store, dispatch } = setup();
    const f = TestBed.createComponent(ReleasesComponent);
    expect(dispatch).toHaveBeenCalledWith(ReleasesPageActions.opened());

    store.dispatch(ReleasesApiActions.loadSuccess({ page: { items, pagination: { page: 1, limit: 100, total: 3 } } }));
    f.detectChanges();

    const el: HTMLElement = f.nativeElement;
    expect(el.querySelectorAll('nz-collapse-panel')).toHaveLength(2);
    expect(el.querySelector('[data-testid="summary-scheduled"]')?.textContent).toContain('1');
    expect(el.textContent).toContain('Releases individuais');
  });

  it('seleção habilita só as ações em lote válidas e dispara a ação confirmada', () => {
    const { store, dispatch } = setup();
    const f = TestBed.createComponent(ReleasesComponent);
    store.dispatch(ReleasesApiActions.loadSuccess({ page: { items, pagination: { page: 1, limit: 100, total: 3 } } }));
    const c = f.componentInstance;

    c.toggleMany(items.slice(0, 2), true);
    expect(c.allChecked(items.slice(0, 2))).toBe(true);
    expect(c.someChecked(items)).toBe(true);
    expect(c.batchActions()).toEqual(['cancel', 'reschedule']);
    f.detectChanges();
    expect(f.nativeElement.querySelector('[data-testid="batch-bar"]')).toBeTruthy();

    c.confirmBatch({ action: 'cancel', reason: 'motivo' });
    expect(dispatch).toHaveBeenCalledWith(
      ReleasesPageActions.batchActionRequested({ ids: ['r1', 'r2'], request: { action: 'cancel', reason: 'motivo' } }),
    );

    c.toggleOne('r3', true);
    c.toggleOne('r3', false);
    c.clearSelection();
    expect(c.selectedIds()).toEqual([]);
  });

  it('filtros, visão e paginação viram ações do store', () => {
    jest.useFakeTimers();
    const { dispatch } = setup();
    const c = TestBed.createComponent(ReleasesComponent).componentInstance;

    c.onSearch('pix');
    jest.advanceTimersByTime(300);
    expect(dispatch).toHaveBeenCalledWith(ReleasesPageActions.filtersChanged({ filters: { search: 'pix' } }));

    c.toggleStatusFilter('scheduled');
    expect(dispatch).toHaveBeenCalledWith(ReleasesPageActions.filtersChanged({ filters: { statuses: ['scheduled'] } }));

    c.onViewChange('table');
    expect(dispatch).toHaveBeenCalledWith(ReleasesPageActions.viewChanged({ view: 'table' }));

    c.onTableQuery({ pageIndex: 2, pageSize: 10, sort: [], filter: [] });
    expect(dispatch).toHaveBeenCalledWith(ReleasesPageActions.pageChanged({ page: 2, limit: 10 }));

    c.reload();
    c.resetMock();
    expect(dispatch).toHaveBeenCalledWith(ReleasesPageActions.mockResetRequested());
    jest.useRealTimers();
  });

  it('exporta, imprime e importa o mock', async () => {
    const { store, dispatch, message } = setup();
    const io = TestBed.inject(ImportExportService);
    const csv = jest.spyOn(io, 'exportCsv').mockImplementation(() => undefined);
    const json = jest.spyOn(io, 'exportJson').mockImplementation(() => undefined);
    const print = jest.spyOn(TestBed.inject(PrintLayoutService), 'print').mockImplementation(() => undefined);
    const c = TestBed.createComponent(ReleasesComponent).componentInstance;
    store.dispatch(ReleasesApiActions.loadSuccess({ page: { items, pagination: { page: 1, limit: 100, total: 3 } } }));

    c.exportCsv();
    c.exportJson();
    c.print();
    expect(csv.mock.calls[0][1]).toHaveLength(3);
    csv.mock.calls[0][2].forEach((col) => expect(col.value(items[0])).toBeDefined());
    expect(json).toHaveBeenCalled();
    expect(print).toHaveBeenCalled();

    const input = { files: [new File([JSON.stringify(items)], 'm.json')], value: 'x' } as unknown as HTMLInputElement;
    await c.importJson(input);
    expect(dispatch).toHaveBeenCalledWith(ReleasesPageActions.mockImported({ releases: items }));

    const bad = { files: [new File(['{}'], 'b.json')], value: 'x' } as unknown as HTMLInputElement;
    await c.importJson(bad);
    expect(message.error).toHaveBeenCalled();
    await c.importJson({ files: [], value: '' } as unknown as HTMLInputElement);
  });

  it('extractReleases aceita array ou envelope', () => {
    expect(extractReleases(items)).toHaveLength(3);
    expect(extractReleases({ data: { items } })).toHaveLength(3);
    expect(() => extractReleases({ foo: 1 })).toThrow('Formato inválido');
  });
});

describe('ReleaseDetailComponent', () => {
  it('abre a release do parâmetro e mostra os botões conforme a regra', () => {
    const { store, dispatch } = setup();
    const f = TestBed.createComponent(ReleaseDetailComponent);
    f.componentRef.setInput('id', 'r2');
    f.detectChanges();
    TestBed.flushEffects();
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ id: 'r2' }));

    store.dispatch(ReleasesApiActions.detailLoadSuccess({ release: items[1] }));
    f.detectChanges();
    const c = f.componentInstance;
    expect(c.isAllowed('resume')).toBe(true);
    expect(c.isAllowed('stepback')).toBe(false);
    expect(c.disabledReason('stepback')).toContain('Expansão pausada');
    expect(c.disabledReason('resume')).toBe('');
    expect(c.terminal()).toBe(false);
    expect(f.nativeElement.querySelector('[data-testid="action-stepback"]').disabled).toBe(true);

    c.confirm({ action: 'resume', reason: 'estável de novo' });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'r2', request: { action: 'resume', reason: 'estável de novo' } }),
    );
  });
});

describe('páginas simples', () => {
  it('HealthComponent mostra o status do backend', () => {
    setup();
    const f = TestBed.createComponent(HealthComponent);
    f.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('mocks/checks.json')
      .flush({ status: 'ok', service: 'rollout', checks: [{ name: 'api', status: 'ok', latencyMs: 3 }] });
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('rollout');
  });

  it('HealthComponent mostra erro quando o backend não responde', () => {
    setup();
    const f = TestBed.createComponent(HealthComponent);
    f.detectChanges();
    TestBed.inject(HttpTestingController).expectOne('mocks/checks.json').error(new ProgressEvent('error'));
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Backend indisponível');
  });

  it('EmConstrucao e NaoEncontrada renderizam', () => {
    setup();
    const a = TestBed.createComponent(EmConstrucaoComponent);
    a.detectChanges();
    expect(a.nativeElement.textContent).toContain('GET /v1/releases');
    const b = TestBed.createComponent(NaoEncontradaComponent);
    b.detectChanges();
    expect(b.nativeElement.textContent).toContain('Página não encontrada');
  });
});
