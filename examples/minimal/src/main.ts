import {
  createStratumBot,
  MockBridge,
  Directive,
  ok,
  type DirectiveContext,
  type Registry,
} from "@stratum/core";

class PingDirective extends Directive {
  constructor(registry: Registry<Directive>) {
    super(registry, {
      name: "ping",
      description: "Replies with Pong!",
      kinds: ["slash", "prefix"],
    });
  }

  async execute(ctx: DirectiveContext) {
    await ctx.reply("Pong!");
    return ok(undefined);
  }
}

const bridge = new MockBridge();
const client = createStratumBot({ bridge, prefix: "!" });

client.register(new PingDirective(client.registries.directives));

client.on("ready", () => {
  console.log("Stratum bot ready (mock bridge).");
});

client.on("directiveSuccess", ({ directive, durationMs }) => {
  console.log(`Directive /${directive} OK (${durationMs.toFixed(1)}ms)`);
});

await client.start();

const ctx: DirectiveContext = {
  kind: "slash",
  directiveName: "ping",
  userId: "user-1",
  guildId: "guild-1",
  channelId: "channel-1",
  raw: {},
  reply: async (text) => console.log(`[reply] ${text}`),
  replyEphemeral: async (text) => console.log(`[ephemeral] ${text}`),
};

await client.invoke("ping", ctx);
await client.stop();
