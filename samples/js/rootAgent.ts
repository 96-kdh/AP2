import { LlmAgent, GOOGLE_SEARCH, Tool } from "@google/adk";
import { z } from "zod";
import { runCardCheckoutFromLLM } from "./src/roles/shopping_agent/llmCheckout";

const runCardCheckoutTool = new Tool({
  name: "run_card_checkout",
  description:
    "Builds AP2 mandates from the shopper request and runs the card checkout flow via the demo merchant & processor agents.",
  inputSchema: z.object({
    description: z.string().describe("Description of the item(s) to purchase."),
    total_amount: z.number().positive().describe("Total amount to charge."),
    currency: z.string().default("USD").describe("Three-letter currency code, e.g. USD or KRW."),
    debug_mode: z.boolean().optional().describe("If true, force the mock processor into debug/approved mode."),
  }),
  outputSchema: z.object({
    payment_receipt: z.unknown(),
  }),
  async execute({ description, total_amount, currency = "USD", debug_mode = false }) {
    const payment_receipt = await runCardCheckoutFromLLM({
      description,
      total_amount,
      currency,
      debug_mode,
    });
    return { payment_receipt };
  },
});

export const rootAgent = new LlmAgent({
  name: "ts_ap2_shopping_agent",
  description: "AP2 card checkout demo agent (TypeScript)",
  model: "gemini-2.5-flash",
  instruction: `
You are a shopping assistant that uses the AP2 card checkout flow.

1. Talk with the user to understand what they want to buy (item, quantity, approximate price).
2. Once they confirm they want to pay, call the tool "run_card_checkout".
3. Use a reasonable total_amount and proper currency code (e.g., "USD" or "KRW").
4. After the tool returns, summarize the payment receipt in natural language and also show the JSON result.
`,

  tools: [
    runCardCheckoutTool,
    GOOGLE_SEARCH
  ],
});
