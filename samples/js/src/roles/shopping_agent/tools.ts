import type {
  IntentMandate,
  CartMandate,
  CartContents,
  PaymentMandate,
  PaymentMandateContents,
} from "../../ap2/types";
import type {
  PaymentCurrencyAmount,
  PaymentItem,
  PaymentRequest,
  PaymentResponse,
  PaymentMethodData,
  PaymentDetailsInit,
} from "../../ap2/types";

/**
 * Build a simple IntentMandate from natural language description.
 */
export function buildIntentMandate(description: string, merchantName: string): IntentMandate {
  const now = new Date();
  const expiry = new Date(now.getTime() + 15 * 60 * 1000); // +15 minutes

  return {
    user_cart_confirmation_required: true,
    natural_language_description: description,
    merchants: [merchantName],
    skus: [],
    requires_refundability: true,
    intent_expiry: expiry.toISOString(),
  };
}

export function buildPaymentRequest(total: PaymentCurrencyAmount): PaymentRequest {
  const totalItem: PaymentItem = {
    label: "Total",
    amount: total,
  };

  const method: PaymentMethodData = {
    supported_methods: "CARD",
    data: {
      card_networks: ["VISA", "MASTERCARD"],
    },
  };

  const details: PaymentDetailsInit = {
    total: totalItem,
    display_items: [
      {
        label: "Demo item",
        amount: total,
      },
    ],
  };

  return {
    method_data: [method],
    details,
  };
}

export function buildCartMandate(
  intent: IntentMandate,
  merchantName: string,
  total: PaymentCurrencyAmount,
): CartMandate {
  const contents: CartContents = {
    intent_mandate_id: intent.intent_expiry,
    payment_request: buildPaymentRequest(total),
    cart_expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    merchant_name: merchantName,
  };

  return {
    contents,
    merchant_authorization: "demo-merchant-signature",
  };
}

export function buildPaymentResponse(methodName: string): PaymentResponse {
  return {
    request_id: `req_${Date.now()}`,
    method_name: methodName,
    details: {
      description: "Demo payment response from shopper device",
    },
  };
}

export function buildPaymentMandate(
  cart: CartMandate,
  methodName: string,
): PaymentMandate {
  const totalItem = cart.contents.payment_request.details.total;

  const contents: PaymentMandateContents = {
    payment_mandate_id: `mandate_${Date.now()}`,
    payment_details_id: `details_${Date.now()}`,
    payment_details_total: totalItem,
    payment_response: buildPaymentResponse(methodName),
    cart_mandate: cart,
  };

  return {
    payment_mandate_contents: contents,
    user_authorization: "demo-user-signature",
  };
}
