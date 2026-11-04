# Meta Forge

MTG tournament data tool built with Hono, Drizzle ORM, and Cloudflare Workers. Workspace name: `meta-forge`.

## Related Guidance

- Before changing D1 schemas or migrations, read [Cloudflare guidance](../../docs/agents/cloudflare.md#d1-migrations).
- Before changing CSP or response headers, read [Cloudflare guidance](../../docs/agents/cloudflare.md#ssr-headers).

## API Requests

- The shell already has `META_FORGE_API_TOKEN` configured. Use `curl` with `-H "Authorization: Bearer ${META_FORGE_API_TOKEN}"` directly.
- Do not pass curl config files, generate tokens, or read credentials from `.dev.vars`. Never print or save the token.
- Follow the [MTG event-report skill](../../.agents/skills/mtg-event-report/SKILL.md) for authenticated requests and pagination. Apply its event-report workflow when preparing an event report.
