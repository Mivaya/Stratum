# Migration

Onboarding paths from **Sapphire** and **Discordeno** to Stambha's native transport stack.

| Guide | Audience |
|-------|----------|
| [From Sapphire](/migration/from-sapphire) | Sapphire bots → native Stambha |
| [From Discordeno](/migration/from-discordeno) | Discordeno big bots → tier split + native REST/gateway |

## Native stack

| Need | Package |
|------|---------|
| REST + slash deploy | `@stambha/rest` |
| Gateway events + routing | `@stambha/gateway` |
| Payload normalization | `@stambha/transform` |

Legacy `@stambha/bridge-*` packages were **removed** — use the table above.

## Related

- [Getting started](/guide/getting-started)
- [Project structure](/guide/project-structure)
- [Tier split](/deployment/tier-split)
