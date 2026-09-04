```txt
npm install
npm run dev
```

Set a local JWT signing secret before starting the Worker:

```txt
JWT_SECRET=replace-with-a-long-random-secret
```

Store the same value in Cloudflare before deploying:

```txt
pnpm --filter meta-forge exec wrangler secret put JWT_SECRET
```

All `/api/*` requests require an `Authorization: Bearer <token>` header signed
with `JWT_SECRET` using HS256.

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```
