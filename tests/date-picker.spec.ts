import { test, expect, Page, Locator } from '@playwright/test';

async function selectDate(page: Page, target: string | Date, input: string | Locator = 'input#datepicker') {
  const inputEl: Locator = typeof input === 'string' ? page.locator(input) : input;
  const targetDate = typeof target === 'string' ? new Date(target) : target;
  if (Number.isNaN(targetDate.getTime())) throw new Error('Invalid date provided to selectDate');

  const targetDay = targetDate.getDate();
  const targetMonthIndex = targetDate.getMonth();
  const targetYear = targetDate.getFullYear();

  await inputEl.first().click();

  const titleLocator = page.locator('.ui-datepicker-title');
  await page.waitForSelector('.ui-datepicker, .ui-datepicker-title');

  const nextBtn = page.locator('.ui-datepicker-next');
  const prevBtn = page.locator('.ui-datepicker-prev');

  const months = [
    'January','February','March','April','May','June','July','August','September','October','November','December'
  ];

  // navigate to correct month/year
  for (let i = 0; i < 240; i++) {
    const titleText = (await titleLocator.first().textContent()) || '';
    const m = titleText.match(/([A-Za-z]+)\s+(\d{4})/);
    if (!m) break;
    const currentMonth = months.indexOf(m[1]);
    const currentYear = parseInt(m[2], 10);
    if (currentYear === targetYear && currentMonth === targetMonthIndex) break;

    if (currentYear < targetYear || (currentYear === targetYear && currentMonth < targetMonthIndex)) {
      await nextBtn.first().waitFor({ state: 'visible' });
      await nextBtn.first().click();
    } else {
      await prevBtn.first().waitFor({ state: 'visible' });
      await prevBtn.first().click();
    }
    await page.waitForTimeout(100);
  }

  // click day (ignore days from other months)
  const dayLocator = page.locator(`.ui-datepicker-calendar td:not(.ui-datepicker-other-month) >> text=\"${targetDay}\"`);
  await dayLocator.first().click();
}

test('Date Picker - select date by input', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  const inputByLabel = page.locator('//label[contains(., "Date Picker 1")]/following::input[1]');
  const input = (await inputByLabel.count()) ? inputByLabel : page.locator('#datepicker');

  // Example: future date
  await selectDate(page, '2026-06-23', input);
  expect((await input.first().inputValue())).toContain('23');

  // Example: past date
  await selectDate(page, '2019-01-15', input);
  expect((await input.first().inputValue())).toContain('15');
});
