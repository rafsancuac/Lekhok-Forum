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
$envVars = @{
    'BLOB_READ_WRITE_TOKEN'   = 'vercel_blob_rw_AaB4xR38BNW6yQDo_rOMJqXkofSNjIkPswPf0b0OoMEA8pI'
    'SESSION_SECRET'          = '8Qfa4mS0QfSa2yv_uLDBSM_6Bvxshu98mZWaN8E9'
    'TURSO_AUTH_TOKEN'        = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg1MzA3ODIsImlkIjoiMDFhMDZiM2ItNzgwMS03N2IyLWFhNDQtOWNkZTlhZGFjZGQyIiwia2lkIjoibzNVRWN4SmlfeGdNR0FrNThwQldsd3VmdGZxNGk4X3hWZWNQbWZxNTl4MCIsInJpZCI6ImJiNmRmZGQ0LWFiYjMtNDEyMS1iYWI3LTk5ZGQzZjFjYjZkMiJ9.CTt4pDz1QyFHdI4mdBRtNDKK3YJVivp5DOA6umJMApK7XGKegZhTuZ2JHZ8ADiI7zaBZfJ5Z4I75zzjs3XfVCQ'
    'TURSO_DATABASE_URL'      = 'libsql://lekhok-forum-rafsancuac.aws-ap-south-1.turso.io'
    'BLOB_STORE_ID'           = 'store_AaB4xR38BNW6yQDo'
    'BLOB_WEBHOOK_PUBLIC_KEY' = "-----BEGIN PUBLIC KEY-----`nMCowBQYDK2VwAyEA4TuJd8CcdYYdEOEWIFDRyDn0p48YobT9PHoveBTWY1o=`n-----END PUBLIC KEY-----"
}

foreach ($key in $envVars.Keys) {
    Write-Host "  Setting $key..." -ForegroundColor Gray
    $value = $envVars[$key]
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
