import { defineBlueprint, field } from "@stambha/vault";

export const GuildBlueprint = defineBlueprint({
  prefix: field.string().default("!").build(),
  modLogChannel: field.string().nullable().default(null).build(),
  welcomeEnabled: field.boolean().default(true).build(),
});
