import { expect, test } from '@playwright/test';
import { stubBlogApi } from './fixtures/blog-api';

test.describe('Navigation auf Desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('zeigt die Links direkt in der Toolbar, ohne Hamburger-Button', async ({ page }) => {
    await stubBlogApi(page);
    await page.goto('/');

    const toolbarNav = page.locator('mat-toolbar.app-toolbar nav.nav');

    await expect(toolbarNav.getByRole('link', { name: 'Blog' })).toBeVisible();
    await expect(toolbarNav.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Navigation ein-/ausblenden' })).toHaveCount(0);
  });
});

test.describe('Navigation auf Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('versteckt die Links hinter dem Hamburger-Menue', async ({ page }) => {
    await stubBlogApi(page);
    await page.goto('/');

    await expect(page.locator('mat-toolbar.app-toolbar nav.nav')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Navigation ein-/ausblenden' })).toBeVisible();
  });

  test('oeffnet den Drawer, navigiert nach About und schliesst ihn wieder', async ({ page }) => {
    await stubBlogApi(page);
    await page.goto('/');

    const drawer = page.locator('mat-sidenav');
    await expect(drawer).not.toBeVisible();

    await page.getByRole('button', { name: 'Navigation ein-/ausblenden' }).click();
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('nav.nav')).toBeVisible();

    await drawer.getByRole('link', { name: 'About' }).click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();
    await expect(drawer).not.toBeVisible();
  });
});

test.describe('Geschuetzte Routen', () => {
  test('zeigt das Erstellungsformular nicht ohne Anmeldung', async ({ page }) => {
    await stubBlogApi(page);
    await page.goto('/blog/create');

    await expect(page.locator('app-blog-create')).toHaveCount(0);
    expect(new URL(page.url()).pathname).not.toBe('/blog/create');
  });
});
