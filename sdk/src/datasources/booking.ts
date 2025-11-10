/**
 * Booking Data Source - API methods for booking management
 *
 * Refactored to extend BaseDataSource for standard CRUD operations
 * with booking-specific methods added.
 */

import { BaseDataSource } from '../core/BaseDataSource';
import { Booking, ApiResponse } from '../types';

interface CreateBookingRequest {
  tenantId: string | number;
  locationId: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  specialRequests?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

interface UpdateStatusRequest {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

/**
 * Booking Data Source
 *
 * Provides standard CRUD operations plus booking-specific methods
 */
export class BookingDataSource extends BaseDataSource<Booking> {
  protected endpoint = '/bookings';

  // Inherits from BaseDataSource:
  // - getAll(params?)
  // - getById(id)
  // - create(data)
  // - update(id, data)
  // - patch(id, data)
  // - delete(id)

  /**
   * Create a new booking (domain-specific method)
   */
  async createBooking(booking: CreateBookingRequest): Promise<Booking> {
    return this.create(booking as Partial<Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>>);
  }

  /**
   * Update booking status
   */
  async updateStatus(bookingId: string | number, update: UpdateStatusRequest): Promise<Booking> {
    const response = await this.client.patch<ApiResponse<Booking>>(
      `${this.endpoint}/${bookingId}/status`,
      update
    );

    if ('data' in response) {
      return response.data;
    }
    return response as Booking;
  }

  /**
   * Get all bookings for a tenant
   */
  async getByTenant(
    tenantId: string | number,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<Booking[]> {
    return this.getAll({
      page,
      limit,
      filter: { tenantId, ...(status && { status }) },
    });
  }

  /**
   * Cancel a booking
   */
  async cancel(bookingId: string | number, reason?: string): Promise<Booking> {
    return this.updateStatus(bookingId, {
      status: 'cancelled',
      notes: reason,
    });
  }

  /**
   * Confirm a booking
   */
  async confirm(bookingId: string | number): Promise<Booking> {
    return this.updateStatus(bookingId, { status: 'confirmed' });
  }

  /**
   * Complete a booking
   */
  async complete(bookingId: string | number): Promise<Booking> {
    return this.updateStatus(bookingId, { status: 'completed' });
  }
}
