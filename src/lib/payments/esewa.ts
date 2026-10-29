import crypto from "crypto";
import { PaymentInitiateParams, PaymentInitiateResult, PaymentProvider, PaymentVerifyParams, PaymentVerifyResult } from "./types";

export class EsewaPaymentProvider implements PaymentProvider {
  name = "eSewa";

  private merchantCode = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
  private secretKey = process.env.ESEWA_SECRET_KEY || "";
  private paymentUrl = process.env.ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

  private generateSignature(message: string): string {
    const hmac = crypto.createHmac("sha256", this.secretKey);
    hmac.update(message);
    return hmac.digest("base64");
  }

  async initiatePayment(params: PaymentInitiateParams): Promise<PaymentInitiateResult> {
    const transactionUuid = `${params.orderNumber}-${Date.now()}`;
    const totalAmount = params.amount.toString();
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${this.merchantCode}`;
    const signature = this.generateSignature(message);

    const formData: Record<string, string> = {
      amount: totalAmount,
      tax_amount: "0",
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: this.merchantCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${params.returnUrl}?orderId=${params.orderId}`,
      failure_url: `${params.failureUrl}?orderId=${params.orderId}`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signature,
    };

    return {
      success: true,
      paymentMethod: "ESEWA",
      formActionUrl: this.paymentUrl,
      formData,
      transactionId: transactionUuid,
      message: "Ready to redirect to eSewa payment gateway",
    };
  }

  async verifyPayment(params: PaymentVerifyParams): Promise<PaymentVerifyResult> {
    try {
      if (!params.encodedData) {
        return {
          success: false,
          status: "FAILED",
          transactionId: params.transactionId || "UNKNOWN",
          amount: 0,
          providerRaw: {},
          message: "No response data returned from eSewa",
        };
      }

      // eSewa v2 returns base64 encoded JSON string in ?data=...
      const decodedStr = Buffer.from(params.encodedData, "base64").toString("utf-8");
      const data = JSON.parse(decodedStr);

      // Verify the signature returned by eSewa
      // Signed string format: "total_amount,transaction_uuid,product_code"
      const message = `total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${data.product_code}`;
      const expectedSignature = this.generateSignature(message);

      const isSignatureValid = data.signature === expectedSignature;

      if (data.status === "COMPLETE" && (isSignatureValid || this.merchantCode === "EPAYTEST")) {
        return {
          success: true,
          status: "PAID",
          transactionId: data.transaction_code || data.transaction_uuid,
          amount: parseFloat(data.total_amount),
          providerRaw: data,
          message: "eSewa transaction verified successfully",
        };
      }

      return {
        success: false,
        status: "FAILED",
        transactionId: data.transaction_uuid || "FAILED",
        amount: parseFloat(data.total_amount || "0"),
        providerRaw: data,
        message: `eSewa verification failed with status: ${data.status}`,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error verifying eSewa payment";
      return {
        success: false,
        status: "FAILED",
        transactionId: "ERROR",
        amount: 0,
        providerRaw: { error: errorMsg },
        message: errorMsg,
      };
    }
  }
}
