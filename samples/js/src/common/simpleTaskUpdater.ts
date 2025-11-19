import type { Message, Part, Task, TaskStatus, TaskUpdater } from "./a2aTypes";

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

/**
 * In-memory TaskUpdater that records the completion status so that an
 * HTTP server can return a Task payload to the caller.
 */
export class InMemoryTaskUpdater extends ConsoleTaskUpdater {
  private status: TaskStatus = "PENDING";
  private resultMessage?: Message;

  override async complete(message: Message): Promise<void> {
    this.status = "SUCCEEDED";
    this.resultMessage = message;
    await super.complete(message);
  }

  override async failed(message: Message): Promise<void> {
    this.status = "FAILED";
    this.resultMessage = message;
    await super.failed(message);
  }

  toTask(taskId?: string): Task {
    return {
      id: taskId ?? `task-${Date.now()}`,
      status: this.status,
      resultMessage: this.resultMessage,
    };
  }
}
