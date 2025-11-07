# Test Booking API with better error handling

Write-Host "Testing Booking API - POST /api/bookings" -ForegroundColor Cyan

$createBody = @{
    tenantId = "9daa3c12-bdec-4dc0-993d-7f9f8f391557"
    locationId = "402b0c59-358c-4fea-b169-e9cec9dac20b"
    availabilityId = "a8f06428-a9b2-408f-af5a-35bcc1d9b06d"
    clientName = "Jane Smith"
    clientEmail = "jane.smith@example.com"
    clientPhone = "+61412345678"
    serviceType = "Dinner Date"
    preferredDate = "2025-11-30T19:00:00Z"
    duration = "2 hours"
    durationHours = 2
    bookingCity = "Sydney"
    bookingCountry = "AU"
    message = "Looking forward to meeting you!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/bookings" -Method POST -Body $createBody -ContentType "application/json"
    Write-Host "✅ Success" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" -ForegroundColor Yellow
        $_.ErrorDetails.Message | Write-Host
    }
}
