import { definePlugin } from "@stratum/plugins";

export const LoggingPlugin = definePlugin("logging", {
  postStart: async () => {
    console.log("[plugin:logging] Stratum client started");
  },
  postLoad: async () => {
    console.log("[plugin:logging] Pieces loaded");
  },
});
