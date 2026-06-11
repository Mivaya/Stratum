# Command tree & deploy (Phase 13)

Slash command groups, subcommands, prefix aliases, autocomplete, and deploy v2.

## Prefix aliases

```ts
super(registry, {
  name: "ping",
  aliases: ["p"],
  kinds: ["slash", "prefix"],
});
```

`!p` resolves to `ping` via `CommandIndex` and `InboundRouter.parsePrefixCommand`.

## Slash subcommands

### Inline tree (single Command class)

```ts
import { SlashOptionType } from "@stambha/core";

super(registry, {
  name: "config",
  description: "Bot configuration",
  subcommands: [
    { name: "show", description: "Show settings" },
    {
      name: "prefix",
      description: "Set prefix",
      options: [
        { name: "value", description: "New prefix", type: SlashOptionType.String, required: true },
      ],
    },
  ],
});

async execute(ctx: CommandContext) {
  const sub = ctx.slashPath?.subcommand;
  if (sub === "show") { ... }
}
```

### Leaf pieces (merged deploy)

```ts
// commands/Mod/BanCommand.ts
super(registry, {
  name: "ban",
  description: "Ban a member",
  slashRoot: "mod",
  slashRootDescription: "Moderation",
  slashSubcommand: "ban",
});
```

Multiple leaves with the same `slashRoot` merge into one `/mod` command at deploy time.

## Categories & help

```ts
category: "General",
subCategory: "Utility",
```

`HelpCommand` in the example bot lists commands via `client.commandIndex.byCategory()`.

## Autocomplete

Declare autocomplete on slash options and implement `autocomplete()` on the command:

```ts
slashOptions: [
  { name: "fruit", description: "...", type: SlashOptionType.String, autocomplete: true, required: true },
],

async autocomplete(ctx: AutocompleteContext) {
  if (ctx.focusedOption !== "fruit") return;
  await ctx.respond([{ name: "apple", value: "apple" }]);
}
```

Bridges route autocomplete interactions to the resolved command.

## Deploy v2

```ts
import { deployCommands } from "@stambha/rest";

const result = await deployCommands({
  token,
  applicationId: clientId,
  guildId,
  commands: client.registries.commands.values(),
  diff: true, // logs added / removed / updated names
});
```

`buildApplicationCommands()` from `@stambha/core` builds the JSON; `@stambha/rest` sends it to Discord.

### Permissions

```ts
import { Permission } from "@stambha/gates";

defaultMemberPermissions: Permission.BanMembers,
dmPermission: false,
```

## Context fields

| Field | Description |
|-------|-------------|
| `slashPath.root` | Top-level slash command name |
| `slashPath.group` | Subcommand group (if any) |
| `slashPath.subcommand` | Subcommand name (if any) |
| `commandName` | Same as `slashPath.root` for slash |

## See also

- [ARGS.md](./ARGS.md) — option parsing
- [GATES.md](./GATES.md) — preconditions
- [ROADMAP.md](./ROADMAP.md) — Phase 14 plugins