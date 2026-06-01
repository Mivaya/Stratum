/**
 * Tokenize prefix command argument text (Sapphire / lexure inspired).
 * Supports single and double quoted strings with basic backslash escapes.
 */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < input.length) {
    while (i < input.length && /\s/.test(input[i]!)) i++;
    if (i >= input.length) break;

    const char = input[i]!;

    if (char === '"' || char === "'") {
      const quote = char;
      i++;
      let value = "";
      while (i < input.length && input[i] !== quote) {
        if (input[i] === "\\" && i + 1 < input.length) {
          i++;
          value += input[i];
        } else {
          value += input[i];
        }
        i++;
      }
      if (i < input.length) i++;
      tokens.push(value);
      continue;
    }

    let value = "";
    while (i < input.length && !/\s/.test(input[i]!)) {
      value += input[i];
      i++;
    }
    tokens.push(value);
  }

  return tokens;
}

/** Join tokens from index onward (unparsed remainder). */
export function joinFrom(tokens: readonly string[], startIndex: number): string {
  return tokens.slice(startIndex).join(" ");
}
