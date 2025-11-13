import type { Message, Part, TaskUpdater } from "./a2aTypes";

let idCounter = 0;
function nextMessageId(): string {
  idCounter += 1;
  return `agent-msg-${idCounter}`;
}

/**
 * Simple console-based TaskUpdater for the demo. It just logs messages.
 */
export class ConsoleTaskUpdater implements TaskUpdater {
  context_id?: string;

  constructor(contextId?: string) {
    this.context_id = contextId;
  }

  newAgentMessage(parts: Part[]): Message {
    return {
      id: nextMessageId(),
      parts,
      role: "agent",
      context_id: this.context_id,
    };
  }

  async complete(message: Message): Promise<void> {
    // eslint-disable-next-line no-console
    console.log("[TaskUpdater.complete]", JSON.stringify(message, null, 2));
  }

  async failed(message: Message): Promise<void> {
    // eslint-disable-next-line no-console
    console.error("[TaskUpdater.failed]", JSON.stringify(message, null, 2));
  }
}
