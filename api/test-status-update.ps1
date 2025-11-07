# Test status update with error details

$bookingId = "dc1ed78d-0a19-4509-9ca8-1a7a452ee632"

Write-Host "Testing PATCH /api/bookings/:id/status" -ForegroundColor Cyan

$updateBody = @{
    status = "confirmed"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/bookings/$bookingId/status" -Method PATCH -Body $updateBody -ContentType "application/json"
    Write-Host "✅ Success" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" -ForegroundColor Yellow
        $_.ErrorDetails.Message | Write-Host
    }
}
