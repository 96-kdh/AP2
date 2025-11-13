import type { PaymentReceipt } from "../../ap2/types";
import type { PaymentCurrencyAmount } from "../../ap2/types";
import { buildIntentMandate, buildCartMandate, buildPaymentMandate } from "./tools";
import { initiatePaymentFromMandate } from "../merchant_agent/tools";

/**
 * A very small "shopping agent" that runs the happy-path flow:
 *  1. Create IntentMandate
 *  2. Create CartMandate
 *  3. Create PaymentMandate
 *  4. Ask merchant (and underlying payment processor) to process payment
 */
export function runShoppingDemo(): PaymentReceipt {
  const merchantName = "Demo Merchant";
  const description = "Buy one demo item for 19.99 USD";

  const intent = buildIntentMandate(description, merchantName);

  const total: PaymentCurrencyAmount = {
    currency: "USD",
    value: 19.99,
  };

  const cart = buildCartMandate(intent, merchantName, total);
  const mandate = buildPaymentMandate(cart, "CARD");

  const receipt = initiatePaymentFromMandate(mandate, false);
  return receipt;
}
