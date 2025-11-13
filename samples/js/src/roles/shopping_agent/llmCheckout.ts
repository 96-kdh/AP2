// src/roles/shopping_agent/llmCheckout.ts
import type { PaymentReceipt, PaymentCurrencyAmount } from "../../ap2/types";
import {
  buildIntentMandate,
  buildCartMandate,
  buildPaymentMandate,
} from "./tools";
import { initiatePaymentFromMandate } from "../merchant_agent/tools";

export interface CheckoutInput {
  description: string;
  total_amount: number;
  currency: string;
  debug_mode?: boolean;
}

/**
 * LLM이 사용할 카드 결제 플로우:
 * 1) IntentMandate 생성
 * 2) CartMandate 생성
 * 3) PaymentMandate 생성
 * 4) Merchant + Payment Processor 로 결제 실행
 */
export function runCardCheckoutFromLLM(input: CheckoutInput): PaymentReceipt {
  const merchantName = "Demo Merchant";

  const intent = buildIntentMandate(input.description, merchantName);

  const total: PaymentCurrencyAmount = {
    currency: input.currency,
    value: input.total_amount,
  };

  const cart = buildCartMandate(intent, merchantName, total);
  const paymentMandate = buildPaymentMandate(cart, "CARD");

  const receipt = initiatePaymentFromMandate(
    paymentMandate,
    !!input.debug_mode,
  );

  return receipt;
}
