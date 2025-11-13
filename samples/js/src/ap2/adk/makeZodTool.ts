import type { ZodSchema } from "zod";

export type ZodTool<Input, Output> = {
  name: string;
  description: string;
  /**
   * 입력으로 기대하는 JSON 스키마 (Zod)
   */
  schema: ZodSchema<Input>;
  /**
   * 순수 비즈니스 로직
   */
  handler: (input: Input) => Promise<Output> | Output;
};

/**
 * Zod 기반의 툴 헬퍼.
 * - LLM이 생성한 JSON을 schema로 검증하고
 * - 검증된 타입을 handler에 넘긴다.
 */
export function makeZodTool<Input, Output>(config: {
  name: string;
  description: string;
  schema: ZodSchema<Input>;
  handler: (input: Input) => Promise<Output> | Output;
}): ZodTool<Input, Output> {
  return {
    name: config.name,
    description: config.description,
    schema: config.schema,
    handler: config.handler,
  };
}

/**
 * LLM이 만들어 낸 raw JSON (unknown)을 받아서
 * - Zod로 검증하고
 * - 해당 툴의 handler를 호출하는 헬퍼.
 *
 * 이 부분은 네가 짜 둔 orchestrator나 router에서 공통으로 쓸 수 있어.
 */
export async function runZodTool<Input, Output>(
  tool: ZodTool<Input, Output>,
  rawArgs: unknown
): Promise<Output> {
  const parsed = tool.schema.parse(rawArgs);
  return await tool.handler(parsed);
}
