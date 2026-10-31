$ErrorActionPreference = "Stop"

$envFile = Join-Path $PSScriptRoot ".env"
$exampleFile = Join-Path $PSScriptRoot ".env.example"

if (-not (Test-Path $envFile)) {
    Copy-Item $exampleFile $envFile
    Write-Host "Created backend\.env from the example. Set DB_PASSWORD to your local PostgreSQL password, then run this script again."
    exit 1
}

$settings = @{}
foreach ($line in Get-Content $envFile) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$') {
        $settings[$Matches[1]] = $Matches[2].Trim('"').Trim("'")
    }
}

if ([string]::IsNullOrWhiteSpace($settings["DB_PASSWORD"]) -or
    $settings["DB_PASSWORD"] -eq "replace-with-your-postgres-password") {
    throw "Set DB_PASSWORD in backend\.env to your local PostgreSQL password, then run this script again."
}

if ([string]::IsNullOrWhiteSpace($settings["JWT_SECRET"]) -or
    $settings["JWT_SECRET"] -eq "generate-on-first-run") {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
    }
    finally {
        $rng.Dispose()
    }

    $settings["JWT_SECRET"] = [Convert]::ToBase64String($bytes)
    $content = Get-Content $envFile
    $content = $content | ForEach-Object {
        if ($_ -match '^\s*JWT_SECRET\s*=') {
            "JWT_SECRET=$($settings["JWT_SECRET"])"
        }
        else {
            $_
        }
    }
    Set-Content -Path $envFile -Value $content -Encoding ascii
}

foreach ($name in @("DB_URL", "DB_USERNAME", "DB_PASSWORD", "JWT_SECRET")) {
    if ([string]::IsNullOrWhiteSpace($settings[$name])) {
        throw "Missing $name in backend\.env."
    }
    Set-Item -Path "Env:$name" -Value $settings[$name]
}

Push-Location $PSScriptRoot
try {
    & .\mvnw.cmd spring-boot:run
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
