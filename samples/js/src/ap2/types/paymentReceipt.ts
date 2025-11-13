import type { PaymentCurrencyAmount } from "./paymentRequest";

export interface SuccessStatus {
  merchant_confirmation_id: string;
  psp_confirmation_id?: string;
}

export interface ErrorStatus {
  error_message: string;
}

export interface FailureStatus {
  failure_message: string;
}

export type PaymentStatus = SuccessStatus | ErrorStatus | FailureStatus;

export interface PaymentReceipt {
  payment_mandate_id: string;
  timestamp: string; // ISO 8601
  payment_id: string;
  amount: PaymentCurrencyAmount;
  payment_status: PaymentStatus;
  payment_method_details?: Record<string, unknown>;
}
