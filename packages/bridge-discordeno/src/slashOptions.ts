import type { SlashOption, SlashOptionType } from "@stratum/core";
import { ApplicationCommandOptionTypes } from "@discordeno/bot";
import type { DiscordenoInteraction } from "./types.js";

function mapType(type: number): SlashOptionType | null {
  switch (type) {
    case ApplicationCommandOptionTypes.String:
      return "string";
    case ApplicationCommandOptionTypes.Integer:
      return "integer";
    case ApplicationCommandOptionTypes.Number:
      return "number";
    case ApplicationCommandOptionTypes.Boolean:
      return "boolean";
    case ApplicationCommandOptionTypes.User:
      return "user";
    case ApplicationCommandOptionTypes.Channel:
      return "channel";
    case ApplicationCommandOptionTypes.Role:
      return "role";
    case ApplicationCommandOptionTypes.Mentionable:
      return "mentionable";
    case ApplicationCommandOptionTypes.Attachment:
      return "attachment";
    default:
      return null;
  }
}

function collect(
  option: {
    name: string;
    type: number;
    value?: unknown;
    options?: Array<{ name: string; type: number; value?: unknown; options?: unknown[] }>;
  },
  out: SlashOption[],
): void {
  if (
    option.type === ApplicationCommandOptionTypes.SubCommand ||
    option.type === ApplicationCommandOptionTypes.SubCommandGroup
  ) {
    for (const nested of option.options ?? []) {
      collect(nested as typeof option, out);
    }
    return;
  }

  const mapped = mapType(option.type);
  if (!mapped || option.value === undefined) return;

  let value: string | number | boolean;
  if (typeof option.value === "boolean" || typeof option.value === "number") {
    value = option.value;
  } else {
    value = String(option.value);
  }

  out.push({ name: option.name, type: mapped, value });
}

export function slashOptionsFromInteraction(interaction: DiscordenoInteraction): SlashOption[] {
  const out: SlashOption[] = [];
  const data = interaction.data;
  if (!data?.options) return out;

  for (const option of data.options) {
    collect(option as Parameters<typeof collect>[0], out);
  }
  return out;
}
