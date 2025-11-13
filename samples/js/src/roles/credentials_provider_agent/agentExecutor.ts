import { BaseServerExecutor } from "../../common/baseServerExecutor";
import type { Task, TaskUpdater } from "../../common/a2aTypes";
import type { RequestContext } from "../../common/baseServerExecutor";
import { extractDataParts } from "../../common/messageUtils";
import { getPaymentCredentialToken } from "./tools";

export class CredentialsProviderExecutor extends BaseServerExecutor {
  constructor() {
    super("You are a credentials provider agent.");
  }

  protected async handleRequest(
    textParts: string[],
    dataParts: Array<Record<string, unknown>>,
    updater: TaskUpdater,
    currentTask?: Task,
  ): Promise<void> {
    const flat = Object.assign({}, ...dataParts);
    const email = flat["user_email"] as string | undefined;
    const alias = flat["payment_method_alias"] as string | undefined;

    if (!email || !alias) {
      const msg = updater.newAgentMessage([
        { text_part: { text: "Missing user_email or payment_method_alias" } },
      ]);
      await updater.failed(msg);
      return;
    }

    await getPaymentCredentialToken(
      { user_email: email, payment_method_alias: alias },
      updater,
    );
  }

  async executeRequest(context: RequestContext, updater: TaskUpdater, currentTask?: Task): Promise<void> {
    const parts = context.message.parts;
    const dataParts = extractDataParts(parts);
    const textParts = parts.filter((p) => p.text_part).map((p) => p.text_part!.text);
    await this.handleRequest(textParts, dataParts, updater, currentTask);
  }
}
