import type { PaymentMandate } from "../ap2/types";

/**
 * In a real AP2 implementation this would verify cryptographic signatures on
 * the mandate. For this demo we just log what would be verified.
 */
export function validatePaymentMandateSignature(mandate: PaymentMandate): void {
  const id = mandate.payment_mandate_contents.payment_mandate_id;
  // eslint-disable-next-line no-console
  console.log(`[validation] Pretending to validate signature on mandate ${id}`);
}
