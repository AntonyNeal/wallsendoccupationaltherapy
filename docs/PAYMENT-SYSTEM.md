# Payment System Documentation

## Overview

Payment-processor-agnostic payment tracking system that works with **any payment provider**.

## Supported Processors

- **Credit Cards**: Stripe, Square, Authorize.net
- **Digital Wallets**: PayPal, Venmo, Cash App, Apple Pay, Google Pay
- **Cryptocurrency**: Bitcoin, Ethereum, USDC, etc.
- **Traditional**: Bank Transfer, Cash, Check
- **Custom**: Any other payment processor

## Database Schema

### `payments` Table

Stores all payment transactions regardless of processor.

**Key Fields:**

- `processor` - Name of payment processor used (`'stripe'`, `'square'`, `'paypal'`, `'cash'`, etc.)
- `processor_transaction_id` - External transaction ID from the processor
- `amount` - Payment amount
- `currency` - ISO 4217 currency code (default: `'USD'`)
- `status` - Standardized status across all processors:
  - `pending` - Payment initiated
  - `processing` - Being processed
  - `completed` - Successful
  - `failed` - Failed
  - `refunded` - Full refund
  - `partially_refunded` - Partial refund
  - `disputed` - Chargeback filed

**Payment Types:**

- `deposit` - Deposit payment
- `full_payment` - Full payment upfront
- `balance` - Balance payment
- `tip` - Gratuity
- `cancellation_fee` - Cancellation fee

**Fee Tracking:**

- `processor_fee` - Fee charged by processor
- `net_amount` - Amount after fees (`amount - processor_fee`)

**Metadata:**

- `processor_metadata` - JSONB field for processor-specific data
- `receipt_number` - Human-readable receipt number
- `receipt_url` - Link to receipt (if hosted by processor)

## Analytics Views

### `v_payment_analytics`

Revenue breakdown by tenant:

- Total revenue, net revenue, fees
- Payment counts by status
- Revenue by payment type (deposit, full, balance, tip)
- Averages and date ranges

### `v_payment_by_processor`

Compare different payment processors:

- Transaction counts and success rates
- Revenue and fees per processor
- Average fee percentage
- Transaction volumes

### `v_booking_revenue`

Link bookings to payments:

- Payment status per booking
- Amount paid, pending, refunded
- Multiple processors per booking
- Payment breakdown by type

## API Integration Examples

### Stripe Integration

```javascript
// Record Stripe payment
await db.query(
  `
  INSERT INTO payments (
    tenant_id, booking_id, processor, processor_transaction_id,
    amount, currency, status, payment_type,
    processor_fee, net_amount,
    payment_method_type, payment_method_last4, payment_method_brand,
    processor_metadata, receipt_url, description
  ) VALUES (
    $1, $2, 'stripe', $3,
    $4, $5, 'completed', 'deposit',
    $6, $7,
    'card', $8, $9,
    $10, $11, $12
  )
`,
  [
    tenantId,
    bookingId,
    stripeCharge.id, // processor_transaction_id
    stripeCharge.amount / 100, // amount (Stripe uses cents)
    stripeCharge.currency.toUpperCase(), // currency
    stripeCharge.application_fee_amount / 100, // processor_fee
    (stripeCharge.amount - stripeCharge.application_fee_amount) / 100, // net_amount
    stripeCharge.payment_method_details.card.last4,
    stripeCharge.payment_method_details.card.brand,
    JSON.stringify({
      stripe_charge_id: stripeCharge.id,
      stripe_payment_intent: stripeCharge.payment_intent,
      receipt_url: stripeCharge.receipt_url,
      risk_score: stripeCharge.outcome.risk_score,
    }),
    stripeCharge.receipt_url,
    'Booking deposit',
  ]
);
```

### Square Integration

```javascript
// Record Square payment
await db.query(
  `
  INSERT INTO payments (
    tenant_id, booking_id, processor, processor_transaction_id,
    amount, currency, status, payment_type,
    processor_fee, net_amount,
    payment_method_type, payment_method_last4, payment_method_brand,
    processor_metadata, receipt_url
  ) VALUES (
    $1, $2, 'square', $3,
    $4, $5, 'completed', 'full_payment',
    $6, $7,
    'card', $8, $9,
    $10, $11
  )
`,
  [
    tenantId,
    bookingId,
    squarePayment.id,
    squarePayment.amount_money.amount / 100,
    squarePayment.amount_money.currency,
    squarePayment.processing_fee?.[0]?.amount_money?.amount / 100 || 0,
    (squarePayment.amount_money.amount -
      (squarePayment.processing_fee?.[0]?.amount_money?.amount || 0)) /
      100,
    squarePayment.card_details.card.last_4,
    squarePayment.card_details.card.card_brand,
    JSON.stringify({
      square_payment_id: squarePayment.id,
      square_order_id: squarePayment.order_id,
      location_id: squarePayment.location_id,
    }),
    squarePayment.receipt_url,
  ]
);
```

### PayPal Integration

```javascript
// Record PayPal payment
await db.query(
  `
  INSERT INTO payments (
    tenant_id, booking_id, processor, processor_transaction_id,
    amount, currency, status, payment_type,
    processor_fee, net_amount,
    payment_method_type,
    processor_metadata
  ) VALUES (
    $1, $2, 'paypal', $3,
    $4, $5, 'completed', 'full_payment',
    $6, $7,
    'digital_wallet',
    $8
  )
`,
  [
    tenantId,
    bookingId,
    paypalOrder.id,
    parseFloat(paypalOrder.purchase_units[0].amount.value),
    paypalOrder.purchase_units[0].amount.currency_code,
    0, // Calculate from PayPal fee structure
    parseFloat(paypalOrder.purchase_units[0].amount.value), // Adjust for fees
    JSON.stringify({
      paypal_order_id: paypalOrder.id,
      payer_email: paypalOrder.payer.email_address,
      payer_id: paypalOrder.payer.payer_id,
    }),
  ]
);
```

### Cash Payment

```javascript
// Record cash payment
await db.query(
  `
  INSERT INTO payments (
    tenant_id, booking_id, processor, 
    amount, currency, status, payment_type,
    processor_fee, net_amount,
    payment_method_type, description, internal_notes
  ) VALUES (
    $1, $2, 'cash',
    $3, 'USD', 'completed', 'full_payment',
    0, $3,
    'cash', $4, $5
  )
`,
  [
    tenantId,
    bookingId,
    amountReceived,
    'In-person cash payment',
    'Received at meeting on ' + new Date().toISOString(),
  ]
);
```

## Receipt Generation

Generate unique receipt numbers:

```javascript
const generateReceiptNumber = (tenantId, paymentId) => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const tenant = tenantId.slice(0, 4).toUpperCase();
  const payment = paymentId.slice(0, 6).toUpperCase();
  return `RCP-${date}-${tenant}-${payment}`;
};
```

## Querying Payment Data

### Get tenant revenue summary

```sql
SELECT * FROM v_payment_analytics WHERE tenant_id = '...';
```

### Compare payment processors

```sql
SELECT * FROM v_payment_by_processor
WHERE tenant_id = '...'
ORDER BY total_revenue DESC;
```

### Check booking payment status

```sql
SELECT * FROM v_booking_revenue WHERE booking_id = '...';
```

### Get recent completed payments

```sql
SELECT
  p.*,
  b.client_name,
  b.service_type,
  t.name AS tenant_name
FROM payments p
LEFT JOIN bookings b ON p.booking_id = b.id
LEFT JOIN tenants t ON p.tenant_id = t.id
WHERE p.status = 'completed'
ORDER BY p.completed_at DESC
LIMIT 50;
```

## Best Practices

1. **Always set processor_fee** - Track fees from each processor
2. **Use processor_metadata** - Store processor-specific data as JSONB
3. **Generate receipt_number** - Create human-readable receipt IDs
4. **Link to bookings** - Always associate payments with bookings when applicable
5. **Track refunds separately** - Use refund_amount and refunded_at fields
6. **Standardize status** - Map processor-specific statuses to our standard statuses

## Migration

Run migration:

```bash
node scripts/migrate-add-payments.js
```

This is safe to run multiple times - it will skip if payments table already exists.
