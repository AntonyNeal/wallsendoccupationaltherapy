import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import wallsendOTConfig from '../config/tenant.config';

const router = Router();

// Get tenant configuration
router.get('/config', async (req: Request, res: Response) => {
  try {
    // Return the Wallsend OT configuration
    res.json(wallsendOTConfig);
  } catch (error) {
    console.error('Error fetching tenant config:', error);
    res.status(500).json({ error: 'Failed to fetch tenant configuration' });
  }
});

// Get tenant services
router.get('/services', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM services WHERE tenant_id = (SELECT id FROM tenants WHERE subdomain = $1) AND active = true',
      ['wallsendot']
    );
    
    // If no services in DB yet, return configured services
    if (result.rows.length === 0) {
      res.json(wallsendOTConfig.services);
    } else {
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get business information
router.get('/business-info', async (req: Request, res: Response) => {
  try {
    res.json(wallsendOTConfig.businessInfo);
  } catch (error) {
    console.error('Error fetching business info:', error);
    res.status(500).json({ error: 'Failed to fetch business information' });
  }
});

// Get branding
router.get('/branding', async (req: Request, res: Response) => {
  try {
    res.json(wallsendOTConfig.branding);
  } catch (error) {
    console.error('Error fetching branding:', error);
    res.status(500).json({ error: 'Failed to fetch branding' });
  }
});

export default router;
