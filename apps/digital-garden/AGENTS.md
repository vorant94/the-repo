# Digital Garden

Astro blog with React components and Cloudflare hosting. Workspace name: `digital-garden`.

## Architecture

- Content collections are defined in `src/content.config.ts`; posts live in `src/blog/`.
- The app includes i18n and custom rehype/remark plugins.

## Related Guidance

- Before changing D1 schemas or migrations, read [Cloudflare guidance](../../docs/agents/cloudflare.md#d1-migrations).
- Before changing CSP or response headers, read [Cloudflare guidance](../../docs/agents/cloudflare.md#ssr-headers).
- When modifying React components, read [React patterns](../../docs/agents/react.md).

## Testing

- Playwright E2E tests run through this app's pipeline.
- Use this package's `e2e`, `e2e:ui`, and `e2e:install` scripts as appropriate.
