/**
 * Payment Data Source - API methods for payment processing
 */

import { ApiClient } from '../client';
import { ApiResponse, ListResponse } from '../types';

export interface Payment {
  id: string;
  bookingId: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  paymentMethod: string;
  processor: string;
  processorPaymentId?: string;
  processorCustomerId?: string;
  metadata?: Record<string, unknown>;
  refundedAmount?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface CreatePaymentRequest {
  bookingId: string | number;
  amount: number;
  currency?: string;
  paymentMethod: string;
  processor?: string;
  processorPaymentId?: string;
  processorCustomerId?: string;
  metadata?: Record<string, unknown>;
}

interface RefundRequest {
  amount?: number; // If not specified, full refund
  reason?: string;
}

interface RefundResponse {
  payment: Payment;
  refundAmount: number;
  refundId: string;
  status: string;
}

export class PaymentDataSource {
  private static client = new ApiClient();

  /**
   * Create a new payment
   */
  static async create(payment: CreatePaymentRequest): Promise<Payment> {
    const response = await this.client.post<ApiResponse<Payment>>('/payments', {
      ...payment,
      currency: payment.currency || 'AUD',
      processor: payment.processor || 'stripe',
    });
    return response.data;
  }

  /**
   * Get a payment by ID
   */
  static async getById(paymentId: string | number): Promise<Payment> {
    const response = await this.client.get<ApiResponse<Payment>>(`/payments/${paymentId}`);
    return response.data;
  }

  /**
   * Get all payments for a booking
   */
  static async getByBooking(bookingId: string | number): Promise<Payment[]> {
    const response = await this.client.get<ApiResponse<Payment[]>>(
      `/payments/booking/${bookingId}`
    );
    return response.data;
  }

  /**
   * Get all payments for a tenant
   */
  static async getByTenant(
    tenantId: string | number,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ListResponse<Payment>> {
    const params: Record<string, string | number> = { page, limit };
    if (status) params.status = status;

    return this.client.get<ListResponse<Payment>>(`/payments/tenant/${tenantId}`, params);
  }

  /**
   * Refund a payment (full or partial)
   */
  static async refund(
    paymentId: string | number,
    refundData?: RefundRequest
  ): Promise<RefundResponse> {
    const response = await this.client.post<ApiResponse<RefundResponse>>(
      `/payments/${paymentId}/refund`,
      refundData || {}
    );
    return response.data;
  }

  /**
   * Get payment status
   */
  static async getStatus(paymentId: string | number): Promise<string> {
    const payment = await this.getById(paymentId);
    return payment.status;
  }

  /**
   * Check if payment is completed
   */
  static async isCompleted(paymentId: string | number): Promise<boolean> {
    const payment = await this.getById(paymentId);
    return payment.status === 'completed';
  }

  /**
   * Get total payments for a tenant (within date range)
   */
  static async getTotalRevenue(
    tenantId: string | number,
    startDate?: string,
    endDate?: string
  ): Promise<number> {
    const params: Record<string, string | number> = { limit: 1000 };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await this.getByTenant(tenantId, 'completed', 1, 1000);
    return response.data.reduce((sum, payment) => sum + payment.amount, 0);
  }
}
