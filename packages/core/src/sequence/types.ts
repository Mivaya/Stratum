export type SequenceStepType = "button" | "select" | "modal";

export interface SequenceStepBase {
  readonly id: string;
  readonly type: SequenceStepType;
  readonly prompt: string;
  readonly timeoutMs?: number;
}

export interface SequenceButtonOption {
  readonly id: string;
  readonly label: string;
}

export interface SequenceButtonStep extends SequenceStepBase {
  readonly type: "button";
  readonly buttons: SequenceButtonOption[];
}

export interface SequenceSelectOption {
  readonly label: string;
  readonly value: string;
}

export interface SequenceSelectStep extends SequenceStepBase {
  readonly type: "select";
  readonly placeholder?: string;
  readonly options: SequenceSelectOption[];
  readonly minValues?: number;
  readonly maxValues?: number;
}

export interface SequenceModalField {
  readonly id: string;
  readonly label: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly style?: "short" | "paragraph";
}

export interface SequenceModalStep extends SequenceStepBase {
  readonly type: "modal";
  readonly title: string;
  readonly openLabel: string;
  readonly fields: SequenceModalField[];
}

export type SequenceStep = SequenceButtonStep | SequenceSelectStep | SequenceModalStep;

export type SequenceAnswers = Record<string, string | string[] | Record<string, string>>;

export interface SequenceSession {
  readonly id: string;
  readonly userId: string;
  readonly guildId: string | null;
  readonly channelId: string;
  readonly createdAt: number;
  readonly timeoutMs: number;
}

export interface SequenceResult {
  readonly sessionId: string;
  readonly answers: SequenceAnswers;
  readonly cancelled: boolean;
}
