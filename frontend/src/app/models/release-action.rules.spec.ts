import {
  ReleaseActionNotAllowedError,
  allowedBatchActions,
  allowedIndividualActions,
  applyReleaseAction,
} from './release-action.rules';
import { makeRelease } from '../testing/release.fixture';
import { ReleaseStatus } from './release-status.model';

/**
 * Cada linha abaixo é uma linha das matrizes de
 * docs/proposta/regras-permissionamentos/regras-acoes.md.
 * Se a regra de negócio mudar, este teste precisa mudar junto.
 */
describe('regras de ações de release', () => {
  describe('Cenário 1 — lote (release train)', () => {
    it.each<[ReleaseStatus, string[]]>([
      ['scheduled', ['cancel', 'reschedule']],
      ['expansion_paused', ['resume', 'cancel', 'reschedule']],
      ['in_progress', ['pause']],
      ['stepback', []],
      ['canceled', []],
      ['rollback', []],
      ['expansion_completed', []],
    ])('%s permite %j', (status, expected) => {
      expect(allowedBatchActions([status])).toEqual(expected);
    });

    it('nunca oferece rollback nem stepback em lote', () => {
      const all: ReleaseStatus[] = ['scheduled', 'expansion_paused', 'in_progress', 'expansion_completed'];
      all.forEach((s) => {
        expect(allowedBatchActions([s])).not.toContain('rollback');
        expect(allowedBatchActions([s])).not.toContain('stepback');
      });
    });

    it('com seleção mista, mostra só a interseção', () => {
      expect(allowedBatchActions(['scheduled', 'expansion_paused'])).toEqual(['cancel', 'reschedule']);
      expect(allowedBatchActions(['scheduled', 'in_progress'])).toEqual([]);
    });

    it('sem seleção, não há ações', () => {
      expect(allowedBatchActions([])).toEqual([]);
    });
  });

  describe('Cenário 2 — individual (detalhe)', () => {
    it.each<[ReleaseStatus, string[]]>([
      ['scheduled', ['cancel']],
      ['expansion_paused', ['resume', 'cancel', 'rollback']],
      ['in_progress', ['pause']],
      ['stepback', []],
      ['canceled', []],
      ['rollback', []],
      ['expansion_completed', ['rollback', 'stepback']],
    ])('%s permite %j', (status, expected) => {
      expect(allowedIndividualActions(status)).toEqual(expected);
    });

    it('nunca oferece reagendar individualmente', () => {
      expect(allowedIndividualActions('scheduled')).not.toContain('reschedule' as never);
    });
  });

  describe('applyReleaseAction', () => {
    const now = new Date('2026-10-12T10:00:00.000Z');

    it('muda o status, registra o histórico e não altera o original', () => {
      const original = makeRelease({ status: 'in_progress' });
      const result = applyReleaseAction(original, { action: 'pause', reason: 'erro 5xx' }, 'individual', 'liza', now);

      expect(result.status).toBe('expansion_paused');
      expect(result.statusHistory.at(-1)).toEqual({
        status: 'expansion_paused',
        observation: 'erro 5xx',
        changedBy: 'liza',
        createdAt: now.toISOString(),
      });
      expect(result.updatedAt).toBe(now.toISOString());
      expect(original.status).toBe('in_progress');
    });

    it('reagendar troca a data agendada', () => {
      const r = makeRelease({ status: 'scheduled' });
      const result = applyReleaseAction(
        r,
        { action: 'reschedule', reason: 'conflito de GMUD', scheduledAt: '2026-10-20T09:00:00.000Z' },
        'batch',
        'liza',
        now,
      );
      expect(result.status).toBe('rescheduled');
      expect(result.scheduledAt).toBe('2026-10-20T09:00:00.000Z');
    });

    it('recusa ação fora da matriz do cenário', () => {
      const r = makeRelease({ status: 'expansion_completed' });
      expect(() => applyReleaseAction(r, { action: 'rollback', reason: 'x' }, 'batch', 'liza')).toThrow(
        ReleaseActionNotAllowedError,
      );
      expect(() => applyReleaseAction(r, { action: 'rollback', reason: 'regressão' }, 'individual', 'liza')).not.toThrow();
    });
  });
});
