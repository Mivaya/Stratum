import type { CommandSlashPath } from "@stratum/core";
import type { DiscordenoInteraction } from "./types.js";
import { ApplicationCommandOptionTypes } from "@discordeno/bot";

export function slashPathFromInteraction(interaction: DiscordenoInteraction): CommandSlashPath {
  const path: CommandSlashPath = { root: interaction.data?.name ?? "unknown" };
  const options = interaction.data?.options ?? [];

  for (const opt of options) {
    if (opt.type === ApplicationCommandOptionTypes.SubCommandGroup && opt.name) {
      path.group = opt.name;
      for (const nested of opt.options ?? []) {
        if (nested.type === ApplicationCommandOptionTypes.SubCommand && nested.name) {
          path.subcommand = nested.name;
        }
      }
    } else if (opt.type === ApplicationCommandOptionTypes.SubCommand && opt.name) {
      path.subcommand = opt.name;
    }
  }

  return path;
}
