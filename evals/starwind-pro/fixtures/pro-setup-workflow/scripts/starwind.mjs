import { readFile, writeFile } from "node:fs/promises";

const args = process.argv.slice(2);
if (args[0] !== "setup") {
  console.error("This cached fixture supports only: starwind setup");
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
  JSON.stringify({ command: "setup", yes: true, package_manager: packageManager }, null, 2) + "\n",
);

const config = JSON.parse(await readFile("starwind.config.json", "utf8"));
config.pro = {
  registry: {
    url: "https://pro.starwind.dev/r/{name}",
    headers: { Authorization: "Bearer ${STARWIND_LICENSE_KEY}" },
  },
};
await writeFile("starwind.config.json", JSON.stringify(config, null, 2) + "\n");

let gitignore = "";
try {
  gitignore = await readFile(".gitignore", "utf8");
} catch {}
if (!gitignore.split(/\r?\n/).includes(".env.local")) {
  gitignore += (gitignore && !gitignore.endsWith("\n") ? "\n" : "") + ".env.local\n";
}
await writeFile(".gitignore", gitignore);
await writeFile(".env.local", "# Starwind Pro registry setup\nSTARWIND_LICENSE_KEY=your_starwind_pro_license_key\n");

console.log(
  [
    "Starwind Pro is now configured!",
    "Created .env.local and updated .gitignore",
    "Add your license key to .env.local as STARWIND_LICENSE_KEY",
    "Install Pro components with starwind add @starwind-pro/component-name",
  ].join("\n"),
);
