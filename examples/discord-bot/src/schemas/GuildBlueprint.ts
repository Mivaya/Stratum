import { defineBlueprint, field } from "@stratum/vault";

export const GuildBlueprint = defineBlueprint({
  prefix: field.string().default("!"),
  modLogChannel: field.string().nullable().default(null),
});

export type GuildData = ReturnType<typeof GuildBlueprint.defaults>;
