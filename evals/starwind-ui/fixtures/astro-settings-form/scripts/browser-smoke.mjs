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
  await page.goto(origin + "/settings/");

  const forms = page.locator("form");
  if (await forms.count() !== 1) throw new Error("Expected exactly one account settings form.");
  const form = forms.first();
  const names = await form.locator("[name]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("name")));
  for (const expected of ["email", "sms", "push"]) {
    if (!names.some((name) => name?.toLowerCase().includes(expected))) {
      throw new Error(`Missing independently named ${expected} preference in the account form.`);
    }
  }

  const save = form.locator('button[type="submit"]').first();
  await save.click();
  if (await save.getAttribute("aria-busy") === "true") {
    throw new Error("Save entered its busy state before native required fields were valid.");
  }

  const textboxes = form.getByRole("textbox");
  await textboxes.nth(0).fill("Ada Lovelace");
  await textboxes.nth(1).fill("ada@example.com");
  await form.evaluate((node) => node.requestSubmit());
  await page.waitForFunction(() => {
    const button = document.querySelector("form button[type=submit]");
    return button?.disabled && button.getAttribute("aria-busy") === "true";
  });
  if (!await form.locator('[data-slot="spinner"]').isVisible()) {
    throw new Error("Spinner is not visible during the valid-submit busy state.");
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
