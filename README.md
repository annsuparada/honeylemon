# Honey Lemon monorepo

npm workspaces layout: **`apps/*`** (deployable Next.js apps) and **`packages/*`** (shared libraries).

## Layout

```text
├── apps/
│   └── travomad/          # Next.js app (workspace `@honeylemon/travomad`)
├── packages/
│   ├── theme/             # Tailwind + daisyUI preset (Honey Lemon brand optional)
│   ├── ui/                # shared React components (transpiled by Next)
│   ├── cms/               # Zod schemas / validation (no secrets)
│   └── server/            # shared API helpers: auth, http, email, Prisma services, route factories
├── docs/
└── MONOREPO-TODO.md       # migration checklist (may reference historical items)
```

## Commands

Run from the **repository root** (dependencies hoist to the root `node_modules`).

| Task | Command |
|------|---------|
| Dev server | `npm run dev` or `npm run dev -w @honeylemon/travomad` |
| Production build | `npm run build` or `npm run build -w @honeylemon/travomad` |
| Start (after build) | `npm run start -w @honeylemon/travomad` |
| Lint | `npm run lint -w @honeylemon/travomad` |
| Tests | `npm test` (Jest: app + `packages/ui`) |
| Prisma generate | `npm run prisma:generate` (app schema in `apps/travomad`) |

App-specific scripts (Cloudinary tests, read-time update, etc.) run with `-w @honeylemon/travomad`, for example:

`npm run test:cloudinary -w @honeylemon/travomad`

## Environment

Copy or symlink `.env` into **`apps/travomad/.env`** for local Next/Prisma, or keep a single `.env` at the repo root and point tooling accordingly—Next resolves env files from the app directory by default.

## Vercel

Create or edit the Vercel project with **Root Directory** set to **`apps/travomad`**. Re-apply environment variables there after the move.

## Shared packages (Phase 3)

| Package | Role |
|--------|------|
| `@honeylemon/theme` | `tailwind.config` uses `require('@honeylemon/theme')({ honeylemonBrand: true/false })`; keeps daisyUI + `@tailwindcss/aspect-ratio` in one place. |
| `@honeylemon/ui` | Cross-app components (e.g. `FormattedDate`). Apps set `transpilePackages: ['@honeylemon/ui']`. Tailwind `content` includes `../../packages/ui/src/**`. |
| `@honeylemon/cms` | Post / category / user Zod schemas; apps re-export from `schemas/*.ts` so existing `@/schemas/...` imports stay stable. |
| `@honeylemon/server` | Server/API layer: JWT (`auth`), `NextResponse` helpers (`http`), email factory (`email`), Prisma blog services (`blog`), thin **route factories** (`routes/*`). Apps add `transpilePackages: ['@honeylemon/server']` and pass secrets/Prisma from `lib/config` / `prisma/client`. |

**How to use `@honeylemon/server`:** see [`docs/SERVER_PACKAGE.md`](docs/SERVER_PACKAGE.md).

`packages/auth` as a separate package is optional per `MONOREPO-TODO.md`; JWT helpers live under `@honeylemon/server/auth` instead.

## Docs

- [`docs/SERVER_PACKAGE.md`](docs/SERVER_PACKAGE.md) — `@honeylemon/server` exports, route shims, testing
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — broader architecture notes

## App docs

- [`apps/travomad/README.md`](apps/travomad/README.md) — app product docs
