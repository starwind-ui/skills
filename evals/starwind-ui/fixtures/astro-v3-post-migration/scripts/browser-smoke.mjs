import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const contentTypes = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml" };
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  const relative = pathname.endsWith("/") ? pathname + "index.html" : pathname;
  const file = path.join("dist", relative);
  try {
    const body = await readFile(file);
    response.writeHead(200, { "content-type": contentTypes[path.extname(file)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end();
  }
});
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const port = server.address().port;
const origin = "http://127.0.0.1:" + port;

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(origin + "/preferences/");

  const label = page.locator('[data-slot="combobox-label"]');
  if (!/timezone/i.test(await label.textContent() ?? "")) {
    throw new Error("The migrated timezone Combobox has no visible label.");
  }
  if (await page.locator('[data-slot="combobox-group"] [data-slot="combobox-item"]').count() < 2) {
    throw new Error("The timezone choices are not grouped as current Combobox anatomy.");
  }

  const preference = page.getByRole("switch").first();
  const accessibleName = await preference.getAttribute("aria-label");
  if (!accessibleName || accessibleName === "switch") {
    throw new Error("The migrated Switch still has its generic fallback name.");
  }

  await page.getByRole("button", { name: /edit profile/i }).click();
  if (!await page.getByRole("heading", { name: /edit profile/i }).isVisible()) {
    throw new Error("The migrated Dialog trigger did not open its dialog.");
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
