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

Wire sequence steps to Discord components in your gateway worker — reply with buttons/selects/modals whose custom IDs use `stratum:seq:{sessionId}|{stepId}|{part}` (step IDs must not contain `|`).

## Example

See `examples/bot/src/commands/Admin/SetupCommand.ts`.
