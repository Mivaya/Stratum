import type {
  SequenceButtonOption,
  SequenceModalField,
  SequenceSelectOption,
  SequenceSelectStep,
  SequenceStep,
} from "./types.js";

/** Fluent builder for multi-step interaction flows (rendering is transport-specific). */
export class SequenceBuilder {
  private readonly steps: SequenceStep[] = [];
  private defaultTimeoutMs = 60_000;

  timeout(ms: number): this {
    this.defaultTimeoutMs = ms;
    return this;
  }

  get defaultTimeout(): number {
    return this.defaultTimeoutMs;
  }

  button(
    id: string,
    prompt: string,
    buttons: SequenceButtonOption[],
    timeoutMs?: number,
  ): this {
    this.steps.push({
      id,
      type: "button",
      prompt,
      buttons,
      timeoutMs: timeoutMs ?? this.defaultTimeoutMs,
    });
    return this;
  }

  select(
    id: string,
    prompt: string,
    options: SequenceSelectOption[],
    config?: { placeholder?: string; minValues?: number; maxValues?: number; timeoutMs?: number },
  ): this {
    this.steps.push({
      id,
      type: "select",
      prompt,
      options,
      ...(config?.placeholder ? { placeholder: config.placeholder } : {}),
      minValues: config?.minValues ?? 1,
      maxValues: config?.maxValues ?? 1,
      timeoutMs: config?.timeoutMs ?? this.defaultTimeoutMs,
    } satisfies SequenceSelectStep);
    return this;
  }

  modal(
    id: string,
    prompt: string,
    config: {
      title: string;
      openLabel?: string;
      fields: SequenceModalField[];
      timeoutMs?: number;
    },
  ): this {
    this.steps.push({
      id,
      type: "modal",
      prompt,
      title: config.title,
      openLabel: config.openLabel ?? "Continue",
      fields: config.fields,
      timeoutMs: config.timeoutMs ?? this.defaultTimeoutMs,
    });
    return this;
  }

  build(): { steps: SequenceStep[]; defaultTimeoutMs: number } {
    return { steps: [...this.steps], defaultTimeoutMs: this.defaultTimeoutMs };
  }
}

export function sequence(): SequenceBuilder {
  return new SequenceBuilder();
}
