import api from './api';
import { Booking } from '../types';

export const bookingService = {
  getAll: async (params?: { startDate?: string; endDate?: string; status?: string }) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  create: async (booking: Partial<Booking>): Promise<Booking> => {
    const response = await api.post('/bookings', booking);
    return response.data;
  },

  update: async (id: string, updates: Partial<Booking>): Promise<Booking> => {
    const response = await api.put(`/bookings/${id}`, updates);
    return response.data;
  },

  cancel: async (id: string, reason?: string): Promise<Booking> => {
    const response = await api.delete(`/bookings/${id}`, { data: { reason } });
    return response.data;
  },

  getAvailability: async (date: string, serviceId?: string) => {
    const response = await api.get(`/bookings/availability/${date}`, {
      params: { serviceId },
    });
    return response.data;
  },
};

export default bookingService;
