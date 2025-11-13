import type { Message, Part, Role } from "./a2aTypes";

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `msg-${idCounter}`;
}

export class A2aMessageBuilder {
  private message: Message;

  constructor(role: Role = "agent") {
    this.message = {
      id: nextId(),
      parts: [],
      role,
    };
  }

  setContextId(contextId: string): this {
    this.message.context_id = contextId;
    return this;
  }

  addText(text: string): this {
    this.message.parts.push({ text_part: { text } });
    return this;
  }

  addData(key: string, data: unknown): this {
    this.message.parts.push({ data_part: { key, data } });
    return this;
  }

  build(): Message {
    return this.message;
  }
}
