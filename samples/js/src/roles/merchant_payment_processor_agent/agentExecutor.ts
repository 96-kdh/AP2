import { BaseServerExecutor } from "../../common/baseServerExecutor";
import type { Task, TaskUpdater } from "../../common/a2aTypes";
import { findDataPart } from "../../common/messageUtils";
import type { PaymentMandate } from "../../ap2/types";
import { PAYMENT_MANDATE_DATA_KEY, PAYMENT_RECEIPT_DATA_KEY } from "../../ap2/types/constants";
import { processCardPayment } from "./tools";

export class MerchantPaymentProcessorExecutor extends BaseServerExecutor {
  constructor() {
    super("You are a merchant payment processor agent.");
  }

  protected async handleRequest(
    textParts: string[],
    dataParts: Array<Record<string, unknown>>,
    updater: TaskUpdater,
    currentTask?: Task,
  ): Promise<void> {
    const mandate = findDataPart<PaymentMandate>(PAYMENT_MANDATE_DATA_KEY, dataParts);
    if (!mandate) {
      const msg = updater.newAgentMessage([
        { text_part: { text: "Missing payment_mandate" } },
      ]);
      await updater.failed(msg);
      return;
    }

    const debugMode = !!findDataPart<boolean>("debug_mode", dataParts);
    const receipt = processCardPayment(mandate, debugMode);

    const msg = updater.newAgentMessage([
      {
        data_part: {
          key: PAYMENT_RECEIPT_DATA_KEY,
          data: receipt,
        },
      },
    ]);
    await updater.complete(msg);
  }
}
