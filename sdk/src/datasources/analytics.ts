/**
 * Analytics Data Source - API methods for analytics tracking
 */

import { ApiClient } from '../client';
import { AnalyticsSummary, ApiResponse } from '../types';

interface CreateSessionRequest {
  tenantId: string | number;
  sessionToken?: string;
  fingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingPage?: string;
  deviceType?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
}

interface SessionResponse {
  id: string;
  sessionToken: string;
  pageViews: number;
  createdAt: string;
  isNew: boolean;
}

interface CreateEventRequest {
  sessionId?: string;
  tenantId: string | number;
  eventType: string;
  eventData?: Record<string, unknown>;
  pageUrl?: string;
  pageTitle?: string;
}

export class AnalyticsDataSource {
  private static client = new ApiClient();
  private static currentSessionId: string | null = null;
  private static currentSessionToken: string | null = null;

  /**
   * Generate a unique session token
   */
  private static generateSessionToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Create a new analytics session
   */
  static async createSession(data: CreateSessionRequest): Promise<SessionResponse> {
    // Generate session token if not provided
    const sessionToken = data.sessionToken || this.generateSessionToken();

    const response = await this.client.post<ApiResponse<SessionResponse>>('/analytics/sessions', {
      ...data,
      sessionToken,
    });

    this.currentSessionId = response.data.id;
    this.currentSessionToken = response.data.sessionToken;
    return response.data;
  }

  /**
   * Track an event
   */
  static async trackEvent(event: CreateEventRequest): Promise<void> {
    await this.client.post('/analytics/events', event);
  }

  /**
   * Track an event for the current session
   */
  static async track(
    eventType: string,
    eventData?: Record<string, unknown>,
    pageUrl?: string,
    pageTitle?: string
  ): Promise<void> {
    if (!this.currentSessionId) {
      console.warn('No active session. Call createSession() first.');
      return;
    }

    await this.trackEvent({
      sessionId: this.currentSessionId,
      tenantId: '', // Will be set by backend from session
      eventType,
      eventData,
      pageUrl: pageUrl || (typeof window !== 'undefined' ? window.location.href : undefined),
      pageTitle: pageTitle || (typeof document !== 'undefined' ? document.title : undefined),
    });
  }

  /**
   * Get session details
   */
  static async getSession(sessionId: string): Promise<SessionResponse> {
    const response = await this.client.get<ApiResponse<SessionResponse>>(
      `/analytics/sessions/${sessionId}`
    );
    return response.data;
  }

  /**
   * Get analytics summary for a tenant
   */
  static async getSummary(
    tenantId: string | number,
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsSummary> {
    const params: Record<string, string | number> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await this.client.get<ApiResponse<AnalyticsSummary>>(
      `/analytics/${tenantId}`,
      params
    );
    return response.data;
  }

  /**
   * Initialize session tracking automatically
   */
  static async initialize(
    tenantId: string | number,
    utmParams?: Record<string, string>
  ): Promise<string> {
    const session = await this.createSession({
      tenantId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
      landingPage: typeof window !== 'undefined' ? window.location.href : undefined,
      ...utmParams,
    });

    // Track page view
    await this.track('page_view', {
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    });

    return session.id;
  }

  /**
   * Get current session ID
   */
  static getSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Get current session token
   */
  static getSessionToken(): string | null {
    return this.currentSessionToken;
  }
}
