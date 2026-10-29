import { PaymentInitiateParams, PaymentInitiateResult, PaymentProvider, PaymentVerifyParams, PaymentVerifyResult } from "./types";

export class CodPaymentProvider implements PaymentProvider {
  name = "Cash on Delivery";

  async initiatePayment(params: PaymentInitiateParams): Promise<PaymentInitiateResult> {
    const transactionId = `COD-${params.orderNumber}-${Date.now().toString().slice(-4)}`;

    return {
      success: true,
      paymentMethod: "COD",
      redirectUrl: `${params.returnUrl}?orderId=${params.orderId}&payment=cod`,
      transactionId,
      message: "Order placed successfully. Payment will be collected in cash upon physical delivery.",
    };
  }

  async verifyPayment(params: PaymentVerifyParams): Promise<PaymentVerifyResult> {
    // For COD, the payment status remains PENDING until the order is delivered in person by courier
    return {
      success: true,
      status: "PENDING",
      transactionId: params.transactionId || `COD-${params.orderId}`,
      amount: 0,
      providerRaw: { method: "COD", notice: "Cash collected on doorstep delivery" },
      message: "Cash on delivery registered. Balance payable on package handover.",
    };
  }
}
