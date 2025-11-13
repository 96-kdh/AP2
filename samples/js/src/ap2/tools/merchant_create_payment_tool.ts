// src/ap2/tools/merchant_create_payment_tool.ts
import { makeZodTool } from "../adk/makeZodTool";
import {
  CreatePaymentInputSchema,
  type CreatePaymentInput,
  type CreatePaymentOutput,
} from "../types/payment";

export const merchantCreatePaymentTool = makeZodTool<
  CreatePaymentInput,
  CreatePaymentOutput
>({
  name: "merchant_create_payment",
  description: "머천트가 고객 결제를 초기화하는 AP2 데모용 툴",
  schema: CreatePaymentInputSchema,
  async handler(input) {
    // 여기서는 데모용이라 낙관적인 mock 로직만 넣어도 된다고 했으니까,
    // 실제 결제 대신 가짜 paymentId를 만들어주자.
    const paymentId = `pay_${Math.random().toString(36).slice(2, 10)}`;

    return {
      paymentId,
      status: "PENDING",
    };
  },
});
