---
layout: home

hero:
  name: Stambha
  text: Native Discord bot framework
  tagline: Piece-based command DX. Multi-process scale. No discord.js required.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Why Stambha
      link: /guide/why-stambha
    - theme: alt
      text: View on GitHub
      link: https://github.com/mivaya/Stambha

features:
  - title: Command pipeline
    details: Commands, hooks, gates, scouts, barriers, and epilogues — a familiar piece-based mental model.
  - title: Native REST
    details: Centralized rate limits and split-tier REST workers via @stambha/rest — no discord.js in your REST process.
  - title: Gateway & sharding
    details: GatewayEventHub, worker bus, identify budget, and resharding helpers for large bots.
  - title: Vault
    details: Typed guild, user, and member config alongside your ORM — no second schema for prefixes, flags, and module toggles.
  - title: Sequences & signals
    details: Multi-step flows and button/modal/select routing without boilerplate state machines.
  - title: Tier split
    details: Run gateway, REST, and bot logic in separate processes when you need large-bot topology.
---

## Quick install

```bash
pnpm add @stambha/core @stambha/rest @stambha/gateway @stambha/transform @stambha/loader
```

Requires **Node.js 20+**.

## Migrating?

Coming from another bot stack? See [migration guides](/migration/) — use the native stack (`@stambha/rest`, `@stambha/gateway`, `@stambha/transform`).
