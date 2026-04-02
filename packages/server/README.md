# `@honeylemon/server`

Shared server-only helpers for Honey Lemon CMS apps: **HTTP responses**, **JWT**, **email**, **Prisma blog services**, and **Next.js App Router route factories**.

## Documentation

See the monorepo guide (exports, examples, new-app checklist, Jest mocking):

**[`docs/SERVER_PACKAGE.md`](../../docs/SERVER_PACKAGE.md)**

## Quick install (in an app)

```json
"@honeylemon/server": "*"
```

```js
// next.config.mjs
transpilePackages: ['@honeylemon/server'],
```

Peers: `next`, `zod`, `@prisma/client`, `jsonwebtoken`, `nodemailer`, `bcrypt`, `@honeylemon/cms`.
