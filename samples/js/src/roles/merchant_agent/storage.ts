import type { PaymentReceipt } from "../../ap2/types";

const receipts: PaymentReceipt[] = [];

export function storeReceipt(r: PaymentReceipt): void {
  receipts.push(r);
}

export function getReceipts(): PaymentReceipt[] {
  return receipts.slice();
}
