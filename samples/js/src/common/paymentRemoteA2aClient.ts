import type { Message, Task } from "./a2aTypes";
import { A2aMessageBuilder } from "./a2aMessageBuilder";

interface HttpA2aResponse {
  task?: Task;
  error?: string;
}

export class HttpA2aClient {
  constructor(private baseUrl: string, private extensionsHeader?: string) {}

  async send(message: Message): Promise<Task> {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    if (this.extensionsHeader) {
      headers["X-A2A-Extensions"] = this.extensionsHeader;
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Remote agent responded with ${response.status}`);
    }

    const payload = (await response.json()) as HttpA2aResponse;
    if (!payload.task) {
      throw new Error(payload.error ?? "Remote agent returned no task");
    }
    return payload.task;
  }
}

type ClientFactory = { create(): A2aClient } | { baseUrl: string; extensionHeader?: string };

export interface A2aClient {
  send(message: Message): Promise<Task>;
}

/**
 * Wrapper used to represent a "remote" agent. In this sample it can either use
 * a provided factory (for in-memory mocks) or spin up an HTTP client to talk to
 * the running demo servers.
 */
export class PaymentRemoteA2aClient {
  constructor(private clientFactory: ClientFactory) {}

  private createClient(): A2aClient {
    if ("create" in this.clientFactory) {
      return this.clientFactory.create();
    }
    return new HttpA2aClient(
      this.clientFactory.baseUrl,
      this.clientFactory.extensionHeader,
    );
  }

  async sendWithBuilder(builder: A2aMessageBuilder): Promise<Task> {
    const client = this.createClient();
    const message = builder.build();
    return client.send(message);
  }

  async send(message: Message): Promise<Task> {
    const client = this.createClient();
    return client.send(message);
  }
}
