import type { AutocompleteContext } from "@stratum/core";
import { MessageFlags, type AutocompleteInteraction } from "discord.js";
import { slashPathFromInteraction } from "./slashPath.js";

export function autocompleteContextFromInteraction(
  interaction: AutocompleteInteraction,
): AutocompleteContext {
  const focused = interaction.options.getFocused(true);
  const path = slashPathFromInteraction(interaction);

  return {
    commandName: interaction.commandName,
    slashPath: path,
    focusedOption: focused.name,
    userInput: String(focused.value ?? ""),
    userId: interaction.user.id,
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    raw: interaction,
    respond: async (choices) => {
      await interaction.respond(choices.slice(0, 25));
    },
  };
}

/** @internal noop export for ephemeral flag reuse */
export { MessageFlags };
