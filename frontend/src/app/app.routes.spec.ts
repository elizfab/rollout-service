import { readdirSync } from 'fs';
import { join } from 'path';
import { Route } from '@angular/router';
import { RouteMeta } from './core/models/route-data.model';
import { routes } from './app.routes';

/** Junta todas as rotas filhas em uma lista plana. */
function flatten(list: Route[]): Route[] {
  return list.flatMap((r) => [r, ...flatten(r.children ?? [])]);
}

/** 'GET /v1/release-trains/:id/releases' → 'GET-release-trains-id-releases' (padrão dos arquivos da doc) */
function toDocFileName(endpoint: string): string {
  const [method, path] = endpoint.split(' ');
  return `${method}-${path.replace(/^\/v1\//, '').replace(/[/:]+/g, '-')}`;
}

describe('app.routes', () => {
  const all = flatten(routes);
  const withMeta = all.filter((r) => r.data && (r.data as RouteMeta).title);
  const declared = new Set(withMeta.flatMap((r) => (r.data as RouteMeta).endpoints ?? []).map(toDocFileName));

  it('cobre TODOS os endpoints de docs/proposta/endpoints', () => {
    const docsDir = join(__dirname, '../../../docs/proposta/endpoints');
    const documented = readdirSync(docsDir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''));

    const missing = documented.filter((name) => !declared.has(name));
    expect(missing).toEqual([]);
    expect(documented.length).toBeGreaterThan(40);
  });

  it('toda tela tem título e seção', () => {
    withMeta.forEach((r) => {
      const meta = r.data as RouteMeta;
      expect(meta.section).toBeDefined();
      expect(r.title).toBeTruthy();
    });
  });

  it('rotas literais vêm antes de :id (senão "new" vira um id)', () => {
    all.forEach((parent) => {
      const paths = (parent.children ?? []).map((c) => c.path ?? '');
      const firstParam = paths.findIndex((p) => p.startsWith(':'));
      if (firstParam === -1) return;
      paths.slice(firstParam).forEach((p) => expect(p.startsWith(':') || p === '**').toBe(true));
    });
  });

  it('carrega o componente de cada rota', async () => {
    const loaders = all.filter((r) => r.loadComponent).map((r) => r.loadComponent!());
    const components = await Promise.all(loaders);
    components.forEach((c) => expect(c).toBeTruthy());
  });

  it('a raiz redireciona para releases e há rota coringa', () => {
    expect(all.some((r) => r.redirectTo === 'releases')).toBe(true);
    expect(all.some((r) => r.path === '**')).toBe(true);
  });
});
