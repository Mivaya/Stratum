import type { CommandSlashPath } from "@stratum/core";

interface SlashPathSource {
  commandName: string;
  options: {
    getSubcommandGroup(required?: boolean): string | null;
    getSubcommand(required?: boolean): string | null;
  };
}

export function slashPathFromInteraction(interaction: SlashPathSource): CommandSlashPath {
  const path: CommandSlashPath = { root: interaction.commandName };
  const group = interaction.options.getSubcommandGroup(false);
  const sub = interaction.options.getSubcommand(false);
  if (group) path.group = group;
  if (sub) path.subcommand = sub;
  return path;
}
