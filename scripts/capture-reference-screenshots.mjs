import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const playwrightModule = process.env.PLAYWRIGHT_MODULE || "playwright";
const { chromium } = require(playwrightModule);

const references = [
  { slug: "klimaflow", url: "https://klima-rendszer.hu/" },
  { slug: "berbeadva", url: "https://berbeadva.hu/" },
  {
    slug: "tetojavitas-mesterfokon",
    url: "https://tetojavitasmesterfokon.hu/",
  },
];

const outputDir = path.resolve("public/references");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
let captured = 0;
const failures = [];

async function capture(page, slug, suffix, options) {
  await page.setViewportSize(options.viewport);
  const response = await page.goto(options.url, {
    waitUntil: "domcontentloaded",
    timeout: 45_000,
  });

  if (!response || !response.ok()) {
    throw new Error(
      `HTTP ${response?.status() ?? "no-response"} while loading ${options.url}`,
    );
  }

  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
  await page.waitForTimeout(2_000);

  await page.screenshot({
    path: path.join(outputDir, `${slug}-${suffix}.jpg`),
    type: "jpeg",
    quality: 86,
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
    failures.push(reference.url);
    console.error(`Could not capture ${reference.url}:`, error);
  } finally {
    await context.close();
  }
}

await browser.close();

if (captured === 0) {
  throw new Error(
    `No reference site could be captured. Failed: ${failures.join(", ")}`,
  );
}

if (failures.length > 0) {
  console.warn(
    `Reference capture partial: ${captured}/${references.length}. Failed: ${failures.join(", ")}`,
  );
}
