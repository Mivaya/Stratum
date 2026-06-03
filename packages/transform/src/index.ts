export type { StambhaUser, StambhaMessage, StambhaSlashInteraction } from "./shapes.js";

export {
  userFromDiscordJs,
  messageFromDiscordJs,
  slashInteractionFromDiscordJs,
  metaFromDiscordJsMessage,
  metaFromDiscordJsSlash,
} from "./discordjs.js";

export {
  userFromDiscordeno,
  messageFromDiscordeno,
  slashInteractionFromDiscordeno,
  metaFromDiscordenoMessage,
  metaFromDiscordenoSlash,
  defaultDiscordenoDesiredProperties,
  buildDiscordenoDesiredProperties,
  type DiscordenoMessageLike,
  type DiscordenoInteractionLike,
} from "./discordeno.js";

export {
  channelMessageBody,
  interactionReplyBody,
  webhookMessageBody,
} from "./rest.js";

export {
  scoutContextFromStambhaMessage,
  commandContextFromStambhaMessageViaRest,
  commandContextFromStambhaSlashViaRest,
  type ContextBuildOptions,
} from "./splitContext.js";

/** @deprecated Use {@link defaultDiscordenoDesiredProperties} */
export { defaultDiscordenoDesiredProperties as stambhaDesiredProperties } from "./discordeno.js";
