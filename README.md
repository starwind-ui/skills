# Starwind UI Skills

Agent skills for Starwind UI v3 in Astro and React, plus Starwind Pro blocks for Astro.

## Skills

- `starwind-ui`: initialize or migrate Starwind UI, add and update styled components, choose
  Primitive or Runtime layers, compose framework-correct UI, and customize Tailwind CSS v4 themes.
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
- `@starwind-ui/mcp` when available
- Local config, installed source, framework files, and tests

For Starwind Pro work, prefer current MCP/CLI/Pro metadata. Pro license values belong in environment
files such as `.env.local`, never committed source.

## Evaluation References

`references/shadcn-ui` is a pinned, read-only snapshot of the official shadcn/ui skill used for
comparison and evaluation. See its `UPSTREAM.md` and `LICENSE.md` for provenance and license.
