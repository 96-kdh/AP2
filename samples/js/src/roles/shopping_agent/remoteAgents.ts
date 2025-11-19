import { A2aMessageBuilder } from "../../common/a2aMessageBuilder";
import { extractDataParts, findDataPart } from "../../common/messageUtils";
import { PaymentRemoteA2aClient, HttpA2aClient } from "../../common/paymentRemoteA2aClient";
import { PAYMENT_MANDATE_DATA_KEY, PAYMENT_RECEIPT_DATA_KEY } from "../../ap2/types/constants";
import type { PaymentMandate, PaymentReceipt } from "../../ap2/types";
import { initiatePaymentFromMandate } from "../merchant_agent/tools";

const MERCHANT_AGENT_URL =
  process.env.MERCHANT_AGENT_URL ?? "http://localhost:8001/a2a/merchant_agent";

function buildMerchantClient(): PaymentRemoteA2aClient {
  return new PaymentRemoteA2aClient({
    create: () => new HttpA2aClient(MERCHANT_AGENT_URL),
  });
}

async function sendMandateToMerchant(
  mandate: PaymentMandate,
  debugMode: boolean,
): Promise<PaymentReceipt> {
  const client = buildMerchantClient();
  const builder = new A2aMessageBuilder("user")
    .addData(PAYMENT_MANDATE_DATA_KEY, mandate)
    .addData("debug_mode", debugMode);

  const task = await client.sendWithBuilder(builder);
  if (task.status !== "SUCCEEDED" || !task.resultMessage) {
    throw new Error("Merchant agent did not return a successful task");
  }
  const dataParts = extractDataParts(task.resultMessage.parts);
  const receipt = findDataPart<PaymentReceipt>(PAYMENT_RECEIPT_DATA_KEY, dataParts);
  if (!receipt) {
    throw new Error("Merchant agent response missing payment_receipt data part");
  }
  return receipt;
}

export async function dispatchPaymentMandate(
  mandate: PaymentMandate,
  debugMode: boolean,
): Promise<PaymentReceipt> {
  try {
    return await sendMandateToMerchant(mandate, debugMode);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Falling back to local processing after remote error", err);
    return initiatePaymentFromMandate(mandate, debugMode);
  }
}
