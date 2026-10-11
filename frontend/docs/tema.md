# Tema: azul e laranja, com tons femininos

O tema do Rollout tem uma fonte única, o arquivo **`src/app/shared/styles/base/_theme.scss`**, que define os modos claro e escuro como CSS custom properties (`--rs-*`). Componentes, páginas e os ajustes do NG-ZORRO leem esses tokens. Ninguém usa hex solto.

> **Analogia:** a paleta (`abstracts/_palette.scss`) é a caixa de tintas. O tema (`base/_theme.scss`) é o desenho que diz qual tinta vai em cada parte, uma versão para o dia (claro) e outra para a noite (escuro). Os componentes só pedem "a cor do botão principal" e recebem a tinta certa para o momento.

## Direção visual

| Papel | Cor | Sensação |
| --- | --- | --- |
| **Marca** | Azul pervinca (`#4C5FD5` no claro, `#8C99F0` no escuro) | Técnico e confiável, mas suave, com um fundo violeta |
| **Destaque** | Laranja pêssego/coral (`#FF8552`) | O que está "em movimento": rollout em progresso, ações que avançam a release, item ativo do menu |
| **Tons femininos de apoio** | Rosa (`#E26D9C`) e lilás (`#9A7FE6`) | Gradiente do logo, estados de reversão, acentos de fundo |
| **Neutros** | Cinzas levemente violeta (`#F8F7FC` → `#17162B`) | Acolhedores; nunca cinza frio puro |

Detalhes que formam a linguagem "feminina e acolhedora" sem perder o ar de ferramenta de dev:

- Cantos arredondados generosos (`--rs-radius-lg: 14px`).
- Sombras com tom violeta, e não preto.
- Fonte **Plus Jakarta Sans**, arredondada e amigável, na interface.
- **JetBrains Mono** para tudo que é técnico: IDs, GMUD, RACF, JSON, endpoints.
- Gradiente da marca `azul → lilás → rosa/laranja` só em pontos de destaque (logo, barra de progresso).

## Logo

![Logo](assets/logo.svg)

| Elemento | Significado |
| --- | --- |
| Quadrado arredondado em gradiente azul → lilás → rosa | A marca |
| Três barras crescentes | O rollout gradual: a release vai ganhando audiências aos poucos |
| Arco pêssego que termina no ponto laranja | A release chegando ao destino |

Arquivos:

- `public/logo.svg` e `public/favicon.svg`: arquivos estáticos;
- `shared/components/logo/logo.component.ts`: componente com o wordmark `rollout` + `SERVICE`, e um modo compacto para o menu recolhido.

## Como o tema é escolhido

1. O `ThemeService` grava `data-theme="light"` ou `data-theme="dark"` no `<html>` e salva a escolha em `localStorage` (`rollout.theme`).
2. Um script inline no `index.html` aplica o tema salvo **antes** do Angular carregar. Assim a tela não pisca no tema errado.
3. Sem escolha salva, vale o tema do sistema operacional (`prefers-color-scheme`).
4. Ao imprimir, `_print.scss` força o tema claro.

## Tokens

### Superfícies e texto

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `--rs-bg` | `#F8F7FC` | `#17162B` | Fundo da aplicação |
| `--rs-surface` | `#FFFFFF` | `#201F38` | Cards, tabelas, acordeões |
| `--rs-surface-elevated` | `#FFFFFF` | `#2A2946` | Modais, dropdowns |
| `--rs-surface-sunken` | `#F1EFF8` | `#121124` | Cabeçalho de tabela, áreas rebaixadas |
| `--rs-surface-hover` | `#F1EFF8` | `#2F2D4D` | Hover de linhas e itens |
| `--rs-border` | `#E7E4F0` | `#3A3858` | Bordas e divisores |
| `--rs-text` | `#1D1B33` | `#F3F1FA` | Texto principal |
| `--rs-text-muted` | `#5F5C7A` | `#B5B2CF` | Texto secundário |

### Marca e destaque

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `--rs-color-primary` | `#4C5FD5` | `#8C99F0` | Botão principal, link, foco |
| `--rs-color-primary-soft` | `#E6E9FC` | azul 16% | Item de menu ativo, seleção |
| `--rs-color-accent` | `#FF8552` | `#FF8552` | Destaque: ação "Retomar", barra de lote, marcador do menu |
| `--rs-color-accent-text` | `#B84E1F` | `#FFB38F` | **Texto** em laranja (contraste AA garantido) |
| `--rs-color-accent-soft` | `#FFEDE4` | laranja 16% | Fundo de destaque |
| `--rs-color-rose` / `-soft` | `#E26D9C` / `#FCE7F0` | `#F3A9C6` / rosa 18% | Estado terminal, acentos |
| `--rs-color-lilac` / `-soft` | `#9A7FE6` / `#EEE8FD` | `#C6B5F5` / lilás 18% | Fundos decorativos, reagendado |

### Estados de release

Cada status tem três tokens: `--rs-status-<token>-bg`, `-fg` e `-dot`. No claro, o fundo é suave e o texto escuro; no escuro, o fundo é translúcido e o texto claro. O selo sempre mostra **ponto + texto**, nunca só cor.

| Status | Token | Família de cor |
| --- | --- | --- |
| Agendado | `scheduled` | Azul |
| Reagendado | `rescheduled` | Lilás |
| Em progresso | `in-progress` | Laranja (o ponto pulsa) |
| Expansão pausada | `expansion-paused` | Âmbar |
| Expansão concluída | `expansion-completed` | Menta |
| Rollback | `rollback` | Vermelho |
| Stepback | `stepback` | Rosa |
| Cancelado | `canceled` | Neutro |

### Constantes (iguais nos dois temas)

| Grupo | Tokens |
| --- | --- |
| Fontes | `--rs-font-sans`, `--rs-font-mono` |
| Tamanhos | `--rs-font-size-xs` (12px) … `--rs-font-size-2xl` (26px) |
| Espaços | `--rs-space-1` (4px) … `--rs-space-7` (48px) |
| Cantos | `--rs-radius-sm` (6px), `-md` (10px), `-lg` (14px), `-pill` |
| Layout | `--rs-sidebar-width`, `--rs-sidebar-width-collapsed`, `--rs-header-height` |

## NG-ZORRO

O NG-ZORRO é carregado com o CSS **variable** (`ng-zorro-antd.variable.min.css`, no `angular.json`). O arquivo `base/_ng-zorro.scss`:

1. liga as variáveis `--ant-primary-*` aos tokens `--rs-*`;
2. ajusta as superfícies dos componentes usados (botão, campo, select, tabela, collapse, modal, menu, tag, timeline, descriptions…) para os dois temas.

Regra: um ajuste que vale para o app inteiro mora em `_ng-zorro.scss`, e não dentro de um componente.

## Como usar nos componentes

```scss
@use 'abstracts' as *; // mixins e paleta (o caminho já está no angular.json)

.meu-card {
  @include surface(1); // fundo, borda, raio e sombra do tema
  padding: var(--rs-space-4);
  color: var(--rs-text);

  &__destaque {
    color: var(--rs-color-accent-text); // laranja legível nos dois temas
  }

  @include down(md) {
    padding: var(--rs-space-3);
  }
}
```

Botão de destaque laranja: `<button nz-button class="rs-btn-accent">`.

## Acessibilidade

- Os textos usam tokens com contraste mínimo de 4.5:1 nos dois temas. Para escrever em laranja, use `--rs-color-accent-text`, e não `--rs-color-accent`.
- Foco visível em todos os elementos interativos (`--rs-color-focus`).
- Status sempre com texto, e não só cor.
- `prefers-reduced-motion` desliga animações e transições.
- Link "Pular para o conteúdo" no topo do layout.
