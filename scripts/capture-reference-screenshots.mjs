import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const references = [
  { slug: "klimaflow", url: "https://klima-rendszer.hu/" },
  { slug: "berbeadva", url: "https://berbeadva.hu/" },
  { slug: "tetojavitas-mesterfokon", url: "https://tetojavitasmesterfokon.hu/" },
];

const outputDir = path.resolve("public/references");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
let captured = 0;

async function capture(page, slug, suffix, options) {
  await page.setViewportSize(options.viewport);
  await page.goto(options.url, {
    waitUntil: "domcontentloaded",
    timeout: 45_000,
  });
  await page.waitForTimeout(2_500);
  await page.screenshot({
    path: path.join(outputDir, `${slug}-${suffix}.webp`),
    type: "webp",
    quality: 84,
    fullPage: false,
    animations: "disabled",
  });
}

for (const reference of references) {
  const context = await browser.newContext({
    locale: "hu-HU",
    colorScheme: "light",
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  const page = await context.newPage();

  try {
    await capture(page, reference.slug, "desktop", {
      url: reference.url,
      viewport: { width: 1600, height: 1000 },
    });
    await capture(page, reference.slug, "mobile", {
      url: reference.url,
      viewport: { width: 430, height: 932 },
    });
    captured += 1;
    console.log(`Captured ${reference.url}`);
  } catch (error) {
    console.error(`Could not capture ${reference.url}:`, error);
  } finally {
    await context.close();
  }
}

await browser.close();

if (captured === 0) {
  throw new Error("No live reference site could be captured.");
}
