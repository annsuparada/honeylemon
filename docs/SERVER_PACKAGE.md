# Using `@honeylemon/server`

Shared **server-only** helpers for CMS-style Next.js apps: JWT auth, standardized API errors, email sending, Prisma-backed blog services, and **route-handler factories** so new apps only duplicate thin `app/api/.../route.ts` wiring.

Keep **secrets and env** in each app (for example `lib/config.ts`). The package receives **values** (JWT secret, SMTP credentials, `PrismaClient`), not `process.env` keys, so tests and white-label apps stay predictable.

---

## Add to a Next.js app

1. **Dependency** (workspace root installs once; app `package.json`):

   ```json
   "@honeylemon/server": "*"
   ```

2. **`next.config.mjs`** — transpile the package (same as `@honeylemon/ui`):

   ```js
   transpilePackages: ['@honeylemon/ui', '@honeylemon/server'],
   ```

3. **Peers** — ensure the app already has: `next`, `zod`, `@prisma/client`, `jsonwebtoken`, `nodemailer`, `bcrypt` (and `@honeylemon/cms` if you use blog routes or services that import schemas from it).

---

## Export map (subpaths)

| Subpath | Use for |
|---------|---------|
| `@honeylemon/server` | Barrel: auth, blog factories (not `blog/read-time` via barrel for client safety), email, http |
| `@honeylemon/server/http` | `handleError`, `successResponse`, `AppError`, etc. |
| `@honeylemon/server/auth` | `verifyToken`, `signToken` |
| `@honeylemon/server/email` | `createEmailService`, password-reset templates, **newsletter/campaign HTML**, unsubscribe **HMAC tokens** |
| `@honeylemon/server/blog` | `createPostService`, `createUserService`, `createCategoryService` |
| `@honeylemon/server/blog/read-time` | `calculateReadTime`, `calculateWordCount` (safe for **client** components) |
| `@honeylemon/server/routes/post` | `createPostApiHandlers` |
| `@honeylemon/server/routes/category` | `createCategoryApiHandlers` |
| `@honeylemon/server/routes/tag` | `createTagApiHandlers` |
| `@honeylemon/server/routes/user` | `createUserApiHandlers` |
| `@honeylemon/server/routes/login` | `createLoginApiHandlers` |
| `@honeylemon/server/routes/user-password` | `createUserPasswordApiHandlers` |
| `@honeylemon/server/routes/images` | Image upload + Unsplash search factories |
| `@honeylemon/server/routes/bearer-auth` | `requireBearerUserId` |
| `@honeylemon/server/routes/newsletter` | `createNewsletterApiHandlers` (subscribe, list, token unsubscribe) |
| `@honeylemon/server/routes/campaign` | `createCampaignApiHandlers` (broadcast POST + stats GET) |
| `@honeylemon/server/routes/campaign-preview` | `createCampaignPreviewApiHandlers` |
| `@honeylemon/server/routes/post-views` | `createPostViewsApiHandlers` (increment views by slug) |
| `@honeylemon/server/routes/test-email` | `createTestEmailApiHandlers` |
| `@honeylemon/server/routes/forgot-password` | `createForgotPasswordApiHandlers` |
| `@honeylemon/server/routes/reset-password` | `createResetPasswordApiHandlers` (bcrypt hash) |
| `@honeylemon/server/routes/check-pillar` | `createCheckPillarApiHandlers` (inject `checkPillarExists`) |
| `@honeylemon/server/routes/newsletter-verify-token` | `createNewsletterVerifyTokenApiHandlers` |
| `@honeylemon/server/routes` | Re-exports all of the above |

**Important:** Do **not** import `@honeylemon/server/blog` from client components — it pulls native modules (for example `bcrypt`). For read time in the browser, use `@honeylemon/server/blog/read-time` or a thin re-export in `app/lib/readTime-helpers.ts`.

---

## HTTP helpers (`@honeylemon/server/http`)

Use in API routes or re-export from the app:

```ts
import {
  handleError,
  successResponse,
  UnauthorizedError,
  AppError,
} from '@honeylemon/server/http';
```

Travomad keeps a stable path via `lib/middleware/errorHandler.ts` re-exporting these symbols.

---

## Auth (`@honeylemon/server/auth`)

```ts
import { verifyToken, signToken } from '@honeylemon/server/auth';

const payload = verifyToken(token, jwtSecret);
const token = signToken({ id, email, role }, jwtSecret, { expiresIn: '7d' });
```

Always pass the secret from app config, never hardcode.

---

## Email (`@honeylemon/server/email`)

```ts
import {
  createEmailService,
  createTestEmail,
  createPasswordResetEmail,
} from '@honeylemon/server/email';

const { sendEmail } = createEmailService({
  gmailUser: '...',
  gmailAppPassword: '...',
  brandName: 'My Site',
});

await sendEmail({ to, subject, html: createPasswordResetEmail(link, { brandName: 'My Site' }) });
```

### Newsletter and campaign mail (tokens + HTML)

Unsubscribe links use an HMAC over `unsubscribe:${email}` with your app’s JWT secret (same as Travomad’s `jwtConfig.secret`):

```ts
import {
  buildNewsletterUnsubscribeUrl,
  verifyNewsletterUnsubscribeToken,
  createNewsletterWelcomeEmailHtml,
  createCampaignBroadcastEmailHtml,
} from '@honeylemon/server/email';

const url = buildNewsletterUnsubscribeUrl(email, publicSiteUrl, jwtSecret);
const ok = verifyNewsletterUnsubscribeToken(token, email, jwtSecret);
```

HTML builders take a **`NewsletterMailSiteContext`**: `{ publicSiteUrl, jwtSecret, brandName }`, plus optional `campaignHeaderInnerHtml` for the campaign header.

### Newsletter / campaign route factories

Share the same **`mailCtx`** across routes (Travomad uses [`lib/cms-mail-context.ts`](../../apps/travomad/lib/cms-mail-context.ts)):

```ts
// app/api/newsletter/route.ts
import prisma from '@/prisma/client';
import { sendEmail } from '@/utils/services/emailService';
import { createNewsletterApiHandlers } from '@honeylemon/server/routes/newsletter';

const mailCtx = { publicSiteUrl, jwtSecret, brandName: 'My Site' };

const { POST, GET, DELETE } = createNewsletterApiHandlers({
  prisma,
  sendEmail,
  mailCtx,
});
export { POST, GET, DELETE };
```

```ts
// app/api/campaign/route.ts
const { POST, GET } = createCampaignApiHandlers({
  prisma,
  sendEmail,
  mailCtx,
  batchSize: 10,      // optional
  batchDelayMs: 1000, // optional
});
```

Preview send:

```ts
const { POST } = createCampaignPreviewApiHandlers({ sendEmail, mailCtx });
```

`sendEmail` must match **`CampaignSendEmailFn`**: `(opts: { to, subject, html }) => Promise<boolean>` (same shape as `createEmailService`’s `sendEmail`).

---

## Blog services (`@honeylemon/server/blog`)

Factories take your app’s `PrismaClient`:

```ts
import { createPostService, createUserService, createCategoryService } from '@honeylemon/server/blog';
import prisma from '@/prisma/client';

const posts = createPostService({ prisma });
await posts.getPosts(filter, limit);
```

Travomad exposes the same API through `lib/services/postService.ts` (and user/category) as named exports for older imports.

---

## Read time (client-safe)

```ts
import { calculateReadTime, calculateWordCount } from '@honeylemon/server/blog/read-time';
```

---

## Route factories (thin `route.ts` per app)

Next.js requires each app to own `app/api/.../route.ts`. Logic lives in `@honeylemon/server/routes/*`; the file only wires **deps**.

### Post

```ts
// app/api/post/route.ts
import prisma from '@/prisma/client';
import { jwtConfig } from '@/lib/config';
import { createPostService } from '@honeylemon/server/blog';
import { createPostApiHandlers } from '@honeylemon/server/routes/post';

const { GET, POST, PATCH, DELETE } = createPostApiHandlers({
  jwtSecret: jwtConfig.secret,
  postService: createPostService({ prisma }),
});

export { GET, POST, PATCH, DELETE };
```

### Category, user, login, tag, password

Same idea: import the matching `create*ApiHandlers`, pass `jwtSecret` and either `create*Service({ prisma })` or `prisma` (tag route uses Prisma directly). See Travomad’s `app/api/category/route.ts`, `user/route.ts`, `login/route.ts`, `tag/route.ts`, `user/password/route.ts`.

### Images / upload (inject app functions)

```ts
import { uploadImage } from '@/app/lib/uploadToCloudinary';
import { createLegacyImageFieldUploadRoute } from '@honeylemon/server/routes/images';

const { POST } = createLegacyImageFieldUploadRoute({ uploadImage });
export { POST };
```

Also available: `createMultipartImageUploadRoute`, `createImageFromUrlUploadRoute`, `createUnsplashSearchRoute({ searchImages })`.

### Bearer JWT guard (custom routes)

```ts
import { requireBearerUserId } from '@honeylemon/server/routes/bearer-auth';

const auth = requireBearerUserId(req, jwtSecret);
if (!auth.success) return auth.response;
// auth.userId
```

---

## Tests (Jest)

Mock **`@honeylemon/server/auth`** when tests stub JWT verification:

```ts
jest.mock('@honeylemon/server/auth', () => ({
  verifyToken: jest.fn(() => ({ id: 'user123' })),
}));
```

Route factories import that entry point so the mock applies. Do not mock internal `jwt.ts` paths unless you add a `moduleNameMapper` for them.

---

## Related packages

- **`@honeylemon/cms`** — Zod schemas only (no I/O, no secrets).
- **`@honeylemon/ui`** — React UI (not for API code).

---

## What stays in the app

- `app/api/**/route.ts` shims (wiring only, when using factories).
- `lib/config.ts` (env → typed config) and a small **`mailCtx`** object (`publicSiteUrl`, `jwtSecret`, `brandName`) for newsletter/campaign routes.
- `prisma/schema.prisma` and `prisma/client.ts`.
- Wired **`sendEmail`** from `createEmailService` + app SMTP config.
- Server Actions (`'use server'`), cookies, Next middleware.
- Routes you have not yet moved into `@honeylemon/server/routes/*`.
