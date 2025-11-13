import type { TaskUpdater } from "../../common/a2aTypes";
import { getAccountByAlias } from "./accountManager";

export interface GetPaymentCredentialTokenInput {
  user_email: string;
  payment_method_alias: string;
}

/**
 * Demo-style function that returns a mock payment credential token for a user.
 */
export async function getPaymentCredentialToken(
  input: GetPaymentCredentialTokenInput,
  updater?: TaskUpdater,
): Promise<string> {
  const method = getAccountByAlias(input.user_email, input.payment_method_alias);
  if (!method) {
    const msg = updater?.newAgentMessage?.([
      { text_part: { text: "Account or payment method not found" } },
    ]);
    if (msg && updater) {
      await updater.failed(msg);
    }
    throw new Error("Account or payment method not found");
  }

  const token = `tok_${input.user_email}_${input.payment_method_alias}`;
  const msg = updater?.newAgentMessage?.([
    {
      text_part: {
        text: `Issued mock credential token for ${input.user_email} (${method.card_brand} **** ${method.card_last4})`,
      },
    },
  ]);
  if (msg && updater) {
    await updater.complete(msg);
  }
  return token;
}
