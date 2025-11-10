import { Router, Request, Response } from 'express';
import { query } from '../config/database';

const router = Router();

// Get booking analytics
router.get('/bookings', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Total bookings
    const totalResult = await query(
      `SELECT COUNT(*) as total, status
       FROM bookings
       WHERE tenant_id = (SELECT id FROM tenants WHERE subdomain = $1)
       ${startDate ? `AND start_time >= $2` : ''}
       ${endDate ? `AND end_time <= $3` : ''}
       GROUP BY status`,
      ['wallsendot', startDate, endDate].filter(Boolean)
    );
    
    // Revenue
    const revenueResult = await query(
      `SELECT SUM(p.amount) as total_revenue, COUNT(p.id) as payment_count
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       WHERE b.tenant_id = (SELECT id FROM tenants WHERE subdomain = $1)
       AND p.status = 'completed'
       ${startDate ? `AND p.paid_at >= $2` : ''}
       ${endDate ? `AND p.paid_at <= $3` : ''}`,
      ['wallsendot', startDate, endDate].filter(Boolean)
    );
    
    // Popular services
    const servicesResult = await query(
      `SELECT s.name, s.id, COUNT(b.id) as booking_count
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.tenant_id = (SELECT id FROM tenants WHERE subdomain = $1)
       ${startDate ? `AND b.start_time >= $2` : ''}
       ${endDate ? `AND b.end_time <= $3` : ''}
       GROUP BY s.id, s.name
       ORDER BY booking_count DESC
       LIMIT 10`,
      ['wallsendot', startDate, endDate].filter(Boolean)
    );
    
    res.json({
      bookings: totalResult.rows,
      revenue: revenueResult.rows[0] || { total_revenue: 0, payment_count: 0 },
      popularServices: servicesResult.rows
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get NDIS-specific analytics
router.get('/ndis', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // NDIS bookings
    const ndisResult = await query(
      `SELECT 
         COUNT(*) as total_ndis_bookings,
         SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) as pending
       FROM bookings b
       WHERE b.tenant_id = (SELECT id FROM tenants WHERE subdomain = $1)
       AND b.ndis_claim = true
       ${startDate ? `AND b.start_time >= $2` : ''}
       ${endDate ? `AND b.end_time <= $3` : ''}`,
      ['wallsendot', startDate, endDate].filter(Boolean)
    );
    
    // NDIS participants
    const participantsResult = await query(
      `SELECT COUNT(DISTINCT u.id) as total_participants
       FROM users u
       JOIN bookings b ON u.id = b.user_id
       WHERE b.tenant_id = (SELECT id FROM tenants WHERE subdomain = $1)
       AND u.ndis_number IS NOT NULL
       ${startDate ? `AND b.start_time >= $2` : ''}
       ${endDate ? `AND b.end_time <= $3` : ''}`,
      ['wallsendot', startDate, endDate].filter(Boolean)
    );
    
    res.json({
      ndisBookings: ndisResult.rows[0],
      ndisParticipants: participantsResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching NDIS analytics:', error);
    res.status(500).json({ error: 'Failed to fetch NDIS analytics' });
  }
});

// Track analytics event
router.post('/event', async (req: Request, res: Response) => {
  try {
    const { eventType, eventData, userId } = req.body;
    
    await query(
      `INSERT INTO analytics_events (tenant_id, event_type, event_data, user_id)
       VALUES ((SELECT id FROM tenants WHERE subdomain = $1), $2, $3, $4)`,
      ['wallsendot', eventType, JSON.stringify(eventData || {}), userId || null]
    );
    
    res.status(201).json({ message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

export default router;
