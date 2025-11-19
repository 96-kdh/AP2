declare module "@google/adk" {
  import type { ZodTypeAny } from "zod";

  export interface ToolOptions<TInput = any, TResult = any> {
    name: string;
    description?: string;
    inputSchema?: ZodTypeAny;
    outputSchema?: ZodTypeAny;
    execute: (input: TInput, context?: unknown) => Promise<TResult> | TResult;
  }

  export class Tool<TInput = any, TResult = any> {
    constructor(options: ToolOptions<TInput, TResult>);
    name: string;
    description?: string;
    inputSchema?: ZodTypeAny;
    outputSchema?: ZodTypeAny;
    execute: (input: TInput, context?: unknown) => Promise<TResult>;
  }

  export interface LlmAgentOptions {
    name: string;
    description?: string;
    model?: string;
    instruction?: string;
    tools?: Array<Tool<any, any>>;
  }

  export class LlmAgent {
    constructor(options: LlmAgentOptions);
  }

  export const GOOGLE_SEARCH: Tool<any, any>;
}
