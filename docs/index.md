---
layout: home

hero:
  name: Stambha
  text: Native Discord bot framework
  tagline: Sapphire-style pieces. Discordeno-style scale. No discord.js required.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/mivaya/Stambha

features:
  - title: Command pipeline
    details: Commands, hooks, gates, scouts, barriers, and epilogues — the same mental model as Sapphire preconditions and listeners.
  - title: Native REST
    details: Centralized rate limits and split-tier REST workers via @stambha/rest — no discord.js in your REST process.
  - title: Gateway & sharding
    details: GatewayEventHub, worker bus, identify budget, and resharding helpers for large bots.
  - title: Vault
    details: Typed guild, user, and member config alongside your ORM — no second schema for prefixes, flags, and module toggles.
  - title: Sequences & signals
    details: Multi-step flows and button/modal/select routing without boilerplate state machines.
  - title: Tier split
    details: Run gateway, REST, and bot logic in separate processes when you need Discordeno-scale topology.
---

## Quick install

```bash
pnpm add @stambha/core @stambha/rest @stambha/gateway @stambha/transform @stambha/loader
```

Requires **Node.js 20+**.

## Migrating?

Coming from [Sapphire](/migration/from-sapphire) or [Discordeno](/migration/from-discordeno)? We have dedicated guides — library bridges are deprecated in favor of the native stack.
