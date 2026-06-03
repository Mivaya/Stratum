import { Command, ok, sequence, type CommandContext, type Registry } from "@stambha/core";

export class SetupCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "setup",
      description: "Start a multi-step setup flow (sequence builder demo)",
      kinds: ["slash", "prefix"],
      category: "Admin",
    });
  }

  async execute(ctx: CommandContext) {
    const flow = sequence()
      .button("role", "Pick a role:", [
        { id: "mod", label: "Moderator" },
        { id: "member", label: "Member" },
      ])
      .select("channel", "Pick a channel type:", [
        { label: "General", value: "general" },
        { label: "Announcements", value: "announcements" },
      ])
      .build();

    await ctx.reply(
      `Setup flow defined (${flow.steps.length} steps). ` +
        "Wire `runSequence` with your transport to collect answers — see docs/features/sequences.",
    );
    return ok(flow);
  }
}
