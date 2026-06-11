# @stambha/args

**Typed argument parsing** — prefix command lexer and slash option resolver. Sapphire `@sapphire/plugin-subcommands` Args parity without coupling to discord.js.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha)

---

## Install

```bash
npm install @stambha/args @stambha/core
```

Requires **Node.js 20+**.

---

## Quick start

### Prefix commands

```ts
import { Args, replyIfArgError, stringArg, unwrapArg } from "@stambha/args";
import { Command, ok, type CommandContext, type Registry } from "@stambha/core";

export class EchoCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, { name: "echo", kinds: ["prefix"] });
  }

  async execute(ctx: CommandContext) {
    const args = Args.fromContext(ctx);
    const picked = args.pick(stringArg);
    if (await replyIfArgError(ctx, picked)) return ok(undefined);

    const text = unwrapArg(picked);
    await ctx.reply(text ?? "Usage: `!echo <message>`");
    return ok(undefined);
  }
}
```

### Slash commands

```ts
import { SlashArgs } from "@stambha/args";

const args = SlashArgs.fromContext(ctx);
const target = args.getString("target");
const count = args.getInteger("count");
```

### Reply on parse errors

```ts
import { replyIfArgError } from "@stambha/args";

if (await replyIfArgError(ctx, picked)) return ok(undefined);
```

---

## Built-in resolvers

`Args` includes parsers for `string`, `integer`, `float`, `boolean`, `user`, `member`, `channel`, `role`, `mention`, `rest`, and more — see package exports.

Low-level lexer: `tokenize`, `joinFrom`.

---

## Key exports

| Export | Purpose |
|--------|---------|
| `Args` | Prefix argument parsers |
| `SlashArgs`, `slashArgsFromContext` | Slash option parsers |
| `tokenize`, `joinFrom` | Prefix lexer |
| `replyArgError`, `replyIfArgError` | User-facing arg errors |

---

## Related packages

| Package | Role |
|---------|------|
| [`@stambha/core`](../core) | `CommandContext`, `ctx.args` |
| [`@stambha/gates`](../gates) | Run checks before parsing |

---

## Development

```bash
pnpm --filter @stambha/args build
pnpm --filter @stambha/args test
```
