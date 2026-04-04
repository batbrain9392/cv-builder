import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('app boots with starter data and preview updates on edit', async ({ page }) => {
  await page.goto('/');

  const nameInput = page.locator('#name');
  await expect(nameInput).toHaveValue('Jane Doe');

  const preview = page.locator('#cv-preview-panel');
  await expect(preview.locator('.cv-preview-name')).toHaveText('Jane Doe');

  await nameInput.fill('Updated Name');

  await expect(preview.locator('.cv-preview-name')).toHaveText('Updated Name');
});

test('import JSON file populates the form', async ({ page }) => {
  await page.goto('/');

  const fileInput = page.locator('input[aria-label="Import CV JSON"]');
  await fileInput.setInputFiles(path.resolve(__dirname, 'fixtures/test-cv.json'));

  await expect(page.locator('#name')).toHaveValue('Test User');
  await expect(page.locator('#title')).toHaveValue('Test Engineer');
  await expect(page.locator('#email')).toHaveValue('test@example.com');

  const preview = page.locator('#cv-preview-panel');
  await expect(preview.locator('.cv-preview-name')).toHaveText('Test User');
});

test('clear all resets the form after confirmation', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#name')).toHaveValue('Jane Doe');

  await page.getByRole('button', { name: 'Clear all' }).click();

  await expect(page.getByText('Clear all data?')).toBeVisible();

  await page.getByRole('button', { name: 'Clear everything' }).click();

  await expect(page.locator('#name')).toHaveValue('');
  await expect(page.locator('#title')).toHaveValue('');
});
