# Vercel Deploy Script for Lekhok Forum
# Run this ONCE from PowerShell to set env vars and deploy.

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# Path to Node.js (Vercel CLI needs it on PATH)
$env:Path = "C:\Program Files\nodejs;$env:Path"

Write-Host "`n=== Step 1: Vercel CLI ===" -ForegroundColor Cyan
& vercel --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm i -g vercel
}

Write-Host "`n=== Step 2: Login (browser will open) ===" -ForegroundColor Cyan
& vercel login

Write-Host "`n=== Step 3: Link to existing project ===" -ForegroundColor Cyan
& vercel link --yes

Write-Host "`n=== Step 4: Set environment variables ===" -ForegroundColor Cyan
# ── সেশন ৯১ নিরাপত্তা-সংশোধন (CRITICAL) ─────────────────────────────────────
# আগে এই ফাইলে প্রোডাকশন সিক্রেট (TURSO_AUTH_TOKEN / SESSION_SECRET /
# BLOB_READ_WRITE_TOKEN) হার্ডকোড করা ছিল — পাবলিক রিপোতে কমিট হয়ে ফাঁস হয়েছে।
# এখন আর কোনো আসল মান এখানে রাখা হয় না; ভ্যালু এনভায়রনমেন্ট/সিক্রেট-ম্যানেজার
# থেকে আসে। ⚠️ ফাঁস হওয়া ৩টি সিক্রেট অবশ্যই রোটেট করতে হবে:
#   ১) Turso: `turso db tokens invalidate <db>` + নতুন টোকেন → Vercel env
#   ২) SESSION_SECRET: নতুন র‍্যান্ডম ভ্যালু → Vercel env (সব সেশন রিসেট হবে)
#   ৩) Vercel Blob: ড্যাশবোর্ডে টোকেন রোল → Vercel env
$envVars = @{
    'BLOB_READ_WRITE_TOKEN'   = $env:LEKHOK_BLOB_TOKEN        # রান-টাইমে দিন
    'SESSION_SECRET'          = $env:LEKHOK_SESSION_SECRET    # রান-টাইমে দিন
    'TURSO_AUTH_TOKEN'        = $env:LEKHOK_TURSO_TOKEN       # রান-টাইমে দিন
    'TURSO_DATABASE_URL'      = 'libsql://lekhok-forum-rafsancuac.aws-ap-south-1.turso.io'
    'BLOB_STORE_ID'           = $env:LEKHOK_BLOB_STORE_ID     # রান-টাইমে দিন
    'BLOB_WEBHOOK_PUBLIC_KEY' = $env:LEKHOK_BLOB_WEBHOOK_KEY  # রান-টাইমে দিন
}

foreach ($key in $envVars.Keys) {
    Write-Host "  Setting $key..." -ForegroundColor Gray
    $value = $envVars[$key]
    if (-not $value) { Write-Host "  SKIP $key (env-ভ্যালু নেই)" -ForegroundColor Yellow; continue }
    # Pipe value in to avoid shell-escape issues
    $value | & vercel env add $key production --yes 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Trying to update existing..." -ForegroundColor Yellow
        $value | & vercel env update $key production --yes 2>&1 | Out-Null
    }
}

Write-Host "`n=== Step 5: Deploy to production ===" -ForegroundColor Cyan
& vercel --prod --yes

Write-Host "`n=== Done! ===" -ForegroundColor Green
Write-Host "Your site should be live at the URL shown above." -ForegroundColor Green
