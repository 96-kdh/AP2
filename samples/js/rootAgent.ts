import { LlmAgent, GOOGLE_SEARCH } from "@google/adk";

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
    GOOGLE_SEARCH
  ],
});
