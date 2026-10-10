import { expect, test } from '@playwright/test';
import { stubBlogApi } from './fixtures/blog-api';

test.describe('Blog-Detailseite', () => {
  test('oeffnet ueber den Details-Link die Detail-Route des Blogs', async ({ page }) => {
    await stubBlogApi(page);
    await page.goto('/');

    await page.locator('app-blog-card').first().getByRole('link', { name: 'Details' }).click();

    await expect(page).toHaveURL(/\/blog\/1$/);
    await expect(page.locator('app-blog-detail-page')).toBeVisible();
  });

  test('zeigt Titel, Autor und einen Zurueck-Link', async ({ page }) => {
    await stubBlogApi(page);
    await page.goto('/blog/1');

    await expect(page.locator('mat-card-title')).toHaveText('Angular Signals — Ein Game Changer?');
    await expect(page.locator('mat-card-subtitle')).toHaveText('Maria Keller');

    await page.getByRole('link', { name: 'Zurueck' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.locator('app-blog-card').first()).toBeVisible();
  });

  test('zeigt einen Hinweis, wenn es den Blog nicht gibt', async ({ page }) => {
    await stubBlogApi(page);
    await page.goto('/blog/999');

    await expect(page.getByText('Blog-Post nicht gefunden.')).toBeVisible();
    await expect(page.locator('mat-card-title')).toHaveCount(0);
  });
});
