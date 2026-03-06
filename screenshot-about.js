import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });

  // Navigate to About page
  await page.goto('http://localhost:3001/about');

  // Wait for content to load
  await page.waitForSelector('.about-container', { timeout: 5000 });

  // Take full page screenshot
  await page.screenshot({
    path: 'screenshots/about-page-fixed.png',
    fullPage: true
  });

  console.log('Screenshot saved to screenshots/about-page-fixed.png');

  await browser.close();
})();
