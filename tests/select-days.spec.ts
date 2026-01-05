import { test, expect } from '@playwright/test';

test('select day checkboxes sequentially', async ({ page }) => {
    await page.goto('https://testautomationpractice.blogspot.com/', { waitUntil: 'domcontentloaded' });

    // Dismiss cookie/privacy banners if present
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

    // Collect all checkboxes on the page and select them one after another
    const checkboxes = page.locator('input[type="checkbox"]');
    const total = await checkboxes.count();
    expect(total).toBeGreaterThan(0);

    for (let i = 0; i < total; i++) {
        const cb = checkboxes.nth(i);
        await cb.scrollIntoViewIfNeeded();
        if (!(await cb.isChecked())) {
            // Prefer .check(), fallback to click()
            try {
                await cb.check({ timeout: 5000 });
            } catch {
                await cb.click({ timeout: 5000 });
            }
        }
        await expect(cb).toBeChecked();
        await page.waitForTimeout(300); // small pause to simulate human action
    }
});
