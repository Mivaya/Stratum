# Contributing to Stambha

Thank you for helping make Stambha a stronger framework for advanced Discord bots. This guide covers how to propose changes, open pull requests, and what we look for before merging.

## Ways to contribute

- **Bug reports** — reproducible steps, expected vs actual behavior, Node version, and which bridge you use (`discord.js` or Discordeno).
- **Feature proposals** — open an issue first for non-trivial work so design can be discussed before you invest time in a large PR.
- **Code** — fixes, tests, docs, examples, new bridges, Vault drivers, or core pipeline improvements.
- **Examples & docs** — clearer guides, migration notes from Sapphire or Discordeno, or real-world usage patterns.

## Before you start

1. Read the [README](../README.md) and relevant docs under [`docs/`](../docs/).
2. Search [existing issues](https://github.com/mivaya/Stambha/issues) to avoid duplicate work.
3. For **large features** (new package, breaking API, new transport), open an issue and wait for alignment before coding.

### Good first contributions

- Test coverage for edge cases in `@stambha/core`
- Documentation fixes and typos
- Example bots or command patterns
- Driver or metrics work in [**Stambha-plugins**](https://github.com/Mivaya/Stambha-plugins) (`@stambha/vault-sql`, `@stambha/metrics`, `@stambha/cache`)

### Advanced contributions we welcome

- New transport bridges (must stay thin — map events/contexts, do not leak transport types into core)
- Tier-split and sharding hardening
- Sequence and Signal UX helpers
- Performance work with benchmarks
- Plugin-style extensions that do **not** require core to depend on discord.js or Discordeno

## Releases (publishable package changes)

The core monorepo uses **fixed versioning** — all `@stambha/*` packages share one version. Maintainers bump versions, tag, and publish via GitHub Releases (see [.github/PUBLISHING.md](./PUBLISHING.md)). **Do not** bump `package.json` versions in contributor PRs unless asked.

Extensions in [**Stambha-plugins**](https://github.com/Mivaya/Stambha-plugins) use **independent** versioning.

## Development setup

```bash
git clone https://github.com/mivaya/Stambha.git
cd Stambha
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

Requirements:

- **Node.js 20+** (22.5+ for SQLite in **Stambha-plugins** `@stambha/vault-sql`)
- **pnpm 9+** (see root `packageManager` field)

Run tests for a single package:

```bash
pnpm --filter @stambha/core test
```

## Branch workflow

1. **Fork** the repository on GitHub.
2. **Clone** your fork and add upstream:
   ```bash
   git remote add upstream https://github.com/mivaya/Stambha.git
   ```
3. **Branch** from the latest `main`:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-short-name
   ```
4. Use the naming convention: **`feature/{short-name}`**  
   Examples: `feature/vault-redis`, `feature/bridge-fix-interactions`, `feature/docs-sequences`
5. **Commit** in focused steps with clear messages (see below).
6. **Push** to your fork and open a **Pull Request** against `mivaya/Stambha` → `main`.

Keep your branch up to date:

```bash
git fetch upstream
git rebase upstream/main
```

**Same-repo PRs:** when `main` moves, [update-pr-branches.yml](./.github/workflows/update-pr-branches.yml) automatically merges `main` into open PR branches (enable **Allow updating pull request branches** in repo settings — see [REPOSITORY_SETTINGS.md](./REPOSITORY_SETTINGS.md)). You may see “out of date” for ~1 minute until that workflow finishes.

**Fork PRs:** Actions cannot push to your fork — rebase locally before review:

```bash
git fetch upstream && git rebase upstream/main && git push --force-with-lease
```

## Pull request checklist

Before requesting review, confirm:

- [ ] `pnpm build` passes
- [ ] `pnpm test` passes (add or update tests when behavior changes)
- [ ] `pnpm lint` passes (`pnpm lint:fix` for auto-fixes)
- [ ] `pnpm typecheck` passes
- [ ] Changes are scoped — one concern per PR when possible
- [ ] Public API changes are reflected in docs and/or examples
- [ ] No secrets, tokens, or `.env` files committed

Fill out the [pull request template](pull_request_template.md) completely.

## Commit messages

Use clear, imperative subject lines:

```
fix(core): handle empty customId in signal router
feat(vault): add debounce flush on shutdown
docs: add Discordeno tier-split example
test(rest): cover deployCommands dry-run
```

Optional scope: `core`, `rest`, `gateway`, `transform`, `vault`, `loader`, `docs`, `examples`, or open PRs in **Stambha-plugins** for extensions.

## Code guidelines

Stambha is a **transport-agnostic** framework. Keep these principles in mind:

### Core vs bridges

| Layer | Responsibility |
|-------|----------------|
| `@stambha/core` | Routing, pipeline, registries, sequences, chron — **no** discord.js or Discordeno imports |
| `@stambha/transform` | Normalize Discord payloads ↔ Stambha contexts |
| `@stambha/vault`, `@stambha/loader`, etc. | Optional packages that integrate via `@stambha/core` types |

Do not import bridge-specific types into core. If core needs a capability, add a small interface in core and implement it in the bridge.

### Piece model

Follow existing naming and folder conventions (see [project structure](../docs/guide/project-structure.md)):

- `Command`, `Hook`, `Scout`, `Barrier`, `Gate`, `Epilogue`, `Conduit`, `Signal`, `Chron`

New piece types belong in core only when they fit the execution pipeline and benefit most bots.

### TypeScript

- Match existing strictness (`exactOptionalPropertyTypes`, ESM).
- Prefer explicit types on public APIs.
- Avoid `any`; use narrow types or documented casts at bridge boundaries when Discord libraries limit typings.

### Style

- [Biome](https://biomejs.dev/) is the linter — run `pnpm lint` before pushing.
- Match surrounding code: minimal abstractions, no drive-by refactors.
- Comments only for non-obvious behavior.

### Tests

- Use **Vitest** in the package you change.
- Core logic should be testable with `MockBridge` where possible.
- Bridge tests may mock Discord payloads; keep fixtures small and readable.

### Breaking changes

The project is pre-`1.0.0`, but breaking changes should still be:

1. Called out clearly in the PR description
2. Documented in `docs/` or README
3. Updated in examples if affected

## Review process

1. A maintainer will review for design fit, test coverage, and transport separation.
2. Address feedback with new commits or fixup commits on your branch.
3. Once approved, your PR will be squashed or merged per maintainer preference.

We aim to be constructive and timely. If a PR is large, we may ask you to split it into smaller reviewable pieces.

## Community standards

- Be respectful and patient in issues and reviews.
- Assume good intent.

## Questions

- **Bugs & features:** [GitHub Issues](https://github.com/mivaya/Stambha/issues)
- **Security issues:** please do not open a public issue; contact the maintainer privately via the email in `package.json` author field.

Thank you for contributing to Stambha.
