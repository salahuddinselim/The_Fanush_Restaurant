# The Fanus Restaurant — Run Backend + Frontend
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting The Fanus Restaurant Full-Stack System" -ForegroundColor Cyan
Write-Host " Backend:  http://localhost:8000  (FastAPI)" -ForegroundColor White
Write-Host " Frontend: http://localhost:4200  (Angular 19 Mobile-First)" -ForegroundColor White
Write-Host " Mobile:   Open http://<your-ip>:4200 on your phone Wi-Fi" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$env:ADMIN_INIT_PASSWORD = "FanusAdmin123!"
Set-Location "$PSScriptRoot\backend"
python seed.py
Write-Host " CMS login: admin / FanusAdmin123!" -ForegroundColor Yellow
Set-Location "$PSScriptRoot"
$backend = Start-Process -FilePath "python" -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000" -WorkingDirectory "$PSScriptRoot\backend" -PassThru
Write-Host "Backend started with Process ID $($backend.Id)" -ForegroundColor Green

Set-Location "$PSScriptRoot\frontend"
npm start
