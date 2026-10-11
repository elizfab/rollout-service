import { expect, test } from '@playwright/test';

test.describe('App', () => {
  test('alterna o tema e mantém a escolha após recarregar', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/releases');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.getByTestId('theme-toggle').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('a raiz redireciona para releases', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/releases$/);
  });

  test('rotas planejadas já mostram os endpoints que vão consumir', async ({ page }) => {
    await page.goto('/release-trains');
    await expect(page.getByTestId('em-construcao')).toContainText('GET /v1/release-trains');
    await page.goto('/packages/validations');
    await expect(page.getByTestId('em-construcao')).toContainText('GET /v1/packages/validations');
  });

  test('saúde da API lê o mock de /checks', async ({ page }) => {
    await page.goto('/checks');
    await expect(page.getByTestId('health-status')).toContainText('rollout-service (mock local)');
  });

  test('rota inexistente mostra 404', async ({ page }) => {
    await page.goto('/nao-existe');
    await expect(page.getByText('Página não encontrada')).toBeVisible();
  });
});
