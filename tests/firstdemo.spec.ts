import { test, expect } from '@playwright/test';

test('facebook signup and fill details', async ({ page }) => {
    await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded' });

    // Dismiss common cookie / privacy banners that might block the button
    const cookieSelectors = [
        "text=Allow essential and optional cookies",
        "text=Accept All",
        "text=Accept Cookies",
        "button:has-text('Allow essential and optional cookies')",
    ];
    for (const sel of cookieSelectors) {
        const el = page.locator(sel).first();
        if (await el.count() > 0) {
            await el.click().catch(() => {});
            break;
        }
    }

    // Click the "Create new account" control (may be a button or link)
    const createSelectors = [
        page.getByRole('button', { name: /create new account/i }),
        page.getByRole('link', { name: /create new account/i }),
        page.locator("text=Create new account"),
    ];

    let clicked = false;
    for (const locator of createSelectors) {
        if (await locator.count() > 0) {
            await locator.first().click({ timeout: 10000 }).catch(() => {});
            clicked = true;
            break;
        }
    }

    expect(clicked).toBeTruthy();

    // Helper: wait until a locator exists and is visible (polled)
    async function waitForVisible(selector: string, timeout = 20000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const loc = page.locator(selector).first();
            if (await loc.count() > 0 && await loc.isVisible())
                return loc;
            await page.waitForTimeout(250);
        }
        return null;
    }

    // Wait for the sign-up modal to appear and fill the form
    const firstNameLoc = await waitForVisible('input[name="firstname"]', 20000);
    if (!firstNameLoc) throw new Error('Sign-up first name field not visible');

    await firstNameLoc.fill('John');
    await page.fill('input[name="lastname"]', 'Doe');

    // Use a unique email to avoid collisions
    const uniqueEmail = `john.doe+${Date.now()}@example.com`;
    const emailSelector = 'input[name="reg_email__"]';
    const emailLoc = await waitForVisible(emailSelector, 8000);
    if (emailLoc) {
        await emailLoc.fill(uniqueEmail);
        // When filling email, Facebook sometimes shows a second confirmation field
        const confirmEmail = 'input[name="reg_email_confirmation__"]';
        const confirmLoc = page.locator(confirmEmail).first();
        if (await confirmLoc.count() > 0 && await confirmLoc.isVisible()) {
            await confirmLoc.fill(uniqueEmail);
        }
    }

    await page.fill('input[name="reg_passwd__"]', 'P@ssw0rd123');

    // Select a birthday
    if (await page.locator('select[name="birthday_day"]').count() > 0) {
        await page.selectOption('select[name="birthday_day"]', '10');
    }
    if (await page.locator('select[name="birthday_month"]').count() > 0) {
        await page.selectOption('select[name="birthday_month"]', '6');
    }
    if (await page.locator('select[name="birthday_year"]').count() > 0) {
        await page.selectOption('select[name="birthday_year"]', '1990');
    }

    // Choose a gender (pick the first available radio input)
    const genderRadios = page.locator('input[name="sex"]');
    if (await genderRadios.count() > 0) {
        await genderRadios.first().check();
    }

    // Sanity-check that fields were filled
    await expect(page.locator('input[name="firstname"]')).toHaveValue('John');
    await expect(page.locator('input[name="lastname"]')).toHaveValue('Doe');
    await expect(page.locator('input[name="reg_passwd__"]')).toHaveValue('P@ssw0rd123');
});

