# Testes

| Tipo | Ferramenta | Onde | Comando |
| --- | --- | --- | --- |
| Unitário e de componente | **Jest** + jest-preset-angular (jsdom) | `src/**/*.spec.ts` | `npm test` |
| Cenários E2E | **Playwright** (Chromium desktop + Pixel 7) | `e2e/*.spec.ts` | `npm run e2e` |

> **Nunca Jasmine nem Karma.** O builder de testes do Karma foi removido do `angular.json`, e `npm test` chama o Jest. Use `jest.fn()`, `jest.spyOn()` e `expect(...)` do Jest. Nada de `jasmine.createSpy` ou `spyOn` global.

## Situação atual

- **Jest:** 90 testes em 18 suítes, com cobertura de ~95% em linhas.
- **Playwright:** 12 cenários × 2 dispositivos = 24 execuções.

O mínimo de cobertura exigido pelo `jest.config.ts` é:

| Métrica | Mínimo |
| --- | --- |
| Statements | 80% |
| Branches | 70% |
| Functions | 75% |
| Lines | 80% |

## O que cada suíte garante

| Arquivo | Garante |
| --- | --- |
| `models/release-action.rules.spec.ts` | Cada linha das matrizes de `regras-acoes.md` (Cenários 1 e 2), interseção em lote, transição de status e histórico |
| `app.routes.spec.ts` | **Todo endpoint de `docs/proposta/endpoints` tem rota**; ordem das rotas; lazy load |
| `core/services/releases-data.service.spec.ts` | Mock (filtro, paginação, persistência) e API (URLs, query, corpo das ações) |
| `core/services/*.spec.ts` | Storage, tema, import/export, impressão, ApiService, saúde |
| `pages/releases/store/*.spec.ts` | Reducer, selectors e effects do NgRx |
| `pages/pages.spec.ts` | Página de releases, detalhe, saúde, telas genéricas |
| `shared/components/**/*.spec.ts` | Componentes compartilhados e o modal de ação |

| Cenário E2E | Garante |
| --- | --- |
| Carrega do mock e agrupa em acordeões | Fonte "Mock local", 5 grupos, abrir e fechar acordeão |
| Filtra por card de status e pela busca | Filtros chegando no store e na tabela |
| Visão em tabela com paginação | Troca de visão e página 2 |
| Ação em lote (Cenário 1) | Selecionar tudo, só ações válidas, motivo obrigatório, persistência após reload, restaurar mock |
| Seleção mista | Mensagem quando nenhuma ação vale para todas |
| Pausar no detalhe (Cenário 2) | Botões desabilitados conforme a regra, histórico atualizado |
| Tema | Alterna e mantém após recarregar |
| Rotas planejadas, saúde, 404 | Navegação completa |

## Como escrever

### Jest

```ts
import { TestBed } from '@angular/core/testing';
import { provideComponentTesting } from '../testing/test-providers';
import { makeRelease } from '../testing/release.fixture';

describe('MeuComponente', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: provideComponentTesting() }));

  it('mostra o status', () => {
    const f = TestBed.createComponent(MeuComponente);
    f.componentRef.setInput('release', makeRelease({ status: 'in_progress' }));
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Em progresso');
  });
});
```

Ferramentas de teste do projeto (`src/app/testing/`):

| Helper | Para quê |
| --- | --- |
| `makeRelease(overrides)` | Cria uma release válida; sobrescreva só o que importa |
| `provideComponentTesting(dataSource)` | Router, HttpClient de teste, NG-ZORRO (i18n + ícones), animações noop e o ambiente |

Dicas:

- **Store:** para testar reducer e selector, use o reducer puro e `selector.projector(...)`. Para effects, use `provideMockActions` e `TestBed.runInInjectionContext`.
- **HTTP:** use `HttpTestingController` (`expectOne`, `flush`) e termine com `http.verify()`.
- **Mock sem atraso:** nos testes, `mockDelayMs: 0` deixa as respostas síncronas.

### Playwright

- Use sempre `data-testid` (veja os existentes nos templates) ou papéis acessíveis (`getByRole`).
- Cada teste começa com o `localStorage` limpo: contexto novo, mock original.
- `npm run e2e` sobe o `ng serve` sozinho. Se o servidor já estiver rodando na porta 6030, ele é reaproveitado.

```bash
npx playwright install chromium   # só na primeira vez
npm run e2e                       # todos os cenários
npx playwright test -g "lote"     # só os cenários com "lote" no nome
npm run e2e:ui                    # modo interativo
```
