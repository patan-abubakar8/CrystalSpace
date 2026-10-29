# ========================================================
# CrystalSpace Multi-Service PowerShell Runner
# ========================================================

$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "             CrystalSpace Ecosystem Runner              " -ForegroundColor Magenta
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot
$backendPath = Join-Path $rootPath "Backend"
$frontendPath = Join-Path $rootPath "Frontend\web"

# Verify folders
if (-not (Test-Path $backendPath)) {
    Write-Error "Backend directory not found at $backendPath"
    exit 1
}
if (-not (Test-Path $frontendPath)) {
    Write-Error "Frontend directory not found at $frontendPath"
    exit 1
}

# Start Backend Process in a new window with title
Write-Host "[1/2] Starting Go Backend on http://localhost:8080..." -ForegroundColor Green
$backendProc = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '--- Starting CrystalSpace Backend ---' -ForegroundColor Magenta; go run ./cmd/api" -PassThru

# Start Frontend Process in a new window with title
Write-Host "[2/2] Starting React Frontend on http://localhost:5173..." -ForegroundColor Green
$frontendProc = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '--- Starting CrystalSpace Frontend ---' -ForegroundColor Cyan; npm run dev" -PassThru

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Both services have been launched successfully!" -ForegroundColor Green
Write-Host "   -> Backend API:  http://localhost:8080/health" -ForegroundColor Yellow
Write-Host "   -> Frontend App: http://localhost:5173" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press [ENTER] in this window to stop both background processes..." -ForegroundColor Gray

try {
    [void][System.Console]::ReadLine()
}
finally {
    Write-Host "`nStopping services..." -ForegroundColor Magenta
    if ($backendProc -and -not $backendProc.HasExited) {
        Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
    }
    if ($frontendProc -and -not $frontendProc.HasExited) {
        Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "CrystalSpace processes terminated cleanly." -ForegroundColor Green
}
