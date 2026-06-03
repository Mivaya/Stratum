import { describe, expect, it, vi } from "vitest";
import { createStambhaBot, MockBridge } from "@stambha/core";
import { attachPlugins, ContainerToken, definePlugin, LoggerToken, StambhaContainer } from "./index.js";

describe("@stambha/plugins", () => {
  it("runs hooks in order", async () => {
    const order: string[] = [];
    const container = new StambhaContainer();
    const client = createStambhaBot({ container });
    const bridge = new MockBridge();
    client.setBridge(bridge);

    await attachPlugins(client, {
      plugins: [
        definePlugin("a", {
          preInit: () => {
            order.push("preInit");
          },
          postInit: () => {
            order.push("postInit");
          },
          postLoad: () => {
            order.push("postLoad");
          },
          preStart: () => {
            order.push("preStart");
          },
          postStart: () => {
            order.push("postStart");
          },
        }),
      ],
    });

    await client.pluginLifecycle?.runHook("postLoad");
    await client.start();

    expect(order).toEqual(["preInit", "postInit", "postLoad", "preStart", "postStart"]);
  });

  it("registers container and logger on binder", async () => {
    const container = new StambhaContainer();
    const client = createStambhaBot({ container });

    await attachPlugins(client, { plugins: [] });

    expect(client.binder.resolve(ContainerToken)).toBe(container);
    expect(client.binder.resolve(LoggerToken)).toBe(container.logger);
  });

  it("logs via container logger in plugin hook", async () => {
    const info = vi.fn();
    const container = new StambhaContainer({
      logger: { debug: vi.fn(), info, warn: vi.fn(), error: vi.fn() },
    });
    const client = createStambhaBot({ container });

    await attachPlugins(client, {
      plugins: [
        definePlugin("logging", {
          postInit: ({ container: c }) => {
            c.logger.info("plugins ready");
          },
        }),
      ],
    });

    expect(info).toHaveBeenCalledWith("plugins ready");
  });
});
