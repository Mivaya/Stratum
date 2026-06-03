import { Scout, type Registry, type ScoutContext } from "@stambha/core";

export class MentionScout extends Scout {
  constructor(registry: Registry<Scout>) {
    super(registry, {
      name: "mention-log",
      triggers: ["message"],
      ignoreBots: true,
      priority: 200,
    });
  }

  async run(ctx: ScoutContext): Promise<void> {
    const botId = this.client.botUserId;
    if (!botId) return;

    const content = (ctx.raw as { content?: string })?.content ?? "";
    if (!content.includes(`<@${botId}>`) && !content.includes(`<@!${botId}>`)) return;

    console.log(`[scout:mention] ${ctx.userId} mentioned the bot in ${ctx.guildId ?? "DM"}`);
  }
}
