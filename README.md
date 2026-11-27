# Starwind UI Skills

Agent skills for Starwind UI v3 in Astro, React, Vue, and Svelte, plus Starwind Pro blocks for Astro.

## Skills

- `starwind-ui`: initialize or migrate Starwind UI, upgrade from the Vue or Svelte beta, add and
  update styled components (Chart included), choose Primitive or Runtime layers, compose
  framework-correct UI with RTL support, and customize Tailwind CSS v4 themes.
- `starwind-pro`: configure Pro support, search free and premium blocks, install exact returned
  commands, and adapt Pro Astro blocks while respecting license boundaries.

## Install

```bash
npx skills add starwind-ui/skills
```

## Sources

The skills prefer current Starwind sources and local project state:

- `https://starwind.dev/llms.txt`
- `https://starwind.dev/llms-full.txt`
- `https://starwind.dev/ai-manifest.json`
- Starwind per-page Markdown docs
- `https://pro.starwind.dev/docs/getting-started/`
- `https://pro.starwind.dev/components/`
- Installed package docs in `node_modules/@starwind-ui/<pkg>/docs/` (1.6.0 and newer)
- `@starwind-ui/mcp` 0.6.0 or newer when available
- Local config, installed source, framework files, and tests

For Starwind Pro work, prefer current MCP/CLI/Pro metadata. Pro license values belong in environment
files such as `.env.local`, never committed source.

## Evaluations

`evals/` holds repeatable forward tests for both skills. See [evals/README.md](./evals/README.md).
