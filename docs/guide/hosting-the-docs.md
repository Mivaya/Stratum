# Hosting the documentation site

This repo ships a [VitePress](https://vitepress.dev/) site in `/docs`. Sapphire and Discordeno use [Docusaurus](https://docusaurus.io/) — both are solid choices; VitePress is lighter to bootstrap and fits markdown-first docs in the same folder as the site.

## Run locally

```bash
cd docs
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

Build static output:

```bash
pnpm build
pnpm preview
```

From the repo root:

```bash
pnpm docs:dev
pnpm docs:build
```

## Deploy to GitHub Pages

1. Add `.github/workflows/docs.yml` (see below).
2. In GitHub repo **Settings → Pages**, set source to **GitHub Actions**.
3. Push to `main` — the site publishes to `https://<user>.github.io/Stratum/`.

For a custom domain (e.g. `stratum.dev`), add a `CNAME` file in `docs/public/` and configure DNS.

### Example workflow

```yaml
name: Docs
on:
  push:
    branches: [main]
    paths: ['docs/**']
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
        working-directory: docs
      - run: pnpm build
        working-directory: docs
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist
      - uses: actions/deploy-pages@v4
```

Set `base: '/Stratum/'` in `.vitepress/config.ts` if using project Pages URL (not custom domain).

## Matching Sapphire / Discordeno

| | Sapphire | Discordeno | Stratum (this repo) |
|---|----------|------------|---------------------|
| Generator | Docusaurus | Docusaurus | VitePress |
| Content repo | [sapphiredev/docs](https://github.com/sapphiredev/docs) | `discordeno/discordeno/docs` | `/docs` in monorepo |
| API reference | TypeDoc plugin | Generated API docs | Future: TypeDoc → VitePress or separate section |

### Switching to Docusaurus later

If you outgrow VitePress (versioning, i18n, heavy plugin ecosystem):

```bash
pnpm create docusaurus@latest website classic
```

Move markdown from `/docs/guide`, `/docs/features`, etc. into `website/docs/`. Sapphire’s site lives in [sapphiredev/website](https://github.com/sapphiredev/website) — use it as a reference for sidebar structure and TypeDoc integration.

### Recommended next steps for a public site

1. **Custom domain** — `stratum.dev` or `docs.stratum.dev`
2. **Search** — VitePress local search (enabled by default) or Algolia DocSearch
3. **API reference** — TypeDoc on `@stratum/core` packages, linked from sidebar
4. **Version dropdown** — when you ship `1.0.0`, add VitePress version plugin or migrate to Docusaurus

## Internal docs

Contributor-only material (roadmap, phases, ADRs) lives in `/docs/internal`. It is **excluded from the public site build** (`srcExclude` in `.vitepress/config.ts`) and from the sidebar. Keep secrets and private URLs out of all docs folders.
