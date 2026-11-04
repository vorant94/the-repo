# Cloudflare Guidance

Read the relevant section when working on D1 migrations or CSP/response headers in a Cloudflare application.

## D1 Migrations

Drizzle Kit uses the SQLite dialect for D1 and has no config option to generate D1-specific migration SQL.

- Review generated migrations that rebuild tables or change foreign keys: D1 enforces foreign keys inside implicit transactions, so `PRAGMA foreign_keys=OFF` does not disable them.
- `PRAGMA defer_foreign_keys=ON` only postpones validation until the transaction ends; all references must be valid then.
- Rewrite incompatible migrations and apply them to a disk-backed local D1 database with representative rows and foreign keys before production. An empty database migration run does not prove that existing data will migrate successfully.
- Do not rename migration files after they have been applied; Wrangler records their filenames in `d1_migrations`.

## SSR Headers

Some projects have two CSP sources: `public/_headers` covers static assets, while Worker or framework middleware must set the equivalent header on SSR/API responses. Keep both policies in sync when changing CSP.
