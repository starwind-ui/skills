import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const command = args[0];
if (command !== "migrate") {
  console.error("This cached fixture supports only: starwind migrate");
  process.exit(1);
}
const option = (name) => args[args.indexOf(name) + 1];
const packageManager = option("--package-manager");
if (!args.includes("--yes") || packageManager !== "pnpm") {
  console.error("This noninteractive fixture requires --yes --package-manager pnpm");
  process.exit(1);
}

await writeFile(
  ".starwind-cli-run.json",
  JSON.stringify({ command, yes: true, package_manager: packageManager }, null, 2) + "\n",
);

const legacy = JSON.parse(await readFile("starwind.config.json", "utf8"));
const componentDir = legacy.componentDir;
const backupDir = path.join(path.dirname(componentDir), "starwind-legacy");
await cp(componentDir, backupDir, { recursive: true, errorOnExist: true });

await mkdir(path.join(componentDir, "button"), { recursive: true });
await writeFile(path.join(componentDir, "button", "Button.astro"), '---\n---\n<button data-slot="button"><slot /></button>\n');
await mkdir(path.join(componentDir, "menu"), { recursive: true });
await writeFile(path.join(componentDir, "menu", "Menu.astro"), '---\n---\n<nav data-slot="menu"><slot /></nav>\n');
const pagePath = "src/pages/index.astro";
const page = await readFile(pagePath, "utf8");
await writeFile(
  pagePath,
  page
    .replaceAll("starwind/old-menu", "starwind/menu")
    .replaceAll("OldMenu", "Menu"),
);

const nextConfig = {
  "$schema": "https://starwind.dev/config-schema.v2.json",
  version: 2,
  framework: "astro",
  registry: { source: "bundled", version: "3.0.0" },
  tailwind: legacy.tailwind,
  componentDir,
  utilsDir: legacy.utilsDir,
  components: [
    { framework: "astro", name: "button", version: "3.0.0" },
    { framework: "astro", name: "menu", version: "3.0.0" },
    { name: "legacy-chart", source: "legacy", version: "0.8.0" },
  ],
};
await writeFile("starwind.config.json", JSON.stringify(nextConfig, null, 2) + "\n");

console.log(
  [
    "Migration Summary",
    "Backed up legacy components to:",
    "  src/components/starwind-legacy",
    "Successfully migrated components:",
    "  button",
    "  menu",
    "Kept legacy components:",
    "  legacy-chart",
    "Updated project imports/usages:",
    "  old-menu -> menu",
    "Left custom component folders untouched:",
    "  brand-banner",
  ].join("\n"),
);

