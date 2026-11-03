# ==============================================================================
# PBL6 AI SHORT VIDEO MODERATION - 1-CLICK DEV STARTUP SCRIPT (WINDOWS POWERSHELL)
# ==============================================================================
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Set-Location $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  PBL6 AI SHORT VIDEO MODERATION - 1-CLICK DEV RUNNER    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Hàm dọn dẹp tiến trình đang chiếm cổng
function Stop-PortProcess {
    param([int]$Port)
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            $procId = $conn.OwningProcess
            if ($procId -and $procId -ne $PID) {
                Write-Host "[CLEANUP] Đang dừng tiến trình PID $procId đang chiếm cổng $Port..." -ForegroundColor Yellow
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {}
}

# Dọn dẹp cổng 8000 và 5173 trước khi khởi chạy nếu có tiến trình treo cũ
Stop-PortProcess 8000
Stop-PortProcess 5173

# Bước 1: Kiểm tra công cụ hệ thống (uv, node, npm)
Write-Host "`n[1/5] Kiểm tra công cụ hệ thống (uv, node, npm)..." -ForegroundColor Cyan
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] 'uv' chưa được cài đặt! Vui lòng cài đặt: https://docs.astral.sh/uv/" -ForegroundColor Red
    exit 1
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] 'node' chưa được cài đặt! Vui lòng cài đặt Node.js." -ForegroundColor Red
    exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] 'npm' chưa được cài đặt! Vui lòng cài đặt npm." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Môi trường uv, node, npm đã sẵn sàng!" -ForegroundColor Green

# Bước 2: Đồng bộ thư viện Backend (uv sync)
Write-Host "`n[2/5] Đồng bộ thư viện Backend (uv sync)..." -ForegroundColor Cyan
uv sync --directory backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] uv sync thất bại! Vui lòng kiểm tra kết nối mạng hoặc pyproject.toml." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Thư viện Backend đã được đồng bộ hoàn tất!" -ForegroundColor Green

# Bước 3: Kiểm tra dependencies Frontend
Write-Host "`n[3/5] Kiểm tra dependencies Frontend..." -ForegroundColor Cyan
if (-not (Test-Path "$PSScriptRoot\frontend\node_modules")) {
    Write-Host "[*] Chưa tìm thấy frontend/node_modules. Đang chạy 'npm --prefix frontend install'..." -ForegroundColor Yellow
    npm --prefix frontend install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Cài đặt dependencies frontend thất bại!" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Cài đặt dependencies frontend hoàn tất!" -ForegroundColor Green
} else {
    Write-Host "[OK] frontend/node_modules đã sẵn sàng!" -ForegroundColor Green
}

# Bước 4: Đồng bộ Database lên bản mới nhất (Alembic migration)
Write-Host "`n[4/5] Đồng bộ Database lên bản mới nhất (Alembic migration)..." -ForegroundColor Cyan
uv run --directory backend alembic upgrade head
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Đồng bộ Database thất bại! Mã lỗi: $LASTEXITCODE. Hủy khởi chạy server." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Database đã được đồng bộ lên bản mới nhất!" -ForegroundColor Green

# Bước 5: Khởi động song song Backend và Frontend
Write-Host "`n[5/5] Khởi động song song Backend và Frontend..." -ForegroundColor Cyan

# Khởi chạy Backend (Uvicorn)
$backendProc = Start-Process -FilePath "uv" -ArgumentList "run", "--directory", "backend", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000" -PassThru -NoNewWindow

# Khởi chạy Frontend (Vite)
$frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run --prefix frontend dev" -PassThru -NoNewWindow

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  HỆ THỐNG ĐÃ KHỞI CHẠY THÀNH CÔNG!                      " -ForegroundColor Green
Write-Host "  - Frontend:         http://localhost:5173               " -ForegroundColor Yellow
Write-Host "  - Backend API:      http://127.0.0.1:8000               " -ForegroundColor Yellow
Write-Host "  - Backend Docs:     http://127.0.0.1:8000/docs          " -ForegroundColor Yellow
Write-Host "  Nhấn [Ctrl + C] để dừng toàn bộ hệ thống.              " -ForegroundColor Cyan
Write-Host "==========================================================`n" -ForegroundColor Green

# Lắng nghe và Clean Shutdown khi thoát
try {
    while ($true) {
        Start-Sleep -Milliseconds 500
        if ($backendProc.HasExited) {
            Write-Host "[CẢNH BÁO] Tiến trình Backend đã dừng (ExitCode: $($backendProc.ExitCode))." -ForegroundColor Red
            break
        }
        if ($frontendProc.HasExited) {
            Write-Host "[CẢNH BÁO] Tiến trình Frontend đã dừng (ExitCode: $($frontendProc.ExitCode))." -ForegroundColor Red
            break
        }
    }
}
finally {
    Write-Host "`n[STOPPING] Đang dừng toàn bộ dịch vụ và giải phóng cổng..." -ForegroundColor Yellow
    if ($backendProc -and -not $backendProc.HasExited) {
        taskkill /PID $backendProc.Id /T /F >$null 2>&1
    }
    if ($frontendProc -and -not $frontendProc.HasExited) {
        taskkill /PID $frontendProc.Id /T /F >$null 2>&1
    }
    Stop-PortProcess 8000
    Stop-PortProcess 5173
    Write-Host "[OK] Đã dọn dẹp sạch sẽ toàn bộ dịch vụ. Tạm biệt!" -ForegroundColor Green
}
