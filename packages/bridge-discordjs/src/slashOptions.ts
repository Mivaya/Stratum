import type { SlashOption, ParsedSlashOptionType } from "@stratum/core";
import {
  ApplicationCommandOptionType,
  type APIApplicationCommandOption,
  type ChatInputCommandInteraction,
} from "discord.js";

function mapOptionType(type: ApplicationCommandOptionType): ParsedSlashOptionType | null {
  switch (type) {
    case ApplicationCommandOptionType.String:
      return "string";
    case ApplicationCommandOptionType.Integer:
      return "integer";
    case ApplicationCommandOptionType.Number:
      return "number";
    case ApplicationCommandOptionType.Boolean:
      return "boolean";
    case ApplicationCommandOptionType.User:
      return "user";
    case ApplicationCommandOptionType.Channel:
      return "channel";
    case ApplicationCommandOptionType.Role:
      return "role";
    case ApplicationCommandOptionType.Mentionable:
      return "mentionable";
    case ApplicationCommandOptionType.Attachment:
      return "attachment";
    default:
      return null;
  }
}

function collectOption(option: APIApplicationCommandOption, out: SlashOption[]): void {
  if (
    option.type === ApplicationCommandOptionType.Subcommand ||
    option.type === ApplicationCommandOptionType.SubcommandGroup
  ) {
    if ("options" in option && option.options) {
      for (const nested of option.options) {
        collectOption(nested, out);
      }
    }
    return;
  }

  const mapped = mapOptionType(option.type);
  if (!mapped || !("value" in option) || option.value === undefined) return;

  let value: string | number | boolean = option.value as string | number | boolean;
  if (mapped === "user" || mapped === "channel" || mapped === "role" || mapped === "mentionable") {
    value = String(option.value);
  }
  if (mapped === "attachment") {
    value = String(option.value);
  }

  out.push({ name: option.name, type: mapped, value });
}

/** Extract normalized slash options from a discord.js interaction. */
export function slashOptionsFromInteraction(
  interaction: ChatInputCommandInteraction,
): SlashOption[] {
  const out: SlashOption[] = [];
  for (const option of interaction.options.data) {
    collectOption(option, out);
  }
  return out;
}
