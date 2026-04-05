import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('app boots with starter data and preview updates on edit', async ({ page }) => {
  await page.goto('/#/app');

  const nameInput = page.locator('#name');
  await expect(nameInput).toHaveValue('Jane Doe');

  const preview = page.locator('#cv-preview-panel-desktop');
  await expect(preview.locator('.cv-preview-name')).toHaveText('Jane Doe');

  await nameInput.fill('Updated Name');

  await expect(preview.locator('.cv-preview-name')).toHaveText('Updated Name');
});

test('import JSON file populates the form', async ({ page }) => {
  await page.goto('/#/app');

  const fileInput = page.locator('input[aria-label="Import CV JSON"]');
  await fileInput.setInputFiles(path.resolve(__dirname, 'fixtures/test-cv.json'));

  await expect(page.locator('#name')).toHaveValue('Test User');
  await expect(page.locator('#title')).toHaveValue('Test Engineer');
  await expect(page.locator('#email')).toHaveValue('test@example.com');

  const preview = page.locator('#cv-preview-panel-desktop');
  await expect(preview.locator('.cv-preview-name')).toHaveText('Test User');
});

test('clear all resets the form after confirmation', async ({ page }) => {
  await page.goto('/#/app');

  await expect(page.locator('#name')).toHaveValue('Jane Doe');

  await page.getByRole('button', { name: 'Clear all' }).click();

  await expect(page.getByText('Clear all data?')).toBeVisible();

  await page.getByRole('button', { name: 'Clear everything' }).click();

  await expect(page.locator('#name')).toHaveValue('');
  await expect(page.locator('#title')).toHaveValue('');
});

test('DOCX download triggers a file download', async ({ page }) => {
  await page.goto('/#/app');

  const preview = page.locator('#cv-preview-panel-desktop');
  await preview.getByRole('button', { name: 'Download' }).click();

  await expect(page.getByText('Download your CV')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByText('Word document (.docx)').click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('cv.docx');
});

test('Landing page is the default route', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /optimized for the machines/i })).toBeVisible();

  await page.getByRole('link', { name: 'Build your CV' }).first().click();

  await expect(page.locator('form[aria-label="CV editor"]')).toBeVisible();
});

test('Editor links back to landing page', async ({ page }) => {
  await page.goto('/#/app');

  await page.getByRole('link', { name: 'Why BioBot?' }).first().click();

  await expect(page.getByRole('heading', { name: /optimized for the machines/i })).toBeVisible();
});
