import { describe, expect, it } from "vitest";
import { Command } from "../registries/Command.js";
import { Registry } from "../pieces/Registry.js";
import { StambhaClient } from "../client/StambhaClient.js";
import { buildApplicationCommands } from "./buildSlashPayload.js";
import { SlashOptionType } from "./slashTypes.js";
import { ok } from "../outcome/Outcome.js";

class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ping",
      description: "Ping",
      aliases: ["p"],
      kinds: ["slash", "prefix"],
    });
  }
  execute = async () => ok(undefined);
}

class ModBanCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ban",
      description: "Ban a member",
      slashRoot: "mod",
      slashRootDescription: "Moderation",
      slashSubcommand: "ban",
      kinds: ["slash"],
    });
  }
  execute = async () => ok(undefined);
}

class ConfigCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "config",
      description: "Bot configuration",
      kinds: ["slash"],
      subcommands: [
        { name: "show", description: "Show settings" },
        {
          name: "prefix",
          description: "Set prefix",
          options: [
            {
              name: "value",
              description: "New prefix",
              type: SlashOptionType.String,
              required: true,
            },
          ],
        },
      ],
    });
  }
  execute = async () => ok(undefined);
}

describe("buildApplicationCommands", () => {
  it("builds top-level commands", () => {
    const client = new StambhaClient();
    const ping = new PingCommand(client.registries.commands);
    client.register(ping);

    const body = buildApplicationCommands(client.registries.commands.values());
    expect(body).toHaveLength(1);
    expect(body[0]!.name).toBe("ping");
  });

  it("merges slashRoot leaf commands", () => {
    const client = new StambhaClient();
    client.register(new ModBanCommand(client.registries.commands));
    client.register(
      new (class extends Command {
        constructor(r: Registry<Command>) {
          super(r, {
            name: "kick",
            description: "Kick",
            slashRoot: "mod",
            slashSubcommand: "kick",
            kinds: ["slash"],
          });
        }
        execute = async () => ok(undefined);
      })(client.registries.commands),
    );

    const body = buildApplicationCommands(client.registries.commands.values());
    expect(body).toHaveLength(1);
    expect(body[0]!.name).toBe("mod");
    expect(body[0]!.options?.length).toBe(2);
  });

  it("builds inline subcommands", () => {
    const client = new StambhaClient();
    client.register(new ConfigCommand(client.registries.commands));
    const body = buildApplicationCommands(client.registries.commands.values());
    expect(body[0]!.options?.map((o) => o.name)).toEqual(["show", "prefix"]);
  });
});

describe("CommandIndex", () => {
  it("resolves prefix aliases", () => {
    const client = new StambhaClient();
    client.register(new PingCommand(client.registries.commands));
    expect(client.commandIndex.resolvePrefixName("p")).toBe("ping");
  });

  it("resolves slash subcommand paths", () => {
    const client = new StambhaClient();
    client.register(new ModBanCommand(client.registries.commands));
    const cmd = client.commandIndex.resolveSlash({ root: "mod", subcommand: "ban" });
    expect(cmd?.name).toBe("ban");
  });
});

describe("InboundRouter aliases", () => {
  it("maps alias to primary name when parsing prefix", () => {
    const client = new StambhaClient({ prefix: "!" });
    client.register(new PingCommand(client.registries.commands));
    expect(client.router.parsePrefixCommandWithPrefix("!p", "!")).toEqual({
      name: "ping",
      args: "",
    });
  });
});
