import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { RouteMeta } from '../../core/models/route-data.model';
import { CsvColumn, ImportExportService } from '../../core/services/import-export.service';
import { PrintLayoutService } from '../../core/services/print-layout.service';
import { ReleasesDataService } from '../../core/services/releases-data.service';
import { BatchReleaseAction, RELEASE_ACTION_META, ReleaseActionRequest } from '../../models/release-action.model';
import { RELEASE_STATUSES, RELEASE_STATUS_META, ReleaseStatus } from '../../models/release-status.model';
import { Release } from '../../models/release.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ReleaseActionModalComponent } from '../../shared/components/release-action-modal/release-action-modal.component';
import { StatusTagComponent } from '../../shared/components/status-tag/status-tag.component';
import {
  ReleasesPageActions,
  ReleasesView,
  releasesFeature,
  selectAllowedBatchActions,
  selectPageReleases,
  selectReleaseTrainGroups,
  selectStatusCounts,
} from './store';

/**
 * Página de releases.
 *  • Visão "Por release train": acordeões (nz-collapse), um por trem, cada um
 *    com sua tabela. É a tela do Cenário 1 (ações em lote).
 *  • Visão "Tabela": uma tabela única com paginação vinda da fonte de dados.
 * Todo o estado mora no NgRx; o componente só lê selectors e despacha ações.
 */
@Component({
  selector: 'rs-releases',
  imports: [
    DatePipe,
    NgTemplateOutlet,
    FormsModule,
    RouterLink,
    NzButtonModule,
    NzCollapseModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzProgressModule,
    NzSegmentedModule,
    NzSelectModule,
    NzSkeletonModule,
    NzTableModule,
    NzTagModule,
    NzToolTipModule,
    PageHeaderComponent,
    StatusTagComponent,
    ReleaseActionModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './releases.component.html',
  styleUrl: './releases.component.scss',
})
export class ReleasesComponent {
  private readonly store = inject(Store);
  private readonly importExport = inject(ImportExportService);
  private readonly printer = inject(PrintLayoutService);
  private readonly message = inject(NzMessageService);
  readonly data = inject(ReleasesDataService);
  readonly meta = inject(ActivatedRoute).snapshot.data as RouteMeta;

  // Estado (NgRx → signals)
  readonly loading = this.store.selectSignal(releasesFeature.selectLoading);
  readonly actionPending = this.store.selectSignal(releasesFeature.selectActionPending);
  readonly filters = this.store.selectSignal(releasesFeature.selectFilters);
  readonly pagination = this.store.selectSignal(releasesFeature.selectPagination);
  readonly view = this.store.selectSignal(releasesFeature.selectView);
  readonly selectedIds = this.store.selectSignal(releasesFeature.selectSelectedIds);
  readonly releases = this.store.selectSignal(selectPageReleases);
  readonly groups = this.store.selectSignal(selectReleaseTrainGroups);
  readonly statusCounts = this.store.selectSignal(selectStatusCounts);
  readonly batchActions = this.store.selectSignal(selectAllowedBatchActions);

  // Estado local de UI
  readonly pendingAction = signal<BatchReleaseAction | null>(null);
  readonly selectedSet = computed(() => new Set(this.selectedIds()));

  readonly statusOptions = RELEASE_STATUSES.map((s) => ({ value: s, label: RELEASE_STATUS_META[s].label }));
  readonly viewOptions = [
    { label: 'Por release train', value: 'trains' },
    { label: 'Tabela', value: 'table' },
  ];
  readonly actionMeta = RELEASE_ACTION_META;
  readonly statusMeta = RELEASE_STATUS_META;

  private readonly search$ = new Subject<string>();

  constructor() {
    this.store.dispatch(ReleasesPageActions.opened());
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((search) => this.store.dispatch(ReleasesPageActions.filtersChanged({ filters: { search } })));
  }

  // Filtros e visão ------------------------------------------------------------
  onSearch(term: string): void {
    this.search$.next(term);
  }

  onStatusesChange(statuses: ReleaseStatus[]): void {
    this.store.dispatch(ReleasesPageActions.filtersChanged({ filters: { statuses } }));
  }

  toggleStatusFilter(status: ReleaseStatus): void {
    const current = this.filters().statuses;
    const statuses = current.includes(status) ? current.filter((s) => s !== status) : [...current, status];
    this.onStatusesChange(statuses);
  }

  onViewChange(view: string | number): void {
    this.store.dispatch(ReleasesPageActions.viewChanged({ view: view as ReleasesView }));
  }

  onTableQuery(params: NzTableQueryParams): void {
    const { pageIndex, pageSize } = params;
    const p = this.pagination();
    if (pageIndex !== p.page || pageSize !== p.limit) {
      this.store.dispatch(ReleasesPageActions.pageChanged({ page: pageIndex, limit: pageSize }));
    }
  }

  reload(): void {
    this.store.dispatch(ReleasesPageActions.opened());
  }

  // Seleção ---------------------------------------------------------------------
  isSelected(id: string): boolean {
    return this.selectedSet().has(id);
  }

  toggleOne(id: string, checked: boolean): void {
    const ids = checked ? [...this.selectedIds(), id] : this.selectedIds().filter((x) => x !== id);
    this.store.dispatch(ReleasesPageActions.selectionChanged({ ids }));
  }

  toggleMany(rows: readonly Release[], checked: boolean): void {
    const rowIds = rows.map((r) => r.id);
    const others = this.selectedIds().filter((id) => !rowIds.includes(id));
    this.store.dispatch(ReleasesPageActions.selectionChanged({ ids: checked ? [...others, ...rowIds] : others }));
  }

  allChecked(rows: readonly Release[]): boolean {
    return rows.length > 0 && rows.every((r) => this.isSelected(r.id));
  }

  someChecked(rows: readonly Release[]): boolean {
    return rows.some((r) => this.isSelected(r.id)) && !this.allChecked(rows);
  }

  clearSelection(): void {
    this.store.dispatch(ReleasesPageActions.selectionChanged({ ids: [] }));
  }

  // Ações em lote -------------------------------------------------------------
  confirmBatch(request: ReleaseActionRequest): void {
    this.store.dispatch(ReleasesPageActions.batchActionRequested({ ids: this.selectedIds(), request }));
    this.pendingAction.set(null);
  }

  // Exportar / importar / imprimir ------------------------------------------------
  exportCsv(): void {
    const columns: CsvColumn<Release>[] = [
      { header: 'ID', value: (r) => r.id },
      { header: 'Release train', value: (r) => r.releaseTrainName ?? 'Individual' },
      { header: 'Aplicação', value: (r) => r.applicationName },
      { header: 'Pacote', value: (r) => r.packageStory },
      { header: 'GMUD', value: (r) => r.gmud },
      { header: 'Status', value: (r) => RELEASE_STATUS_META[r.status].label },
      { header: 'Progresso (%)', value: (r) => r.progress },
      { header: 'Agendado em', value: (r) => r.scheduledAt },
      { header: 'Audiências', value: (r) => r.audiences.join(', ') },
    ];
    this.importExport.exportCsv(`releases-${today()}`, this.releases(), columns);
  }

  exportJson(): void {
    this.importExport.exportJson(`releases-${today()}`, this.releases());
  }

  async importJson(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const content = await this.importExport.readJsonFile<unknown>(file);
      const releases = extractReleases(content);
      this.store.dispatch(ReleasesPageActions.mockImported({ releases }));
      this.message.success(`${releases.length} releases importadas para o mock local.`);
    } catch (err) {
      this.message.error(err instanceof Error ? err.message : 'Não foi possível importar o arquivo.');
    }
  }

  resetMock(): void {
    this.store.dispatch(ReleasesPageActions.mockResetRequested());
    this.message.info('Mock restaurado a partir de public/mocks/releases.json.');
  }

  print(): void {
    this.printer.print(`Releases — ${today()}`);
  }

  trackRelease = (_: number, r: Release) => r.id;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Aceita tanto um array de releases quanto o envelope { data: { items } } do mock. */
export function extractReleases(content: unknown): Release[] {
  const candidate = Array.isArray(content)
    ? content
    : (content as { data?: { items?: unknown } } | null)?.data?.items;
  if (!Array.isArray(candidate) || !candidate.every((r) => r && typeof r === 'object' && 'id' in r && 'status' in r)) {
    throw new Error('Formato inválido: esperado um array de releases ou { data: { items: [...] } }.');
  }
  return candidate as Release[];
}
