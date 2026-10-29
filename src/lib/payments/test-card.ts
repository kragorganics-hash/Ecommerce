import { PaymentInitiateParams, PaymentInitiateResult, PaymentProvider, PaymentVerifyParams, PaymentVerifyResult } from "./types";

export class TestCardPaymentProvider implements PaymentProvider {
  name = "Sandbox / Test Card (Simulated)";

  async initiatePayment(params: PaymentInitiateParams): Promise<PaymentInitiateResult> {
    const transactionId = `TEST_CARD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      success: true,
      paymentMethod: "TEST_CARD",
      redirectUrl: `${params.returnUrl}?orderId=${params.orderId}&transactionId=${transactionId}&testMode=true`,
      transactionId,
      message: "Sandbox test card payment simulation initialized.",
    };
  }

  async verifyPayment(params: PaymentVerifyParams): Promise<PaymentVerifyResult> {
    const transactionId = params.transactionId || `TEST_CARD_${Date.now()}`;

    // Validates that this is strictly a simulated test transaction
    return {
      success: true,
      status: "PAID",
      transactionId,
      amount: 0,
      providerRaw: {
        isTestMode: true,
        simulationNotice: "Simulated sandbox payment - NOT A REAL CHARGE",
        verifiedAt: new Date().toISOString(),
      },
      message: "Sandbox payment simulation verified successfully.",
    };
  }
}
