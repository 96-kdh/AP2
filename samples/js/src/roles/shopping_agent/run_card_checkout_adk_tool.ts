// @ts-nocheck
import { BaseTool, RunAsyncToolRequest } from "@google/adk";
import type { FunctionDeclaration } from "@google/genai";

import type { PaymentReceipt } from "../../ap2/types";
import { runCardCheckoutLogic } from "./run_card_checkout_logic";
import { CheckoutInput } from "./llmCheckout";

// ADK용 Tool 클래스
export class RunCardCheckoutTool extends BaseTool {
  constructor() {
    super({
      name: "run_card_checkout",
      description:
        "Runs the AP2 card checkout flow using merchant, credential provider, and payment processor agents.",
    });
  }

  // LLM에 노출될 function-call schema
  _getDeclaration(): FunctionDeclaration {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: "object",
        properties: {
          description: {
            type: "string",
            description:
              "A concise summary of the item being purchased (brand, model, key specs, quantity).",
          },
          total_amount: {
            type: "number",
            description:
              "Total amount the user expects to pay, as a numeric value (e.g. 95000 for 95,000 KRW).",
          },
          currency: {
            type: "string",
            description:
              "Three-letter currency code (e.g. KRW, USD, JPY).",
          },
          debug_mode: {
            type: "boolean",
            description:
              "Set to true ONLY for test / debug payments. Usually omitted.",
          },
        },
        required: ["description", "total_amount", "currency"],
      },
    };
  }

  // 실제 Tool 실행 로직
  async runAsync(request: RunAsyncToolRequest): Promise<PaymentReceipt> {
    const { args, toolContext } = request;

    // LLM에서 들어온 args 를 우리가 정의한 타입으로 캐스팅
    const input = args as unknown as CheckoutInput;

    return runCardCheckoutLogic(input, toolContext);
  }
}
