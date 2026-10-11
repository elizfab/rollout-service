# Deploy e configurações

## Provedor / plataforma

- **Frontend:** Vercel
- **Backend:** `N/A` (app client-side)
- **Banco:** `N/A` (dados do usuário ficam no `localStorage` do navegador)

Enquanto não houver backend publicado, o build de produção usa o **mock local** (`environment.prod.ts` → `dataSource: 'mock'`). Cada pessoa vê os próprios dados no próprio navegador.

## Vercel

O arquivo `frontend/vercel.json` já está configurado:

| Configuração | Valor |
| --- | --- |
| Root Directory (no painel da Vercel) | `frontend` |
| Install | `npm ci` |
| Build | `npm run build` |
| Output | `dist/frontend/browser` |
| Rewrites | Toda rota sem extensão e fora de `/mocks/` vai para `index.html` (SPA) |
| Headers | `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`; cache longo para JS/CSS e sem cache para `index.html` |

### Passo a passo

1. Na Vercel: **Add New → Project** e importe o repositório `rollout-service`.
2. Em **Root Directory**, escolha `frontend`. A Vercel detecta Angular pelo `vercel.json`.
3. Deploy. Cada push na branch configurada gera uma versão nova, e cada PR ganha uma URL de preview.

## Ambientes

| Arquivo | Usado por | `dataSource` | `apiUrl` |
| --- | --- | --- | --- |
| `src/environments/environment.ts` | `npm start` | `mock` | `http://localhost:8080` |
| `src/environments/environment.prod.ts` | `npm run build` (Vercel) | `mock` | a definir |

O `angular.json` troca um arquivo pelo outro no build de produção (`fileReplacements`).

## Quando o backend for publicado

1. Em `environment.prod.ts`: `dataSource: 'api'` e `apiUrl` com a URL **https** do backend.
2. No backend: restringir o CORS ao domínio da Vercel (ver `docs/INTEGRACAO-BACKEND.md`).
3. Atualizar a seção **Provedor / plataforma** acima (Backend e Banco deixam de ser `N/A`).
4. Validar em `/checks` na URL de preview antes de promover para produção.
