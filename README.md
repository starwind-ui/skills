# Starwind UI Skills

Agent skills for installing, composing, theming, and using Starwind UI and Starwind Pro in Astro projects.

## Skills

- `starwind-ui`: initialize Starwind UI, add components, compose Astro UI, customize themes, migrate shadcn-style theme tokens, and use current Starwind docs or MCP context.
- `starwind-pro`: configure Pro support, search free and premium blocks, install exact returned commands, and adapt Pro Astro blocks while respecting license boundaries.

## Install

```bash
npx skills add starwind-ui/skills
```

## Sources

The skills are designed to prefer current Starwind sources and local project state:

- `https://starwind.dev/llms.txt`
- `https://starwind.dev/llms-full.txt`
- `https://pro.starwind.dev/docs/getting-started/`
- `https://pro.starwind.dev/components/`
- Starwind docs Markdown alternates linked from docs pages
- `@starwind-ui/mcp` when available
- Local Starwind project files and installed component source

For Starwind Pro work, agents should prefer the MCP `search_starwind_pro_blocks` and `starwind_add` tools when available, then fall back to current Pro docs or component pages. Pro license values belong in environment files such as `.env.local`, never in committed source.
