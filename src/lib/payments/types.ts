export interface PaymentInitiateParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  returnUrl: string;
  failureUrl: string;
}

export interface PaymentInitiateResult {
  success: boolean;
  paymentMethod: "ESEWA" | "KHALTI" | "COD" | "TEST_CARD";
  redirectUrl?: string;
  formData?: Record<string, string>;
  formActionUrl?: string;
  transactionId?: string;
  message?: string;
}

export interface PaymentVerifyParams {
  orderId: string;
  transactionId?: string;
  encodedData?: string; // eSewa v2 response data
  pidx?: string; // Khalti pidx
  rawParams?: Record<string, string | null>;
}

export interface PaymentVerifyResult {
  success: boolean;
  status: "PAID" | "PENDING" | "FAILED";
  transactionId: string;
  amount: number;
  providerRaw: Record<string, unknown>;
  message?: string;
}

export interface PaymentProvider {
  name: string;
  initiatePayment(params: PaymentInitiateParams): Promise<PaymentInitiateResult>;
  verifyPayment(params: PaymentVerifyParams): Promise<PaymentVerifyResult>;
}
