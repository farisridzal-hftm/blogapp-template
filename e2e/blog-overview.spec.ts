import { expect, test } from '@playwright/test';
import { mockBlogs, stubBlogApi, stubBlogApiFailure } from './fixtures/blog-api';

test.describe('Blog-Uebersicht', () => {
  test('zeigt alle Blog-Eintraege der API an', async ({ page }) => {
    await stubBlogApi(page);
    await page.goto('/');

    await expect(page.locator('app-blog-card')).toHaveCount(mockBlogs.length);
    await expect(page.locator('.blog-count')).toHaveText(`${mockBlogs.length} Blogs`);
  });

  test('zeigt pro Eintrag Titel, Autor und Vorschautext', async ({ page }) => {
    await stubBlogApi(page);
    await page.goto('/');

    const firstCard = page.locator('app-blog-card').first();

    await expect(firstCard.locator('mat-card-title')).toHaveText(mockBlogs[0].title);
    await expect(firstCard.locator('mat-card-subtitle')).toHaveText(mockBlogs[0].author);
    await expect(firstCard.locator('mat-card-content')).toContainText(mockBlogs[0].contentPreview);
  });

  test('filtert die Liste auf den gewaehlten Autor und wieder zurueck', async ({ page }) => {
    await stubBlogApi(page);
    await page.goto('/');

    await expect(page.locator('app-blog-card')).toHaveCount(3);

    await page.getByRole('combobox', { name: 'Autor' }).click();
    await page.getByRole('option', { name: 'michael-hftm' }).click();

    await expect(page.locator('app-blog-card')).toHaveCount(2);
    await expect(page.locator('.blog-count')).toHaveText('2 von 3 Blogs');
    await expect(page.locator('app-blog-card mat-card-subtitle')).toHaveText([
      'michael-hftm',
      'michael-hftm',
    ]);

    await page.getByRole('combobox', { name: 'Autor' }).click();
    await page.getByRole('option', { name: 'Alle Autoren' }).click();

    await expect(page.locator('app-blog-card')).toHaveCount(3);
  });

  test('zeigt eine Fehlermeldung statt Karten, wenn die API fehlschlaegt', async ({ page }) => {
    await stubBlogApiFailure(page);
    await page.goto('/');

    await expect(page.locator('.error')).toContainText('Blogs konnten nicht geladen werden.');
    await expect(page.locator('app-blog-card')).toHaveCount(0);
  });
});
