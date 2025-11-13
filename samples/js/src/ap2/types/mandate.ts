import type {
  PaymentItem,
  PaymentRequest,
  PaymentResponse,
} from "./paymentRequest";

export interface IntentMandate {
  user_cart_confirmation_required: boolean;
  natural_language_description: string;
  merchants?: string[];
  skus?: string[];
  requires_refundability?: boolean;
  intent_expiry: string; // ISO 8601
}

export interface CartContents {
  intent_mandate_id: string;
  payment_request: PaymentRequest;
  cart_expiry: string; // ISO 8601
  merchant_name: string;
}

export interface CartMandate {
  contents: CartContents;
  merchant_authorization?: string;
}

export interface PaymentMandateContents {
  payment_mandate_id: string;
  payment_details_id: string;
  payment_details_total: PaymentItem;
  payment_response: PaymentResponse;
  cart_mandate: CartMandate;
}

export interface PaymentMandate {
  payment_mandate_contents: PaymentMandateContents;
  user_authorization?: string;
}
