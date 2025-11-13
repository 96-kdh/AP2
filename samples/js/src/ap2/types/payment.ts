// src/ap2/types/payment.ts
import { z } from "zod";

export const CreatePaymentInputSchema = z.object({
  amount: z.number().positive(),
  currency: z.string(),
  customerId: z.string(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentInputSchema>;

export const CreatePaymentOutputSchema = z.object({
  paymentId: z.string(),
  status: z.enum(["PENDING", "SUCCEEDED", "FAILED"]),
});

export type CreatePaymentOutput = z.infer<typeof CreatePaymentOutputSchema>;
