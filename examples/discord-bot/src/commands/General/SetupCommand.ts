import { Command, ok, type CommandContext, type Registry } from "@stratum/core";
import { runSequence } from "@stratum/bridge-discordjs";
import type { StratumClient } from "@stratum/core";

export class SetupCommand extends Command {
  constructor(
    registry: Registry<Command>,
    private readonly client: StratumClient,
  ) {
    super(registry, {
      name: "setup",
      description: "Demo multi-step sequence (button → select → modal)",
      kinds: ["slash"],
    });
  }

  static create(ctx: { client: StratumClient }) {
    return new SetupCommand(ctx.client.registries.commands, ctx.client);
  }

  async execute(ctx: CommandContext) {
    const interaction = ctx.raw as import("discord.js").ChatInputCommandInteraction;

    const result = await runSequence(
      interaction,
      this.client.sequences,
      (flow) => {
        flow
          .button("role", "Pick a role:", [
            { id: "mod", label: "Moderator" },
            { id: "member", label: "Member" },
          ])
          .select(
            "channel",
            "Pick a channel type:",
            [
              { label: "General", value: "general" },
              { label: "Logs", value: "logs" },
            ],
            { placeholder: "Channel type" },
          )
          .modal("note", "Add a setup note:", {
            title: "Setup note",
            openLabel: "Add note",
            fields: [{ id: "text", label: "Note", style: "paragraph" }],
          });
      },
      { ephemeral: true },
    );

    if (result.cancelled) {
      await ctx.reply("Setup cancelled or timed out.");
      return ok(undefined);
    }

    await ctx.reply(
      `Setup complete!\n\`\`\`json\n${JSON.stringify(result.answers, null, 2)}\n\`\`\``,
    );
    return ok(result.answers);
  }
}
