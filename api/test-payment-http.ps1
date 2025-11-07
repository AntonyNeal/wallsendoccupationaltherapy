# Test Payment API endpoints via HTTP

Write-Host "Testing Payment API Endpoints..." -ForegroundColor Cyan
Write-Host ""

$tenantId = "9daa3c12-bdec-4dc0-993d-7f9f8f391557"
$bookingId = "dc1ed78d-0a19-4509-9ca8-1a7a452ee632"

# Test 1: Create Payment
Write-Host "1. POST /api/payments - Create payment" -ForegroundColor Yellow
$createBody = @{
    tenantId = $tenantId
    bookingId = $bookingId
    processor = "stripe"
    processorTransactionId = "ch_test_12345"
    amount = 750.00
    currency = "USD"
    status = "completed"
    paymentType = "full_payment"
    processorFee = 23.25
    netAmount = 726.75
    paymentMethodType = "card"
    paymentMethodLast4 = "4242"
    paymentMethodBrand = "visa"
    receiptNumber = "RCP-2025-001"
    description = "Dinner date - December 1, 2025"
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/payments" -Method POST -Body $createBody -ContentType "application/json"
    Write-Host "✅ Payment created successfully" -ForegroundColor Green
    Write-Host "Payment ID: $($createResponse.data.id)" -ForegroundColor White
    Write-Host "Amount: $$$($createResponse.data.amount)" -ForegroundColor White
    Write-Host "Status: $($createResponse.data.status)" -ForegroundColor White
    $paymentId = $createResponse.data.id
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    exit 1
}

Write-Host ""

# Test 2: Get Payment
Write-Host "2. GET /api/payments/:id - Retrieve payment" -ForegroundColor Yellow
try {
    $getResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/$paymentId" -Method GET
    Write-Host "✅ Payment retrieved successfully" -ForegroundColor Green
    Write-Host "Amount: $$$($getResponse.data.amount)" -ForegroundColor White
    Write-Host "Processor: $($getResponse.data.processor)" -ForegroundColor White
    Write-Host "Type: $($getResponse.data.paymentType)" -ForegroundColor White
    Write-Host "Receipt: $($getResponse.data.receiptNumber)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get Booking Payments
Write-Host "3. GET /api/payments/booking/:id - Get booking payments" -ForegroundColor Yellow
try {
    $bookingResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/booking/$bookingId" -Method GET
    Write-Host "✅ Booking payments retrieved successfully" -ForegroundColor Green
    Write-Host "Total Payments: $($bookingResponse.data.summary.totalPayments)" -ForegroundColor White
    Write-Host "Total Paid: $$$($bookingResponse.data.summary.totalPaid)" -ForegroundColor White
    Write-Host "Net Total: $$$($bookingResponse.data.summary.netTotal)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Process Refund
Write-Host "4. POST /api/payments/:id/refund - Process refund" -ForegroundColor Yellow
$refundBody = @{
    refundAmount = 200.00
    refundReason = "Customer requested partial refund"
} | ConvertTo-Json

try {
    $refundResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/$paymentId/refund" -Method POST -Body $refundBody -ContentType "application/json"
    Write-Host "✅ Refund processed successfully" -ForegroundColor Green
    Write-Host "Status: $($refundResponse.data.status)" -ForegroundColor White
    Write-Host "Refund Amount: $$$($refundResponse.data.refundAmount)" -ForegroundColor White
    Write-Host "Reason: $($refundResponse.data.refundReason)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Get Tenant Payments
Write-Host "5. GET /api/payments/tenant/:id - List tenant payments" -ForegroundColor Yellow
try {
    $tenantResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/tenant/$tenantId`?status=completed&limit=5" -Method GET
    Write-Host "✅ Tenant payments retrieved successfully" -ForegroundColor Green
    Write-Host "Total: $($tenantResponse.data.pagination.total)" -ForegroundColor White
    Write-Host "Payments:" -ForegroundColor White
    foreach ($payment in $tenantResponse.data.payments) {
        Write-Host "  - $$$($payment.amount) via $($payment.processor) ($($payment.status))" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ All HTTP tests completed!" -ForegroundColor Green
