import { Router, Request, Response } from 'express';
import { query } from '../config/database';

const router = Router();

// Get all bookings
router.get('/', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    let queryText = `
      SELECT b.*, s.name as service_name, u.first_name, u.last_name, u.email
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE b.tenant_id = (SELECT id FROM tenants WHERE subdomain = $1)
    `;
    
    const params: any[] = ['wallsendot'];
    
    if (startDate) {
      params.push(startDate);
      queryText += ` AND b.start_time >= $${params.length}`;
    }
    
    if (endDate) {
      params.push(endDate);
      queryText += ` AND b.end_time <= $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      queryText += ` AND b.status = $${params.length}`;
    }
    
    queryText += ' ORDER BY b.start_time ASC';
    
    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create a new booking
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, serviceId, startTime, endTime, notes, ndisClain } = req.body;
    
    const result = await query(
      `INSERT INTO bookings (tenant_id, user_id, service_id, start_time, end_time, notes, ndis_claim, status)
       VALUES ((SELECT id FROM tenants WHERE subdomain = $1), $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      ['wallsendot', userId, serviceId, startTime, endTime, notes || null, ndisClain || false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get a specific booking
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT b.*, s.name as service_name, s.duration, s.price, u.first_name, u.last_name, u.email, u.phone
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1 AND b.tenant_id = (SELECT id FROM tenants WHERE subdomain = $2)`,
      [id, 'wallsendot']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Update a booking
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, startTime, endTime } = req.body;
    
    const updates: string[] = [];
    const params: any[] = [id, 'wallsendot'];
    let paramIndex = 3;
    
    if (status) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    
    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }
    
    if (startTime) {
      updates.push(`start_time = $${paramIndex}`);
      params.push(startTime);
      paramIndex++;
    }
    
    if (endTime) {
      updates.push(`end_time = $${paramIndex}`);
      params.push(endTime);
      paramIndex++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    const result = await query(
      `UPDATE bookings SET ${updates.join(', ')}
       WHERE id = $1 AND tenant_id = (SELECT id FROM tenants WHERE subdomain = $2)
       RETURNING *`,
      params
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Cancel a booking
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const result = await query(
      `UPDATE bookings 
       SET status = 'cancelled', cancellation_reason = $3, cancelled_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND tenant_id = (SELECT id FROM tenants WHERE subdomain = $2)
       RETURNING *`,
      [id, 'wallsendot', reason || null]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Get available time slots
router.get('/availability/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { serviceId } = req.query;
    
    // This is a simplified version - would need more complex logic for real implementation
    const result = await query(
      `SELECT start_time, end_time
       FROM bookings
       WHERE DATE(start_time) = $1
       AND tenant_id = (SELECT id FROM tenants WHERE subdomain = $2)
       AND status NOT IN ('cancelled')
       ORDER BY start_time`,
      [date, 'wallsendot']
    );
    
    res.json({ 
      date,
      bookedSlots: result.rows,
      message: 'Available slots can be calculated on frontend based on booked slots'
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

export default router;
