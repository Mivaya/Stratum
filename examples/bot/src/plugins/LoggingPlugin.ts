import { definePlugin } from "@stambha/plugins";

export const LoggingPlugin = definePlugin("logging", {
  postStart: async () => {
    console.log("[plugin:logging] Stambha client started");
  },
  postLoad: async () => {
    console.log("[plugin:logging] Pieces loaded");
  },
});
