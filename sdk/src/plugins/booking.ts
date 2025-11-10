/**
 * Booking Plugin
 *
 * Adds booking-related functionality to SDK
 */

import { Plugin } from '../core/interfaces';
import { ApiClient } from '../client';
import { BookingDataSource } from '../datasources/booking';

/**
 * Booking plugin for SDK
 */
export const BookingPlugin: Plugin = {
  name: 'booking',
  version: '1.0.0',

  initialize(client: unknown): Record<string, unknown> {
    const apiClient = client as ApiClient;

    return {
      bookings: new BookingDataSource(apiClient),
    };
  },
};
