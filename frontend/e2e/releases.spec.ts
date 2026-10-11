import { expect, test } from '@playwright/test';

/**
 * Cenários da página de releases com os dados do mock local
 * (public/mocks/releases.json). Cada teste começa com o localStorage limpo.
 */
test.describe('Releases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/releases');
    await expect(page.getByTestId('trains-view')).toBeVisible();
  });

  test('carrega do mock local e agrupa por release train em acordeões', async ({ page }) => {
    await expect(page.getByTestId('page-title')).toHaveText('Releases');
    await expect(page.getByTestId('data-source')).toContainText('Mock local');
    await expect(page.locator('nz-collapse-panel')).toHaveCount(5);

    // O primeiro trem vem aberto; os demais abrem ao clicar.
    await expect(page.getByTestId('row-rel-0001')).toBeVisible();
    await page.getByTestId('train-rt-2026-10-13-am').locator('.ant-collapse-header').click();
    await expect(page.getByTestId('row-rel-0012')).toBeVisible();
  });

  test('filtra pelo card de status e pela busca', async ({ page }) => {
    await page.getByTestId('summary-rollback').click();
    await expect(page.locator('nz-collapse-panel')).toHaveCount(1);
    await expect(page.getByText('Releases individuais')).toBeVisible();

    await page.getByTestId('summary-rollback').click(); // desliga o filtro
    await page.getByTestId('search').fill('GMUD7300137');
    await expect(page.locator('tbody tr.ant-table-row')).toHaveCount(1);
  });

  test('visão em tabela tem paginação', async ({ page }) => {
    await page.getByTestId('view-toggle').getByText('Tabela').click();
    await expect(page.getByTestId('table-view')).toBeVisible();
    await expect(page.locator('tbody tr.ant-table-row')).toHaveCount(10);
    await expect(page.getByTestId('row-rel-0001')).toBeVisible();

    await page.locator('.ant-pagination-item').filter({ hasText: /^2$/ }).click();
    await expect(page.getByTestId('row-rel-0011')).toBeVisible();
    await expect(page.getByTestId('row-rel-0001')).toHaveCount(0);
  });

  test('ação em lote: cancelar releases agendadas (Cenário 1) e persistir no localStorage', async ({ page }) => {
    const train = page.getByTestId('train-rt-2026-10-14-am');
    await train.locator('.ant-collapse-header').click();
    await train.locator('thead .ant-checkbox-input').check();

    const bar = page.getByTestId('batch-bar');
    await expect(bar).toContainText('3 selecionadas');
    await expect(page.getByTestId('batch-pause')).toHaveCount(0); // agendado não pode pausar
    await page.getByTestId('batch-cancel').click();

    await page.getByTestId('action-reason').fill('Janela cancelada pelo RM');
    await page.getByRole('button', { name: 'Confirmar' }).click();
    await expect(train.locator('tbody rs-status-tag')).toHaveText(['Cancelado', 'Cancelado', 'Cancelado']);

    await page.reload();
    await page.getByTestId('train-rt-2026-10-14-am').locator('.ant-collapse-header').click();
    await expect(page.getByTestId('train-rt-2026-10-14-am').locator('tbody rs-status-tag')).toHaveText([
      'Cancelado',
      'Cancelado',
      'Cancelado',
    ]);

    // "Restaurar mock" volta ao JSON original (o painel continua aberto).
    await page.getByTestId('reset-mock').click();
    await expect(page.getByTestId('train-rt-2026-10-14-am').locator('tbody rs-status-tag')).toHaveText([
      'Agendado',
      'Agendado',
      'Agendado',
    ]);
  });

  test('seleção mista sem ação em comum avisa o motivo', async ({ page }) => {
    await page.getByTestId('row-rel-0001').locator('.ant-checkbox-input').check(); // em progresso
    await page.getByTestId('row-rel-0003').locator('.ant-checkbox-input').check(); // pausada
    await expect(page.getByTestId('batch-bar')).toContainText('Nenhuma ação em lote');
  });
});

test.describe('Detalhe da release', () => {
  test('pausa uma release em progresso (Cenário 2) e registra no histórico', async ({ page }) => {
    await page.goto('/releases');
    await page.getByTestId('link-rel-0001').click();

    await expect(page).toHaveURL(/\/releases\/rel-0001$/);
    await expect(page.getByTestId('detail-status')).toContainText('Em progresso');
    await expect(page.getByTestId('action-stepback')).toBeDisabled();
    await expect(page.getByTestId('action-resume')).toBeDisabled();

    await page.getByTestId('action-pause').click();
    await page.getByTestId('action-reason').fill('Erros 5xx acima do limite');
    await page.getByRole('button', { name: 'Confirmar' }).click();

    await expect(page.getByTestId('detail-status')).toContainText('Expansão pausada');
    await expect(page.getByTestId('history-panel')).toContainText('Erros 5xx acima do limite');
    await expect(page.getByTestId('action-resume')).toBeEnabled();
  });

  test('id inexistente mostra "não encontrada"', async ({ page }) => {
    await page.goto('/releases/rel-9999');
    await expect(page.getByText('Release não encontrada')).toBeVisible();
  });
});
