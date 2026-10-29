import { CodPaymentProvider } from "./cod";
import { EsewaPaymentProvider } from "./esewa";
import { KhaltiPaymentProvider } from "./khalti";
import { TestCardPaymentProvider } from "./test-card";
import { PaymentProvider } from "./types";

export * from "./types";
export * from "./esewa";
export * from "./khalti";
export * from "./cod";
export * from "./test-card";

export function getPaymentProvider(method: string): PaymentProvider {
  switch (method.toUpperCase()) {
    case "ESEWA":
      return new EsewaPaymentProvider();
    case "KHALTI":
      return new KhaltiPaymentProvider();
    case "COD":
      return new CodPaymentProvider();
    case "TEST_CARD":
      return new TestCardPaymentProvider();
    default:
      throw new Error(`Unsupported payment method: ${method}`);
  }
}
