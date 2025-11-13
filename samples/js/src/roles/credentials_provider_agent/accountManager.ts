export interface PaymentMethod {
  alias: string;
  card_last4: string;
  card_brand: string;
}

export interface Account {
  email: string;
  payment_methods: PaymentMethod[];
}

const accounts: Account[] = [
  {
    email: "alice@example.com",
    payment_methods: [
      { alias: "alice-main-card", card_last4: "4242", card_brand: "VISA" },
    ],
  },
];

export function getAccountByAlias(email: string, alias: string): PaymentMethod | undefined {
  const acc = accounts.find((a) => a.email === email);
  if (!acc) return undefined;
  return acc.payment_methods.find((m) => m.alias === alias);
}
