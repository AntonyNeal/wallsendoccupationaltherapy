# Test Booking API endpoints via HTTP

Write-Host "Testing Booking API Endpoints..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Create Booking
Write-Host "1. POST /api/bookings - Create booking" -ForegroundColor Yellow
$createBody = @{
    tenantId = "9daa3c12-bdec-4dc0-993d-7f9f8f391557"
    locationId = "402b0c59-358c-4fea-b169-e9cec9dac20b"
    availabilityId = "8a0655f9-78c1-41e7-8a43-d36dca6c82fd"
    clientName = "Jane Smith"
    clientEmail = "jane.smith@example.com"
    clientPhone = "+61412345678"
    serviceType = "Dinner Date"
    preferredDate = "2025-12-01T19:00:00Z"
    duration = "2 hours"
    durationHours = 2
    bookingCity = "Sydney"
    bookingCountry = "AU"
    message = "Looking forward to meeting you!"
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/bookings" -Method POST -Body $createBody -ContentType "application/json"
    Write-Host "✅ Booking created successfully" -ForegroundColor Green
    Write-Host "Booking ID: $($createResponse.data.id)" -ForegroundColor White
    Write-Host "Client: $($createResponse.data.clientName)" -ForegroundColor White
    Write-Host "Status: $($createResponse.data.status)" -ForegroundColor White
    $bookingId = $createResponse.data.id
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Get Booking
Write-Host "2. GET /api/bookings/:id - Retrieve booking" -ForegroundColor Yellow
try {
    $getResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/bookings/$bookingId" -Method GET
    Write-Host "✅ Booking retrieved successfully" -ForegroundColor Green
    Write-Host "Client: $($getResponse.data.clientName)" -ForegroundColor White
    Write-Host "Email: $($getResponse.data.clientEmail)" -ForegroundColor White
    Write-Host "Tenant: $($getResponse.data.tenant.name)" -ForegroundColor White
    Write-Host "Status: $($getResponse.data.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Update Booking Status
Write-Host "3. PATCH /api/bookings/:id/status - Update to confirmed" -ForegroundColor Yellow
$updateBody = @{
    status = "confirmed"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/bookings/$bookingId/status" -Method PATCH -Body $updateBody -ContentType "application/json"
    Write-Host "✅ Status updated successfully" -ForegroundColor Green
    Write-Host "New Status: $($updateResponse.data.status)" -ForegroundColor White
    Write-Host "Confirmed At: $($updateResponse.data.confirmedAt)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Get Tenant Bookings
Write-Host "4. GET /api/bookings/tenant/:id - List tenant bookings" -ForegroundColor Yellow
try {
    $listResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/bookings/tenant/9daa3c12-bdec-4dc0-993d-7f9f8f391557?status=confirmed&limit=5" -Method GET
    Write-Host "✅ Bookings retrieved successfully" -ForegroundColor Green
    Write-Host "Total: $($listResponse.data.pagination.total)" -ForegroundColor White
    Write-Host "Bookings:" -ForegroundColor White
    foreach ($booking in $listResponse.data.bookings) {
        Write-Host "  - $($booking.clientName) ($($booking.status)) on $($booking.preferredDate)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Update to Cancelled
Write-Host "5. PATCH /api/bookings/:id/status - Update to cancelled" -ForegroundColor Yellow
$cancelBody = @{
    status = "cancelled"
    cancellationReason = "Test cancellation"
} | ConvertTo-Json

try {
    $cancelResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/bookings/$bookingId/status" -Method PATCH -Body $cancelBody -ContentType "application/json"
    Write-Host "✅ Status updated to cancelled" -ForegroundColor Green
    Write-Host "Status: $($cancelResponse.data.status)" -ForegroundColor White
    Write-Host "Reason: $($cancelResponse.data.cancellationReason)" -ForegroundColor White
    Write-Host "Cancelled At: $($cancelResponse.data.cancelledAt)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ All HTTP tests completed!" -ForegroundColor Green
