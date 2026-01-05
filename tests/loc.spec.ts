import {test, expect, Locator } from "@playwright/test";

test('Locators in Playwright', async ({ page }) => {

    await page.goto("https://demo.nopcommerce.com/");

    // 1. page.getByAltText() - identifies images (and similar elements) based on the alt attribute.
   // Use this locator when your element supports alt text such as img and area elements.

    const logo:Locator= page.getByAltText("nopCommerce demo store")
    await expect(logo).toBeVisible();

})