# Migration

Onboarding paths from **Sapphire** and **Discordeno** to Stratum's native transport stack.

| Guide | Audience |
|-------|----------|
| [From Sapphire](/migration/from-sapphire) | Sapphire bots → native Stratum |
| [From Discordeno](/migration/from-discordeno) | Discordeno big bots → tier split + native REST/gateway |

## Native stack

| Need | Package |
|------|---------|
| REST + slash deploy | `@stratum/rest` |
| Gateway events + routing | `@stratum/gateway` |
| Payload normalization | `@stratum/transform` |

Legacy `@stratum/bridge-*` packages were **removed** — use the table above.

## Related

- [Getting started](/guide/getting-started)
- [Project structure](/guide/project-structure)
- [Tier split](/deployment/tier-split)
