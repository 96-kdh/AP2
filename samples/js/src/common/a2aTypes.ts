export interface TextPart {
  text: string;
}

export interface DataPart {
  key: string;
  data: unknown;
}

export interface Part {
  text_part?: TextPart;
  data_part?: DataPart;
}

export type Role = "agent" | "user" | "tool";

export interface Message {
  id: string;
  parts: Part[];
  role: Role;
  context_id?: string;
}

export type TaskStatus = "PENDING" | "SUCCEEDED" | "FAILED";

export interface Task {
  id: string;
  status: TaskStatus;
  resultMessage?: Message;
}

export interface TaskUpdater {
  context_id?: string;
  newAgentMessage(parts: Part[]): Message;
  complete(message: Message): Promise<void>;
  failed(message: Message): Promise<void>;
}
