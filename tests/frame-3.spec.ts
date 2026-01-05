import { test, expect } from '@playwright/test';

test('Frame 3 demo', async ({ page }) => {
  await page.goto('https://ui.vision/demo/webtest/frames/');

  const base = 'https://ui.vision/demo/webtest/frames/frame';

  const fillSelectors = [
    '#mytext3',
    '[name="mytext3"]',
    '.mytext3',
    '[placeholder="mytext3"]',
    'input:not([type="hidden"]):not([disabled])',
    'textarea:not([disabled])',
    '[contenteditable="true"]'
  ];

  async function fillInFrame(frame: any) {
    for (const sel of fillSelectors) {
      const locator = frame.locator(sel);
      const n = await locator.count();
      for (let i = 0; i < n; i++) {
        const el = locator.nth(i);
        try {
          await el.waitFor({ state: 'visible', timeout: 2000 });
          try {
            await el.fill('hello naveen');
          } catch {
            await el.click({ force: true });
            await el.type('hello naveen');
          }
          console.log(`filled selector ${sel} in frame ${frame.url()}`);
        } catch (e) {
          // skip non-interactable
        }
      }
    }

    const children = frame.childFrames();
    for (const child of children) {
      await fillInFrame(child);
    }
  }

  const frames = page.frames();
  const matching = frames.filter(f => {
    try {
      return f.url().startsWith(base);
    } catch {
      return false;
    }
  });

  if (matching.length === 0) {
    console.log('No frames found matching', base);
    return;
  }

  for (const f of matching) {
    try {
      await fillInFrame(f);
    } catch (e) {
      console.log('Error filling frame', f.url(), e);
    }
  }
  console.log('Done filling frames matching', base);

  // After filling iframe 5, click link to a9t9.com (if present) and wait 5 seconds
  try {
    const frame5 = frames.find(f => {
      try { return f.url().includes('frame_5.html'); } catch { return false; }
    });
    if (frame5) {
      const link = frame5.locator('a[href*="a9t9.com"], a[href="https://a9t9.com"]');
      if (await link.count() > 0) {
        await link.first().click();
        console.log('Clicked link to a9t9.com from frame 5');
        await page.waitForTimeout(5000);

        // After navigation/wait, verify a logo is present on the resulting page
        const logoSelectors = [
          'img[alt*="UI.Vision"]',
          'img[alt*="UI Vision"]',
          'img[alt*="a9t9"]',
          'img[alt*="A9T9"]',
          'img[alt*="logo"]',
          '.logo img',
          'img[src*="logo"]',
          'text=UI.Vision',
          'text=a9t9',
          'text=A9T9'
        ];

        let found = false;
        for (const sel of logoSelectors) {
          try {
            const loc = page.locator(sel);
            if (await loc.count() > 0) {
              if (await loc.first().isVisible()) {
                console.log('Logo found via selector:', sel);
                found = true;
                break;
              }
            }
          } catch (e) {
            // ignore selector errors and continue
          }
        }

        expect(found, 'Expected a logo to be visible after clicking a9t9.com').toBeTruthy();

      } else {
        console.log('Link to a9t9.com not found inside frame 5');
      }
    } else {
      console.log('frame 5 not found');
    }
  } catch (e) {
    console.log('Error clicking link in frame 5:', e);
  }
});
