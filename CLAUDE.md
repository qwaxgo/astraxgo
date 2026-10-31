# qwaxgo.com

Astro site. UI follows the melta UI design system (https://github.com/tsubotax/melta-ui).

- Style with Tailwind utilities following melta's DESIGN.md; tokens live in `src/styles/global.css`.
- Use the semantic colours (`bg-bg-page`, `bg-bg-surface`, `text-text-heading`, `text-body`,
  `text-text-muted`, `text-text-accent`, `border-border-default`, ...) so dark mode follows automatically.
- Icons: `src/components/Icon.astro` (Charcoal icons in `src/assets/icons`).
- Page shell: `src/layouts/BaseLayout.astro`. Content width is `max-w-[1042px]` everywhere.
- After UI changes run `npm run build && npm run lint:design` (melta's rule lint over the built HTML).
  The `melta-ui` MCP server in `.mcp.json` serves the tokens, component specs and rules.
