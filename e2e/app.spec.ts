import { expect, test } from '@playwright/test';
import { stubBlogApi } from './fixtures/blog-api';

test('rendert die App-Shell mit Toolbar und Blog-Uebersicht', async ({ page }) => {
  await stubBlogApi(page);
  await page.goto('/');

  await expect(page.locator('mat-toolbar.app-toolbar')).toContainText('HFTM Web Applications');
  await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();
  await expect(page.locator('app-blog-card').first()).toBeVisible();
});
