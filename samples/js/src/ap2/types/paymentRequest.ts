import type { ContactAddress } from "./contactPicker";

export interface PaymentCurrencyAmount {
  /** ISO 4217 currency code, e.g. "USD" */
  currency: string;
  /** Numeric amount value */
  value: number;
}

export interface PaymentItem {
  label: string;
  amount: PaymentCurrencyAmount;
}

export interface PaymentShippingOption {
  id: string;
  label: string;
  amount: PaymentCurrencyAmount;
  selected?: boolean;
}

export interface PaymentOptions {
  request_payer_name?: boolean;
  request_payer_email?: boolean;
  request_payer_phone?: boolean;
  request_shipping?: boolean;
  shipping_type?: "shipping" | "delivery" | "pickup";
}

export interface PaymentMethodData {
  supported_methods: string;
  data?: Record<string, unknown>;
}

export interface PaymentDetailsInit {
  total: PaymentItem;
  display_items?: PaymentItem[];
  shipping_options?: PaymentShippingOption[];
}

export interface PaymentRequest {
  method_data: PaymentMethodData[];
  details: PaymentDetailsInit;
  options?: PaymentOptions;

  shipping_address?: ContactAddress;
  shipping_option?: string;
  payer_name?: string;
  payer_email?: string;
  payer_phone?: string;
}

export interface PaymentResponse {
  request_id: string;
  method_name: string;
  details?: Record<string, unknown>;
  shipping_address?: ContactAddress;
  shipping_option?: PaymentShippingOption;
  payer_name?: string;
  payer_email?: string;
  payer_phone?: string;
}
