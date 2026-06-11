# Arguments (`@stambha/args`)

Sapphire-style **Args** for prefix commands and typed **slash option** accessors.

## Installation

```bash
pnpm add @stambha/args
```

Bridges populate `CommandContext.argsText` (prefix) and `CommandContext.slashOptions` (slash).

## Prefix commands

```ts
import { Args, integerArg, replyIfArgError, stringArg } from "@stambha/args";

async execute(ctx: CommandContext) {
  const args = Args.fromContext(ctx);

  const a = args.pickType("integer");
  if (await replyIfArgError(ctx, a)) return ok(undefined);

  const b = args.pickType("integer");
  if (await replyIfArgError(ctx, b)) return ok(undefined);

  if (a.ok && b.ok) {
    await ctx.reply(`Sum: ${Number(a.value) + Number(b.value)}`);
  }
  return ok(undefined);
}
```

### Lexer

- Whitespace-separated tokens
- `"quoted strings"` and `'quoted strings'`
- Basic `\` escapes inside quotes

```ts
import { tokenize } from "@stambha/args";
tokenize('say "hello world"'); // ["say", "hello world"]
```

### Built-in types

| Type | Resolver |
|------|----------|
| `string` | Raw token |
| `integer` | Whole number |
| `number` | Float |
| `boolean` | true/false, yes/no, 1/0 |
| `rest` | Remaining text (via `pickRest()` / `rest()`) |
| `stringArray` | Comma-separated in one token |

### Custom resolvers

```ts
import { defineArgResolver, type ArgResolver } from "@stambha/args";

const hexColor: ArgResolver<string> = (param) => {
  if (!/^#[0-9a-f]{6}$/i.test(param)) {
    return { ok: false, error: { code: "INVALID", message: "Invalid hex color.", parameter: param } };
  }
  return { ok: true, value: param };
};

defineArgResolver("hexColor", hexColor);
args.pickType("hexColor");
```

## Slash commands

```ts
import { slashArgsFromContext } from "@stambha/args";

async execute(ctx: CommandContext) {
  const opts = slashArgsFromContext(ctx);
  const value = opts.getString("value");
  const count = opts.getInteger("count") ?? 1;

  const required = opts.requireString("name");
  if (await replyIfArgError(ctx, required)) return ok(undefined);
}
```

Bridges normalize discord.js / Discordeno interaction options into `SlashOption[]` on the context.

## Unified helper

```ts
import { argsForContext } from "@stambha/args";

const args = argsForContext(ctx); // Args or SlashArgs based on ctx.kind
```

## Error handling

- `ArgResult<T>` — `{ ok: true, value }` or `{ ok: false, error }`
- `ArgParseError` — thrown by `unwrapArg()`
- `replyArgError(ctx, error)` — user-facing reply
- `replyIfArgError(ctx, result)` — reply and return `true` when failed

## Example

See `examples/bot/src/commands/General/EchoCommand.ts`.

## See also

- [GATES.md](./GATES.md) — pre-execution checks
- [Command tree & deploy](/features/command-tree) — slash groups, deploy, autocomplete
