# Rotas

As rotas ficam em **`src/app/app.routes.ts`** e foram derivadas dos arquivos de `docs/proposta/endpoints` (raiz do repositório). O segmento da rota é o mesmo recurso da API: a tela `/releases` consome `/v1/releases`.

> **Por que espelhar a API:** quem abre uma tela já sabe qual endpoint procurar, e quem lê um endpoint sabe qual tela ele alimenta. É como um mapa em que a rua e a casa têm o mesmo nome.

## Garantia por teste

O teste `src/app/app.routes.spec.ts` lê a pasta `docs/proposta/endpoints` e **falha se algum endpoint documentado não estiver no `data.endpoints` de nenhuma rota**. Endpoint novo na documentação exige rota (ou tela) nova.

O mesmo teste também confere:

- se toda rota tem título e seção;
- se as rotas literais (`new`, `validations`) vêm antes de `:id`;
- se todos os `loadComponent` carregam.

## Mapa

| Rota | Tela | Endpoints |
| --- | --- | --- |
| `/` | redireciona para `/releases` | — |
| `/releases` | **Releases** (acordeões + tabela) | `GET /v1/releases`, `PUT /v1/release-trains/batch-actions` |
| `/releases/new` | em construção | `POST /v1/releases` |
| `/releases/:id` | **Detalhe da release** | `GET /v1/releases/:id`, `PUT /v1/releases/:id` |
| `/releases/:id/edit` | em construção | `PATCH /v1/releases/:id`, `DELETE /v1/releases/:id` |
| `/release-trains` | em construção | `GET /v1/release-trains`, `POST /v1/release-trains`, `PUT /v1/release-trains/batch-actions` |
| `/release-trains/:id` | em construção | `GET`, `PUT`, `PATCH`, `DELETE /v1/release-trains/:id`, `GET /v1/release-trains/:id/releases` |
| `/release-train-schedules` | em construção | `GET`, `POST /v1/release-train-schedules` |
| `/release-train-schedules/:id` | em construção | `GET`, `PATCH /v1/release-train-schedules/:id` |
| `/release-train-blocks` | em construção | `GET`, `POST /v1/release-train-blocks` |
| `/release-train-blocks/:id` | em construção | `GET /v1/release-train-blocks/:id` |
| `/applications` | em construção | `GET`, `POST /v1/applications` |
| `/applications/:id` | em construção | `GET`, `DELETE /v1/applications/:id`, `GET /v1/applications/:id/packages` |
| `/packages` | em construção | `GET`, `POST /v1/packages` |
| `/packages/validations` | em construção | `GET /v1/packages/validations` |
| `/packages/:id` | em construção | `GET`, `PATCH /v1/packages/:id`, `GET /v1/packages/:id/releases/audiences` |
| `/audiences` | em construção | `GET`, `POST /v1/audiences` |
| `/audiences/:id` | em construção | `GET`, `DELETE /v1/audiences/:id`, `GET /v1/audiences/by-parent/:parentId` |
| `/release-statuses` | em construção | `GET`, `POST /v1/release-statuses` |
| `/release-statuses/:id` | em construção | `GET /v1/release-statuses/:id` |
| `/release-train-statuses` | em construção | `GET`, `POST /v1/release-train-statuses` |
| `/release-train-statuses/:id` | em construção | `GET /v1/release-train-statuses/:id` |
| `/checks` | **Saúde da API** | `GET /v1/checks` |
| `/**` | Página não encontrada | — |

## Metadados de rota

Cada rota tem um `data` do tipo `RouteMeta` (`core/models/route-data.model.ts`):

```ts
{
  title: 'Releases',                 // título da página e do cabeçalho
  section: 'rollouts',               // grupo do menu: rollouts | catalogo | configuracoes | sistema
  description: 'Acompanhe e opere…', // subtítulo
  endpoints: ['GET /v1/releases'],   // endpoints consumidos (aparecem na tela)
}
```

O `PageHeaderComponent` mostra os endpoints na tela, porque o público do app é dev.

## Estado por área

A rota `releases` registra o próprio estado NgRx:

```ts
{
  path: 'releases',
  providers: [provideState(releasesFeature), provideEffects(releasesEffects)],
  children: [...]
}
```

O estado e os effects só carregam quando alguém abre a área (lazy). Siga o mesmo padrão para `release-trains`, `applications` e as demais.

## Como implementar uma tela que hoje está "em construção"

1. Crie `src/app/pages/<recurso>/<recurso>.component.ts` (standalone, OnPush).
2. Se a tela tiver estado próprio, crie `pages/<recurso>/store/` (actions, reducer com `createFeature`, selectors, effects funcionais) e registre na rota com `provideState` e `provideEffects`.
3. Crie o serviço de dados em `core/services/<recurso>-data.service.ts`, seguindo o `ReleasesDataService`: mesmo contrato para mock e API.
4. Adicione o mock em `public/mocks/<recurso>.json`, no mesmo envelope do backend.
5. No `app.routes.ts`, troque `loadComponent: emConstrucao` pelo import do componente novo. Mantenha o `data`.
6. Escreva os testes Jest do serviço, do store e do componente, e um cenário Playwright em `e2e/`.
7. Use os caminhos de `APP_PATHS` (`core/config/app-paths.ts`). Nunca escreva strings de rota soltas.

## Menu lateral

Os itens do menu ficam em `shared/components/layout/nav-items.ts`, agrupados em **Rollouts**, **Catálogo** e **Configurações**.

Em `docs/frontend-componentes.md` também aparecem **Calendário**, **Quality Budget** e **Dogfooding**. Como não têm endpoints na proposta atual, ficaram fora do menu até ganharem rota.
