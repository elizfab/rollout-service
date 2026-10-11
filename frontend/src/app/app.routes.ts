import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { APP_PATHS as P } from './core/config/app-paths';
import { RouteMeta } from './core/models/route-data.model';
import { releasesEffects, releasesFeature } from './pages/releases/store';
import { ShellComponent } from './shared/components/layout/shell.component';

/**
 * Rotas do Rollout — derivadas de docs/proposta/endpoints.
 *
 * Convenções:
 *  • O segmento da rota é o mesmo recurso da API (`/releases` ↔ `/v1/releases`).
 *  • `data` (RouteMeta) lista os endpoints que cada tela consome. O teste
 *    app.routes.spec.ts garante que TODO endpoint da pasta de docs tem uma rota.
 *  • Telas ainda não construídas usam `EmConstrucaoComponent`, que já mostra
 *    título e endpoints. Ao implementar a tela, troque só o `loadComponent`.
 *  • Rotas literais (`new`, `validations`) vêm ANTES das rotas com `:id`.
 */

const emConstrucao = () => import('./pages/em-construcao/em-construcao.component').then((m) => m.EmConstrucaoComponent);

function meta(data: RouteMeta): RouteMeta {
  return data;
}

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: P.releases },

      // ------------------------------------------------------------------
      // Rollouts
      // ------------------------------------------------------------------
      {
        path: P.releases,
        // Estado e effects de releases só carregam quando a área é aberta.
        providers: [provideState(releasesFeature), provideEffects(releasesEffects)],
        children: [
          {
            path: '',
            title: 'Releases · Rollout',
            loadComponent: () => import('./pages/releases/releases.component').then((m) => m.ReleasesComponent),
            data: meta({
              title: 'Releases',
              section: 'rollouts',
              description: 'Acompanhe e opere as releases por release train ou em uma tabela única.',
              endpoints: ['GET /v1/releases', 'PUT /v1/release-trains/batch-actions'],
            }),
          },
          {
            path: 'new',
            title: 'Nova release · Rollout',
            loadComponent: emConstrucao,
            data: meta({ title: 'Nova release', section: 'rollouts', endpoints: ['POST /v1/releases'] }),
          },
          {
            path: ':id',
            title: 'Release · Rollout',
            loadComponent: () =>
              import('./pages/release-detail/release-detail.component').then((m) => m.ReleaseDetailComponent),
            data: meta({
              title: 'Detalhe da release',
              section: 'rollouts',
              endpoints: ['GET /v1/releases/:id', 'PUT /v1/releases/:id'],
            }),
          },
          {
            path: ':id/edit',
            title: 'Editar release · Rollout',
            loadComponent: emConstrucao,
            data: meta({
              title: 'Editar release',
              section: 'rollouts',
              endpoints: ['PATCH /v1/releases/:id', 'DELETE /v1/releases/:id'],
            }),
          },
        ],
      },
      {
        path: P.releaseTrains,
        children: [
          {
            path: '',
            title: 'Release trains · Rollout',
            loadComponent: emConstrucao,
            data: meta({
              title: 'Release trains',
              section: 'rollouts',
              description: 'Trens de release do dia, com ações em lote (Cenário 1).',
              endpoints: ['GET /v1/release-trains', 'POST /v1/release-trains', 'PUT /v1/release-trains/batch-actions'],
            }),
          },
          {
            path: ':id',
            title: 'Release train · Rollout',
            loadComponent: emConstrucao,
            data: meta({
              title: 'Detalhe do release train',
              section: 'rollouts',
              endpoints: [
                'GET /v1/release-trains/:id',
                'GET /v1/release-trains/:id/releases',
                'PUT /v1/release-trains/:id',
                'PATCH /v1/release-trains/:id',
                'DELETE /v1/release-trains/:id',
              ],
            }),
          },
        ],
      },
      {
        path: P.releaseTrainSchedules,
        children: [
          {
            path: '',
            title: 'Agendamentos · Rollout',
            loadComponent: emConstrucao,
            data: meta({
              title: 'Agendamentos de release train',
              section: 'rollouts',
              description: 'Janelas de execução (ex.: manhã 06:00, tarde 13:00).',
              endpoints: ['GET /v1/release-train-schedules', 'POST /v1/release-train-schedules'],
            }),
          },
          {
            path: ':id',
            title: 'Agendamento · Rollout',
            loadComponent: emConstrucao,
            data: meta({
              title: 'Detalhe do agendamento',
              section: 'rollouts',
              endpoints: ['GET /v1/release-train-schedules/:id', 'PATCH /v1/release-train-schedules/:id'],
            }),
          },
        ],
      },
      {
        path: P.releaseTrainBlocks,
        children: [
          {
            path: '',
            title: 'Bloqueios · Rollout',
            loadComponent: emConstrucao,
            data: meta({
              title: 'Bloqueios de release train',
              section: 'rollouts',
              description: 'Dias em que nenhum trem pode rodar.',
              endpoints: ['GET /v1/release-train-blocks', 'POST /v1/release-train-blocks'],
            }),
          },
          {
            path: ':id',
            title: 'Bloqueio · Rollout',
            loadComponent: emConstrucao,
            data: meta({ title: 'Detalhe do bloqueio', section: 'rollouts', endpoints: ['GET /v1/release-train-blocks/:id'] }),
          },
        ],
      },

      // ------------------------------------------------------------------
      // Catálogo
      // ------------------------------------------------------------------
      {
        path: P.applications,
        children: [
          {
            path: '',
            title: 'Aplicações · Rollout',
            loadComponent: emConstrucao,
            data: meta({
              title: 'Aplicações',
              section: 'catalogo',
              endpoints: ['GET /v1/applications', 'POST /v1/applications'],
            }),
          },
          {
            path: ':id',
            title: 'Aplicação · Rollout',
            loadComponent: emConstrucao,
            data: meta({
              title: 'Detalhe da aplicação',
              section: 'catalogo',
              endpoints: ['GET /v1/applications/:id', 'GET /v1/applications/:id/packages', 'DELETE /v1/applications/:id'],
            }),
          },
        ],
      },
      {
        path: P.packages,
        children: [
          {
            path: '',
            title: 'Pacotes · Rollout',
            loadComponent: emConstrucao,
            data: meta({ title: 'Pacotes', section: 'catalogo', endpoints: ['GET /v1/packages', 'POST /v1/packages'] }),
          },
          {
            path: P.packageValidations,
            title: 'Validação de pacotes · Rollout',
            loadComponent: emConstrucao,
            data: meta({
              title: 'Validação de pacotes',
              section: 'catalogo',
              description: 'Consulta se um pacote está bloqueado para release.',
              endpoints: ['GET /v1/packages/validations'],
            }),
          },
          {
            path: ':id',
            title: 'Pacote · Rollout',
            loadComponent: emConstrucao,
            data: meta({
              title: 'Detalhe do pacote',
              section: 'catalogo',
              endpoints: ['GET /v1/packages/:id', 'PATCH /v1/packages/:id', 'GET /v1/packages/:id/releases/audiences'],
            }),
          },
        ],
      },
      {
        path: P.audiences,
        children: [
          {
            path: '',
            title: 'Audiências · Rollout',
            loadComponent: emConstrucao,
            data: meta({ title: 'Audiências', section: 'catalogo', endpoints: ['GET /v1/audiences', 'POST /v1/audiences'] }),
          },
          {
            path: ':id',
            title: 'Audiência · Rollout',
            loadComponent: emConstrucao,
            data: meta({
              title: 'Detalhe da audiência',
              section: 'catalogo',
              endpoints: ['GET /v1/audiences/:id', 'DELETE /v1/audiences/:id', 'GET /v1/audiences/by-parent/:parentId'],
            }),
          },
        ],
      },

      // ------------------------------------------------------------------
      // Configurações e sistema
      // ------------------------------------------------------------------
      {
        path: P.releaseStatuses,
        children: [
          {
            path: '',
            title: 'Status de release · Rollout',
            loadComponent: emConstrucao,
            data: meta({
              title: 'Status de release',
              section: 'configuracoes',
              endpoints: ['GET /v1/release-statuses', 'POST /v1/release-statuses'],
            }),
          },
          {
            path: ':id',
            title: 'Status de release · Rollout',
            loadComponent: emConstrucao,
            data: meta({ title: 'Detalhe do status', section: 'configuracoes', endpoints: ['GET /v1/release-statuses/:id'] }),
          },
        ],
      },
      {
        path: P.releaseTrainStatuses,
        children: [
          {
            path: '',
            title: 'Status de release train · Rollout',
            loadComponent: emConstrucao,
            data: meta({
              title: 'Status de release train',
              section: 'configuracoes',
              endpoints: ['GET /v1/release-train-statuses', 'POST /v1/release-train-statuses'],
            }),
          },
          {
            path: ':id',
            title: 'Status de release train · Rollout',
            loadComponent: emConstrucao,
            data: meta({
              title: 'Detalhe do status do trem',
              section: 'configuracoes',
              endpoints: ['GET /v1/release-train-statuses/:id'],
            }),
          },
        ],
      },
      {
        path: P.checks,
        title: 'Saúde da API · Rollout',
        loadComponent: () => import('./pages/health/health.component').then((m) => m.HealthComponent),
        data: meta({
          title: 'Saúde da API',
          section: 'sistema',
          description: 'Verifica se o backend está no ar.',
          endpoints: ['GET /v1/checks'],
        }),
      },

      {
        path: '**',
        title: 'Página não encontrada · Rollout',
        loadComponent: () => import('./pages/nao-encontrada/nao-encontrada.component').then((m) => m.NaoEncontradaComponent),
      },
    ],
  },
];
