import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.facebook.com/');
  await page.getByTestId('royal-email').click();
  await page.getByTestId('royal-email').fill('abcdejije');
  await page.getByTestId('royal-email').press('Tab');
  await page.getByTestId('royal-pass').fill('hushushua@132414');
  await page.getByTestId('royal-pass').press('Enter');
  //await page.getByTestId('royal-login-button').click();
  await expect(page.getByText('The email  or mobile')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Forgotten password' })).toBeVisible();
});