# Monorepo checklist — Travomad (HiMidLow later)

**Note:** `apps/starter` was removed from this repo; focus is **`apps/travomad`** only. Sections below that mention *starter* are historical unless you reintroduce a template app.

Use this list to maintain one **npm workspaces** monorepo with **`apps/travomad`**. **HiMidLow** is added in a **later phase** when you are ready. Shared **`packages/*`**, **per-app Prisma**, **Vercel** (one project per app).

Check items off as you go.

---

## Target layout (initial)

```text
repo/
├── package.json               # workspaces root, private
├── apps/
│   ├── travomad/              # production Travomad site
│   └── starter/               # neutral template → duplicate for new clients
└── packages/
    ├── theme/
    ├── ui/
    ├── cms/
    └── auth/                  # optional
```

**Later:** `apps/himidlow/` when you port HiMidLow into this monorepo.

---

## daisyUI — do you need to remove it?

**No.** A monorepo does not require removing daisyUI.

| Approach | When |
|----------|------|
| **Keep daisyUI in each app** | Travomad uses it, starter uses it—each app’s `tailwind.config` keeps `plugins: [require('daisyui')]` and `daisyui: { themes: [...] }`. Fine to start here. |
| **Centralize in `packages/theme`** | One Tailwind **preset** that includes the daisyUI plugin + shared theme names; each app uses `presets: [require('@your/theme')]` and only overrides per-brand tokens if needed. |
| **Remove daisyUI** | Only if you **choose** to standardize on plain Tailwind + your own components, or you want a smaller CSS bundle and are willing to replace `btn` / `card` style classes. **See Phase 7** for a full removal checklist. |

Placeholder images pointing at `img.daisyui.com` are unrelated to the plugin—you can swap those URLs anytime without removing daisyUI.

---

## Phase 0 — Decisions (one time)

- [ ] **Repo root:** new monorepo folder **or** repurpose an existing repo; Travomad + starter are the first apps inside it.
- [ ] Pick a package scope for `packages/*` (e.g. `@honeylemon` or `@your-org`).
- [ ] Each app (**Travomad**, **starter**, later **HiMidLow**) gets its **own** `DATABASE_URL` and Prisma DB.
- [ ] **daisyUI:** decide **per-app configs** for now **or** move plugin + themes into **`packages/theme`** when you extract shared styling.
- [ ] Optional: **Turborepo** later for CI caching.

---

## Phase 1 — Monorepo skeleton + Travomad → `apps/travomad`

- [x] Add **root** `package.json` with `"private": true` and `"workspaces": ["apps/*", "packages/*"]`.
- [x] Create `apps/`, `packages/`.
- [x] Place **Travomad** (duplicate/copy from current Travomad project) under **`apps/travomad`**—no `node_modules` / `.next` in the copy.
- [x] Set **`apps/travomad/package.json`** `name` (e.g. `@your-org/travomad`).
- [x] Single **root** `package-lock.json` (remove nested lockfile in the app if you adopt root-only install).
- [x] Run **`npm install` at repo root**; fix conflicts.
- [x] **Vercel (Travomad):** Root Directory **`apps/travomad`**, env vars, deploy OK.
- [x] **README:** layout + `npm run dev --workspace=...` for Travomad.

---

## Phase 2 — `apps/starter` from Travomad

- [x] **Duplicate** `apps/travomad` → **`apps/starter`** (or build starter from a trimmed copy).
- [x] **Neutralize** starter: placeholder site name, generic metadata, default theme / daisyUI theme suitable for “blank client.”
- [x] **`apps/starter/package.json`** `name` (e.g. `@your-org/starter`)—must differ from Travomad.
- [x] **Do not deploy** starter to a public customer domain unless you want a demo; optional internal Vercel project for QA.
- [x] Document: **new client** = duplicate **`apps/starter`** → `apps/<client>` (see Phase 5).

---

## Phase 3 — Shared packages (incremental)

After each step, **`dev` / `build`** for **both** `apps/travomad` and `apps/starter` should stay green.

### Theme (and optional daisyUI preset)

- [ ] Create **`packages/theme`**: Tailwind preset, CSS variables, and—if you want one place for it—**daisyUI plugin + `daisyui.themes`** re-exported for apps to extend.
- [ ] Point **Travomad** at the preset; **brand** differences = per-app overrides (CSS variables / theme name), not forked component libraries.

### UI

- [ ] **`packages/ui`**: shared components; `workspace:*` in both apps; **`transpilePackages`** in both `next.config` files.

### CMS

- [ ] **`packages/cms`**: types, helpers—no secrets; thin API routes in each app.

### Auth (optional)

- [ ] **`packages/auth`**: factories + types; secrets + `middleware` per app.

---

## Phase 4 — CI and maintenance

- [ ] **CI** at root: `npm ci`, lint, typecheck, **build** `apps/travomad`.
- [ ] **Dependabot** / **Renovate** on root.
- [ ] Document **Prisma migrate** per app.

---

## Phase 5 — New client from starter

- [ ] Duplicate **`apps/starter`** → **`apps/<client>`**.
- [ ] New **`package.json` `name`**, theme, metadata, assets.
- [ ] New **Vercel** project → Root **`apps/<client>`** → env + **`DATABASE_URL`**.
- [ ] **CMS** keys / tenant; **Prisma** for that DB only; domain.
- [ ] Optional: **`scripts/new-app.mjs`** to copy + rename.

---

## Phase 6 — Add HiMidLow later

- [ ] Copy **HiMidLow** project into **`apps/himidlow`** (or merge from existing HiMidLow-NextJS repo).
- [ ] **`apps/himidlow/package.json`** `name`; root **`npm install`**; fix duplicates with Travomad/starter.
- [ ] **Vercel:** new or relinked project, Root **`apps/himidlow`**.
- [ ] Align **HiMidLow** with shared **`packages/ui`**, **`packages/theme`**, **`packages/cms`** (incremental); **daisyUI** only if HiMidLow still uses it—same rules as above (per-app or preset).
- [ ] Update **CI** to build **`apps/himidlow`** too.

---

## Phase 7 — Remove daisyUI; custom components in `packages/ui`

Do this **after** `packages/ui` and `packages/theme` exist (Phase 3), so replacements live in **one** place and every app imports them. Work **incrementally**—keep `dev` / `build` green; optional to run this **before** or **after** adding HiMidLow (if after, include **`apps/himidlow`** in all steps below).

### Audit

- [ ] **Inventory:** search the repo for daisyUI usage (`btn`, `card`, `modal`, `navbar`, `dropdown`, `theme` data attributes, `daisyui` in config, etc.).
- [ ] **List primitives** you actually use (e.g. Button, Card, Badge, Input, Modal, Tabs)—skip building unused widgets up front.

### Theme without daisyUI

- [ ] **`packages/theme`:** define **semantic tokens** (colors, radius, shadows) with **CSS variables** and/or Tailwind `theme.extend`—**no** daisyUI plugin.
- [ ] Remove **`daisyui`** from the Tailwind preset once apps no longer depend on it.
- [ ] Per-app **brand** stays as overrides of the same variables (unchanged idea from Phase 3).

### Build replacements in `packages/ui`

- [ ] Implement **base components** with plain Tailwind + tokens (e.g. `Button`, `Card`, `Input`, `Label`, `Modal` / dialog pattern).
- [ ] Add **variants** (primary, outline, ghost) via `cva`, simple props, or CSS classes—match behavior you relied on from daisyUI.
- [ ] Ensure **accessibility**: focus states, `aria-*`, keyboard for modals/menus.
- [ ] Export from **`packages/ui`**; add **`transpilePackages`** if not already.

### Migrate apps (incremental)

- [ ] **Travomad:** replace daisyUI class strings / patterns with **`@your-org/ui`** components or token-based utilities **file-by-file** or **route-by-route**.
- [ ] **`apps/starter`:** same pass so the template has **no** daisyUI usage.
- [ ] **`apps/himidlow`** (when it exists): same migration.
- [ ] **Future `apps/<client>`:** only after **starter** is daisyUI-free so new clones start clean.

### Remove daisyUI from tooling

- [ ] Remove **`plugins: [require('daisyui')]`** and **`daisyui: { ... }`** from every app (and from **`packages/theme`** if it was there).
- [ ] **`npm uninstall daisyui`** at the right scope (root and/or each workspace—wherever it was declared); run **`npm install`** at repo root.
- [ ] Remove **`img.daisyui.com`** from **`next.config`** `images.domains` / `remotePatterns` if nothing else needs it; replace **placeholder image URLs** in code with your own assets or a neutral CDN.

### Verify

- [ ] **Visual QA** key pages (marketing, dashboard, forms) per app.
- [ ] **CI:** full **build** for all apps still passes.
- [ ] **Bundle / CSS:** optional comparison (before/after) to confirm CSS shrink if that was a goal.

---

## Quick reference

| App (phase)   | Path               | Vercel Root Directory   |
|---------------|--------------------|-------------------------|
| Travomad      | `apps/travomad`    | `apps/travomad`         |
| Starter       | `apps/starter`     | optional / internal     |
| HiMidLow      | `apps/himidlow`    | `apps/himidlow` (later) |
| Future client | `apps/<client>`    | `apps/<client>`         |

| Concern     | Where it lives                          |
|------------|------------------------------------------|
| daisyUI    | Per-app or preset **until Phase 7**; after Phase 7 → **custom `packages/ui` + tokens only** |
| Shared UI  | `packages/ui`                            |
| CMS logic  | `packages/cms`                         |
| Prisma     | `apps/<name>/prisma/`                    |

---

## New Cursor project

- Monorepo with **`apps/travomad`**, **`apps/starter`** first; **`apps/himidlow`** later.
- Shared `@scope/*` packages; per-app Prisma and Vercel root directories.
