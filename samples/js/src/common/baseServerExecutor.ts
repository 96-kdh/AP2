import type { Message, Task, TaskUpdater } from "./a2aTypes";
import { extractTextParts, extractDataParts } from "./messageUtils";

export interface RequestContext {
  message: Message;
}

export abstract class BaseServerExecutor {
  protected systemPrompt: string;

  constructor(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
  }

  async execute(context: RequestContext, updater: TaskUpdater, currentTask?: Task): Promise<void> {
    const textParts = extractTextParts(context.message.parts);
    const dataParts = extractDataParts(context.message.parts);
    await this.handleRequest(textParts, dataParts, updater, currentTask);
  }

  protected abstract handleRequest(
    textParts: string[],
    dataParts: Array<Record<string, unknown>>,
    updater: TaskUpdater,
    currentTask?: Task,
  ): Promise<void>;
}
