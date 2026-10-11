import { RELEASE_STATUSES, RELEASE_STATUS_META, isTerminalStatus } from './release-status.model';

describe('release-status.model', () => {
  it('tem rótulo e token de cor para todos os status', () => {
    RELEASE_STATUSES.forEach((s) => {
      expect(RELEASE_STATUS_META[s].label).toBeTruthy();
      expect(RELEASE_STATUS_META[s].token).toMatch(/^[a-z-]+$/);
    });
  });

  it('considera terminais só rollback, stepback e cancelado', () => {
    expect(RELEASE_STATUSES.filter(isTerminalStatus)).toEqual(['rollback', 'stepback', 'canceled']);
  });
});
