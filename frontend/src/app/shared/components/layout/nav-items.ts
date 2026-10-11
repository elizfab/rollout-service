import { APP_PATHS } from '../../../core/config/app-paths';

export interface NavItem {
  label: string;
  icon: string;
  path: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Menu lateral. Cada item aponta para uma rota de app.routes.ts. */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Rollouts',
    items: [
      { label: 'Releases', icon: 'rocket', path: APP_PATHS.releases },
      { label: 'Release trains', icon: 'node-index', path: APP_PATHS.releaseTrains },
      { label: 'Agendamentos', icon: 'schedule', path: APP_PATHS.releaseTrainSchedules },
      { label: 'Bloqueios', icon: 'calendar', path: APP_PATHS.releaseTrainBlocks },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { label: 'Aplicações', icon: 'appstore', path: APP_PATHS.applications },
      { label: 'Pacotes', icon: 'inbox', path: APP_PATHS.packages },
      { label: 'Audiências', icon: 'team', path: APP_PATHS.audiences },
    ],
  },
  {
    title: 'Configurações',
    items: [
      { label: 'Status de release', icon: 'setting', path: APP_PATHS.releaseStatuses },
      { label: 'Status de release train', icon: 'apartment', path: APP_PATHS.releaseTrainStatuses },
      { label: 'Saúde da API', icon: 'api', path: APP_PATHS.checks },
    ],
  },
];
