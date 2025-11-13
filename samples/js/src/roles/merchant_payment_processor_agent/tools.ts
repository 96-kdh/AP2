import type { PaymentMandate, PaymentReceipt, PaymentStatus } from "../../ap2/types";

/**
 * A very small, optimistic card payment processor. It does not talk to any real
 * PSP and simply approves most payments for demo purposes.
 */
export function processCardPayment(mandate: PaymentMandate, debugMode = false): PaymentReceipt {
  const contents = mandate.payment_mandate_contents;
  const total = contents.payment_details_total.amount;

  let status: PaymentStatus;
  if (debugMode) {
    status = {
      merchant_confirmation_id: "DEBUG-APPROVED",
      psp_confirmation_id: "DEBUG-PSP-001",
    };
  } else if (total.value <= 0) {
    status = {
      error_message: "Amount must be positive",
    };
  } else {
    status = {
      merchant_confirmation_id: "APPROVED",
      psp_confirmation_id: "PSP-SAMPLE-001",
    };
  }

  const receipt: PaymentReceipt = {
    payment_mandate_id: contents.payment_mandate_id,
    timestamp: new Date().toISOString(),
    payment_id: `pay_${Date.now()}`,
    amount: total,
    payment_status: status,
    payment_method_details: {
      processor: "demo-card-processor",
    },
  };

  return receipt;
}
