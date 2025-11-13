import { merchantCreatePaymentTool } from "../tools/merchant_create_payment_tool";
import { runZodTool } from "../adk/makeZodTool";
import type { CreatePaymentInput, CreatePaymentOutput } from "../types/payment";

export async function runMerchantPaymentFlow(
  input: CreatePaymentInput,
): Promise<CreatePaymentOutput> {
  // 나중에 LLM이 만든 raw JSON을 넘길 수도 있고,
  // 지금처럼 TS 코드에서 바로 넘길 수도 있음.
  return runZodTool<CreatePaymentInput, CreatePaymentOutput>(
    merchantCreatePaymentTool,
    input,
  );
}
