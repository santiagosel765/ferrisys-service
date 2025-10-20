Param()

$ErrorActionPreference = 'Stop'

$rootDir = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $rootDir 'back-costa'
$frontendDir = Join-Path $rootDir 'front-costa'

Write-Host 'Starting backend service...'
$backendProcess = Start-Process -FilePath (Join-Path $backendDir 'mvnw.cmd') -ArgumentList @('spring-boot:run') -WorkingDirectory $backendDir -NoNewWindow -PassThru

$frontendProcess = $null

try {
    Write-Host 'Installing frontend dependencies...'
    npm @('ci', '--prefix', $frontendDir)

    Write-Host 'Starting frontend server...'
    $frontendProcess = Start-Process -FilePath 'npx' -ArgumentList @('ng', 'serve') -WorkingDirectory $frontendDir -NoNewWindow -PassThru

    Write-Host "Backend (PID: $($backendProcess.Id)) and frontend (PID: $($frontendProcess.Id)) are running. Press Ctrl+C to stop."
    Wait-Process -InputObject @($backendProcess, $frontendProcess)
}
finally {
    Write-Host 'Stopping services...'
    if ($backendProcess -and -not $backendProcess.HasExited) {
        try { $backendProcess.CloseMainWindow() | Out-Null } catch {}
        Start-Sleep -Seconds 2
        if (-not $backendProcess.HasExited) {
            $backendProcess.Kill()
        }
    }
    if ($frontendProcess -and -not $frontendProcess.HasExited) {
        try { $frontendProcess.CloseMainWindow() | Out-Null } catch {}
        Start-Sleep -Seconds 2
        if (-not $frontendProcess.HasExited) {
            $frontendProcess.Kill()
        }
    }
}
