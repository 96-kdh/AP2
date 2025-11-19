// 순수 로직: ADK에 종속되지 않는 함수
import { runCardCheckoutFromLLM } from "./llmCheckout";

export async function runCardCheckoutLogic(
  args: any,
  toolContext: any,
): Promise<any> {
  const debug_mode =
    typeof (args as any).debug_mode === "boolean"
      ? (args as any).debug_mode
      : !toolContext.state["debug_mode"];

  const input: any = {
    description: args.description,
    total_amount: args.total_amount,
    currency: args.currency,
    debug_mode,
  };

  const receipt = await runCardCheckoutFromLLM(input);

  // 이후 단계에서 다시 꺼내 쓰고 싶으면 state에 저장
  toolContext.state["payment_receipt"] = receipt;

  return receipt;
}
