import { Command, ok, SlashOptionType, type AutocompleteContext, type CommandContext, type Registry } from "@stratum/core";
import { slashArgsFromContext } from "@stratum/args";

const FRUITS = ["apple", "apricot", "banana", "blueberry", "cherry", "grape", "mango", "orange", "peach", "strawberry"];

/** Slash `/search fruit:<autocomplete>` demo. */
export class SearchCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "search",
      description: "Search with autocomplete",
      kinds: ["slash"],
      category: "General",
      slashOptions: [
        {
          name: "fruit",
          description: "Pick a fruit",
          type: SlashOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
    });
  }

  async autocomplete(ctx: AutocompleteContext) {
    if (ctx.focusedOption !== "fruit") return;
    const q = ctx.userInput.toLowerCase();
    const matches = FRUITS.filter((f) => f.startsWith(q)).slice(0, 25);
    await ctx.respond(matches.map((name) => ({ name, value: name })));
  }

  async execute(ctx: CommandContext) {
    const fruit = slashArgsFromContext(ctx).getString("fruit");
    await ctx.reply(fruit ? `You picked **${fruit}**.` : "No fruit selected.");
    return ok(undefined);
  }
}
