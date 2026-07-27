Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

$envFile = Join-Path `
  $PSScriptRoot `
  "supabase\functions\.env.lead-notification.local"

if (-not (Test-Path $envFile)) {
  Write-Host ""
  Write-Host "Hiányzik a titkokat tartalmazó fájl:" -ForegroundColor Red
  Write-Host $envFile -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Másold át ezt:" -ForegroundColor Cyan
  Write-Host "supabase\functions\.env.lead-notification.example" -ForegroundColor White
  Write-Host ""
  Write-Host "erre:" -ForegroundColor Cyan
  Write-Host "supabase\functions\.env.lead-notification.local" -ForegroundColor White
  exit 1
}

Write-Host ""
Write-Host "Supabase bejelentkezés..." -ForegroundColor Cyan
npx supabase login

$projectRef = Read-Host `
  "Add meg a Supabase Project Ref értékét"

if ([string]::IsNullOrWhiteSpace($projectRef)) {
  throw "A Supabase Project Ref kötelező."
}

Write-Host ""
Write-Host "Projekt összekapcsolása..." -ForegroundColor Cyan
npx supabase link --project-ref $projectRef

Write-Host ""
Write-Host "Edge Function titkok feltöltése..." -ForegroundColor Cyan
npx supabase secrets set --env-file $envFile

Write-Host ""
Write-Host "lead-notification Edge Function telepítése..." -ForegroundColor Cyan
npx supabase functions deploy `
  lead-notification `
  --no-verify-jwt

Write-Host ""
Write-Host "A lead-notification funkció telepítése sikeres." -ForegroundColor Green
Write-Host ""
Write-Host "Következő lépés:" -ForegroundColor Cyan
Write-Host "Supabase Dashboard → Database → Webhooks" -ForegroundColor White
Write-Host "Hozd létre az INSERT webhookot a contact_leads táblához." -ForegroundColor White
