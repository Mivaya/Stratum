# Sequences (multi-step interactions)

Sequences chain **buttons → selects → modals** without manual collectors.

## Core (`@stratum/core`)

```ts
import { sequence } from "@stratum/core";

const flow = sequence()
  .button("role", "Pick a role:", [
    { id: "mod", label: "Moderator" },
    { id: "member", label: "Member" },
  ])
  .select("channel", "Pick channel:", [
    { label: "General", value: "general" },
  ])
  .modal("note", "Add a note:", {
    title: "Note",
    fields: [{ id: "text", label: "Note", style: "paragraph" }],
  });
```

`client.sequences` is the session store (timeouts, wrong-user checks).

## Discord (`@stratum/bridge-discordjs`)

```ts
import { runSequence } from "@stratum/bridge-discordjs";

const result = await runSequence(interaction, client.sequences, (flow) => {
  flow.button(/* … */).select(/* … */);
}, { ephemeral: true });

// result.answers — { role, channel, note }
```

Routing uses custom IDs: `stratum:seq:{sessionId}|{stepId}|{part}` (step IDs must not contain `|`).

## Example

`examples/discord-bot` — `/setup` command.
