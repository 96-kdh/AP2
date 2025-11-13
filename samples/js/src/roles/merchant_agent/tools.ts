import type { PaymentMandate, PaymentReceipt } from "../../ap2/types";
import { PAYMENT_MANDATE_DATA_KEY, PAYMENT_RECEIPT_DATA_KEY } from "../../ap2/types/constants";
import { processCardPayment } from "../merchant_payment_processor_agent/tools";

/**
 * In the Python sample the merchant agent forwards the mandate to a payment
 * processor agent. For this TS demo we call the processor directly to keep the
 * wiring simple.
 */
export function initiatePaymentFromMandate(
  mandate: PaymentMandate,
  debugMode = false,
): PaymentReceipt {
  return processCardPayment(mandate, debugMode);
}

/**
 * Utility used by the A2A-style executor: extract mandate from data parts.
 */
export function initiatePaymentFromDataParts(
  dataParts: Array<Record<string, unknown>>,
  debugMode = false,
): PaymentReceipt {
  const merged = Object.assign({}, ...dataParts);
  const mandate = merged[PAYMENT_MANDATE_DATA_KEY] as PaymentMandate | undefined;
  if (!mandate) {
    throw new Error("Missing payment_mandate");
  }
  return initiatePaymentFromMandate(mandate, debugMode);
}
