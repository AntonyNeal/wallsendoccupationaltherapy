/**
 * Database Migration: Add Payments Table
 *
 * Adds payment-processor-agnostic payment tracking to the database.
 * Safe to run multiple times (uses CREATE IF NOT EXISTS pattern).
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read database credentials from .env
const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const getEnvVar = (key) => {
  const match = envFile.match(new RegExp(`${key}=(.+)`));
  return match ? match[1].trim() : null;
};

const client = new Client({
  host: getEnvVar('DB_HOST'),
  port: parseInt(getEnvVar('DB_PORT')),
  database: getEnvVar('DB_NAME'),
  user: getEnvVar('DB_USER'),
  password: getEnvVar('DB_PASSWORD'),
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    console.log('🔄 Running migration: Add Payments Table\n');

    // Check if payments table already exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payments'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('⚠️  Payments table already exists. Skipping creation.\n');
    } else {
      console.log('📋 Creating payments table...\n');

      await client.query(`
        CREATE TABLE payments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
          booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
          
          -- Payment processor info (agnostic design)
          processor VARCHAR(50) NOT NULL,
          processor_transaction_id VARCHAR(255),
          processor_customer_id VARCHAR(255),
          processor_payment_method_id VARCHAR(255),
          
          -- Payment details
          amount DECIMAL(10, 2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'USD',
          
          -- Payment status
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
            'pending', 'processing', 'completed', 'failed', 'cancelled',
            'refunded', 'partially_refunded', 'disputed', 'expired'
          )),
          
          -- Payment type
          payment_type VARCHAR(20) CHECK (payment_type IN (
            'deposit', 'full_payment', 'balance', 'tip', 'cancellation_fee', 'refund'
          )),
          
          -- Fee tracking
          processor_fee DECIMAL(10, 2),
          net_amount DECIMAL(10, 2),
          
          -- Refund tracking
          refund_amount DECIMAL(10, 2) DEFAULT 0,
          refund_reason TEXT,
          refunded_at TIMESTAMP WITH TIME ZONE,
          
          -- Payment method details
          payment_method_type VARCHAR(50),
          payment_method_last4 VARCHAR(4),
          payment_method_brand VARCHAR(50),
          
          -- Metadata
          processor_metadata JSONB DEFAULT '{}'::jsonb,
          
          -- Receipt generation
          receipt_number VARCHAR(50) UNIQUE,
          receipt_url TEXT,
          invoice_number VARCHAR(50),
          
          -- Timestamps
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          failed_at TIMESTAMP WITH TIME ZONE,
          
          -- Notes
          description TEXT,
          internal_notes TEXT,
          customer_notes TEXT
        );
      `);

      console.log('✅ Payments table created');

      // Create indexes
      console.log('📊 Creating indexes...\n');

      await client.query(`
        CREATE INDEX idx_payments_tenant ON payments(tenant_id);
        CREATE INDEX idx_payments_booking ON payments(booking_id);
        CREATE INDEX idx_payments_processor ON payments(processor);
        CREATE INDEX idx_payments_status ON payments(status);
        CREATE INDEX idx_payments_processor_txn ON payments(processor_transaction_id) WHERE processor_transaction_id IS NOT NULL;
        CREATE INDEX idx_payments_receipt ON payments(receipt_number) WHERE receipt_number IS NOT NULL;
        CREATE INDEX idx_payments_tenant_created ON payments(tenant_id, created_at DESC);
        CREATE INDEX idx_payments_tenant_status ON payments(tenant_id, status);
        CREATE INDEX idx_payments_completed ON payments(completed_at DESC) WHERE status = 'completed';
      `);

      console.log('✅ Indexes created');

      // Add trigger for updated_at (create function first if needed)
      console.log('⚡ Setting up trigger...\n');

      // Create the trigger function if it doesn't exist
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      await client.query(`
        CREATE TRIGGER update_payments_updated_at
          BEFORE UPDATE ON payments
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);

      console.log('✅ Trigger created');
    }

    // Create/Replace Views
    console.log('\n📊 Creating/updating payment analytics views...\n');

    await client.query(`
      CREATE OR REPLACE VIEW v_payment_analytics AS
      SELECT 
        t.id AS tenant_id,
        t.name AS tenant_name,
        t.subdomain,
        COUNT(p.id) AS total_payments,
        COUNT(p.id) FILTER (WHERE p.status = 'completed') AS completed_payments,
        COUNT(p.id) FILTER (WHERE p.status = 'pending') AS pending_payments,
        COUNT(p.id) FILTER (WHERE p.status = 'failed') AS failed_payments,
        COUNT(p.id) FILTER (WHERE p.status = 'refunded') AS refunded_payments,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) AS total_revenue,
        COALESCE(SUM(p.net_amount) FILTER (WHERE p.status = 'completed'), 0) AS net_revenue,
        COALESCE(SUM(p.processor_fee) FILTER (WHERE p.status = 'completed'), 0) AS total_fees,
        COALESCE(SUM(p.refund_amount), 0) AS total_refunds,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed' AND p.payment_type = 'deposit'), 0) AS deposit_revenue,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed' AND p.payment_type = 'full_payment'), 0) AS full_payment_revenue,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed' AND p.payment_type = 'balance'), 0) AS balance_revenue,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed' AND p.payment_type = 'tip'), 0) AS tip_revenue,
        ROUND(AVG(p.amount) FILTER (WHERE p.status = 'completed'), 2) AS avg_payment_amount,
        ROUND(AVG(p.processor_fee) FILTER (WHERE p.status = 'completed'), 2) AS avg_processor_fee,
        MIN(p.completed_at) AS first_payment_date,
        MAX(p.completed_at) AS last_payment_date
      FROM tenants t
      LEFT JOIN payments p ON t.id = p.tenant_id
      GROUP BY t.id, t.name, t.subdomain;
    `);

    console.log('✅ v_payment_analytics view created');

    await client.query(`
      CREATE OR REPLACE VIEW v_payment_by_processor AS
      SELECT 
        p.tenant_id,
        t.name AS tenant_name,
        p.processor,
        p.currency,
        COUNT(p.id) AS total_transactions,
        COUNT(p.id) FILTER (WHERE p.status = 'completed') AS successful_transactions,
        COUNT(p.id) FILTER (WHERE p.status = 'failed') AS failed_transactions,
        ROUND(
          (COUNT(p.id) FILTER (WHERE p.status = 'completed')::DECIMAL / 
           NULLIF(COUNT(p.id), 0) * 100), 2
        ) AS success_rate_pct,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) AS total_revenue,
        COALESCE(SUM(p.processor_fee) FILTER (WHERE p.status = 'completed'), 0) AS total_fees,
        COALESCE(SUM(p.net_amount) FILTER (WHERE p.status = 'completed'), 0) AS net_revenue,
        ROUND(
          CASE 
            WHEN SUM(p.amount) FILTER (WHERE p.status = 'completed') > 0 
            THEN (SUM(p.processor_fee) FILTER (WHERE p.status = 'completed')::DECIMAL / 
                  SUM(p.amount) FILTER (WHERE p.status = 'completed') * 100)
            ELSE 0
          END, 2
        ) AS avg_fee_pct,
        ROUND(AVG(p.amount) FILTER (WHERE p.status = 'completed'), 2) AS avg_transaction_amount,
        MIN(p.completed_at) AS first_transaction_date,
        MAX(p.completed_at) AS last_transaction_date
      FROM payments p
      LEFT JOIN tenants t ON p.tenant_id = t.id
      GROUP BY p.tenant_id, t.name, p.processor, p.currency;
    `);

    console.log('✅ v_payment_by_processor view created');

    await client.query(`
      CREATE OR REPLACE VIEW v_booking_revenue AS
      SELECT 
        b.id AS booking_id,
        b.tenant_id,
        t.name AS tenant_name,
        b.client_name,
        b.client_email,
        b.service_type,
        b.preferred_date,
        b.status AS booking_status,
        b.booking_city,
        COUNT(p.id) AS payment_count,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) AS total_paid,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'pending'), 0) AS pending_amount,
        COALESCE(SUM(p.refund_amount), 0) AS refunded_amount,
        COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'deposit' AND p.status = 'completed'), 0) AS deposit_paid,
        COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'full_payment' AND p.status = 'completed'), 0) AS full_payment_paid,
        COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'balance' AND p.status = 'completed'), 0) AS balance_paid,
        COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'tip' AND p.status = 'completed'), 0) AS tips_received,
        CASE 
          WHEN COUNT(p.id) FILTER (WHERE p.status = 'completed') > 0 THEN 'paid'
          WHEN COUNT(p.id) FILTER (WHERE p.status = 'pending') > 0 THEN 'pending'
          WHEN COUNT(p.id) FILTER (WHERE p.status = 'failed') > 0 THEN 'failed'
          ELSE 'unpaid'
        END AS payment_status,
        MAX(p.completed_at) AS last_payment_date,
        STRING_AGG(DISTINCT p.processor, ', ') AS processors_used
      FROM bookings b
      LEFT JOIN payments p ON b.id = p.booking_id
      LEFT JOIN tenants t ON b.tenant_id = t.id
      GROUP BY 
        b.id, b.tenant_id, t.name, b.client_name, b.client_email, 
        b.service_type, b.preferred_date, b.status, b.booking_city;
    `);

    console.log('✅ v_booking_revenue view created');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Migration completed successfully!\n');
    console.log('✅ Payments table added');
    console.log('✅ 9 indexes created for query optimization');
    console.log('✅ 3 analytical views created:');
    console.log('   - v_payment_analytics (revenue by tenant)');
    console.log('   - v_payment_by_processor (compare processors)');
    console.log('   - v_booking_revenue (booking payment status)');
    console.log('\n💡 Payment Processor Agnostic Design:');
    console.log('   Supports: Stripe, Square, PayPal, Venmo, Cash App,');
    console.log('   Crypto, Bank Transfer, Cash, and custom processors');
    console.log('\n📊 Tracks:');
    console.log('   - Transaction amounts and fees');
    console.log('   - Payment status and types');
    console.log('   - Refunds and chargebacks');
    console.log('   - Receipt generation');
    console.log('   - Processor-specific metadata (JSONB)');
    console.log('='.repeat(60));

    await client.end();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

migrate();
