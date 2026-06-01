import type { AutocompleteContext } from "@stratum/core";
import { InteractionResponseTypes } from "@discordeno/bot";
import type { StratumBot } from "./createStratumDiscordenoBot.js";
import type { DiscordenoInteraction } from "./types.js";
import { slashPathFromInteraction } from "./slashPath.js";

export function autocompleteContextFromInteraction(
  bot: StratumBot,
  interaction: DiscordenoInteraction,
): AutocompleteContext {
  const focused = interaction.data?.options?.find((o) => o.focused);
  const path = slashPathFromInteraction(interaction);

  return {
    commandName: path.root,
    slashPath: path,
    focusedOption: focused?.name ?? "",
    userInput: String(focused?.value ?? ""),
    userId: String(interaction.user!.id),
    guildId: interaction.guildId ? String(interaction.guildId) : null,
    channelId: interaction.channelId ? String(interaction.channelId) : null,
    raw: interaction,
    respond: async (choices) => {
      if (!interaction.id || !interaction.token) return;
      await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseTypes.ApplicationCommandAutocompleteResult,
        data: { choices: choices.slice(0, 25).map((c) => ({ name: c.name, value: c.value })) },
      });
    },
  };
}
