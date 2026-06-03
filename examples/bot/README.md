# Full bot example

Sapphire-style folder layout with the **native** Stambha stack (`@stambha/gateway`, `@stambha/rest`, `@stambha/transform`).

## Layout

```text
src/
  commands/General/     Ping, echo, help, config
  commands/Admin/       Setup (sequence builder demo)
  listeners/            Ready hook
  scouts/               Mention logger
  barriers/             Maintenance mode
  gates/                Owner-only mode (optional)
  conduits/             Command logging
  epilogues/            Audit trail
  signals/              Button confirm handler
  tasks/                Heartbeat cron
  schemas/              Vault guild blueprint
  plugins/              Logging plugin (wired in setup)
  lib/setup.ts          Shared client + vault + loadPieces
  workers/              Optional tier-split processes
  main.ts
```

## Quick start

```bash
cp .env.example .env
pnpm install
pnpm demo          # no Discord token — simulates !ping, !echo, mention scout
```

With a token (monolith + in-process REST):

```bash
pnpm start
```

## Tier split (optional)

```bash
pnpm split:rest      # terminal 1
pnpm split:bot       # terminal 2
pnpm split:gateway   # terminal 3
# or single-process: pnpm split:demo
```

See [Tier split](../../docs/deployment/tier-split.md).
