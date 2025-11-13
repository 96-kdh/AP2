import type { Message, Task } from "./a2aTypes";
import { A2aMessageBuilder } from "./a2aMessageBuilder";

export interface A2aClient {
  send(message: Message): Promise<Task>;
}

/**
 * Very small wrapper used to represent a "remote" agent. In this demo we plug in
 * in-memory clients instead of real HTTP calls.
 */
export class PaymentRemoteA2aClient {
  constructor(private clientFactory: { create(): A2aClient }) {}

  async sendWithBuilder(builder: A2aMessageBuilder): Promise<Task> {
    const client = this.clientFactory.create();
    const message = builder.build();
    return client.send(message);
  }

  async send(message: Message): Promise<Task> {
    const client = this.clientFactory.create();
    return client.send(message);
  }
}
