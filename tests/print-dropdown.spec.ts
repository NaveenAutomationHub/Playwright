import { test, expect } from '@playwright/test';

test('print all dropdown options on page', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/', { waitUntil: 'domcontentloaded' });

  // Dismiss common cookie/privacy banners if present
  const cookieSelectors = [
    "text=Accept All",
    "text=Accept Cookies",
    "text=I agree",
    "button:has-text('Accept')",
  ];
  for (const sel of cookieSelectors) {
    const el = page.locator(sel).first();
    if (await el.count() > 0 && await el.isVisible()) {
      await el.click().catch(() => {});
      break;
    }
  }

  const selects = page.locator('select');
  const selectCount = await selects.count();
  console.log(`Found ${selectCount} <select> elements on the page.`);
  expect(selectCount).toBeGreaterThan(0);

  const allOptionTexts: string[] = [];
  for (let i = 0; i < selectCount; i++) {
    const sel = selects.nth(i);
    const id = (await sel.getAttribute('id')) || '';
    const name = (await sel.getAttribute('name')) || '';
    const label = id || name || `select-${i}`;

    const options = sel.locator('option');
    const optCount = await options.count();
    const printed: Array<{ text: string | null; value: string | null; disabled: boolean }> = [];
    for (let j = 0; j < optCount; j++) {
      const opt = options.nth(j);
      const text = (await opt.textContent())?.trim() ?? null;
      const value = (await opt.getAttribute('value')) ?? null;
      const disabled = (await opt.getAttribute('disabled')) !== null;
      if (text) allOptionTexts.push(text);
      printed.push({ text, value, disabled });
    }

    console.log(`Options for [${label}] (${optCount}):`);
    for (const o of printed) console.log(`  - text: ${o.text} | value: ${o.value} | disabled: ${o.disabled}`);
  }

  // Verify that "Japan" appears in any of the dropdown options (case-insensitive)
  const foundJapan = allOptionTexts.some(t => t.toLowerCase().includes('japan'));
  console.log(`Found 'Japan' in options: ${foundJapan}`);
  expect(foundJapan).toBeTruthy();
});
