param(
    [Parameter(Mandatory=$true)]
    [string]$HostUrl,

    [Parameter(Mandatory=$false)]
    [string]$ConfigPath = ".\scripts\smoke_suite_config.json"
)

# Ensure logs directory exists
$logsDir = "logs"
if (!(Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
}

# Load config
$config = Get-Content $ConfigPath | ConvertFrom-Json

function Write-Json($Path, $Obj) {
    $Obj | ConvertTo-Json -Depth 10 | Out-File -FilePath $Path -Encoding utf8
}

function Test-Endpoint($Method, $Url, $Headers=@{}, $Body=$null, $ContentType=$null, $Form=$null) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
        }
        if ($Body) {
            $params.Body = $Body
            if ($ContentType) {
                $params.ContentType = $ContentType
            }
        }
        if ($Form) {
            $params.Form = $Form
        }
        $response = Invoke-RestMethod @params
        $sw.Stop()
        return @{
            ok = $true
            statusCode = 200
            latencyMs = $sw.ElapsedMilliseconds
            response = $response
        }
    } catch {
        $sw.Stop()
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 0 }
        return @{
            ok = $false
            statusCode = $statusCode
            latencyMs = $sw.ElapsedMilliseconds
            error = "$($_.Exception.Message)"
        }
    }
}

function Test-Import-Endpoint($Url, $Headers, $File) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $headersArgs = ""
        foreach ($key in $Headers.Keys) {
            $headersArgs += "-H `"$($key): $($Headers[$key])`" "
        }

        $command = "curl.exe -s -w `"`n%{http_code}`" -F `"file=@$($File)`" -F `"map={}`" $headersArgs `"$Url`""
        $result = Invoke-Expression -Command $command
        
        $sw.Stop()

        $resultParts = $result -split "`n"
        $statusCode = [int]$resultParts[-1]
        $body = $resultParts[0..($resultParts.Length - 2)] -join "`n"
        
        if ($statusCode -ge 200 -and $statusCode -lt 300) {
            return @{
                ok = $true
                statusCode = $statusCode
                latencyMs = $sw.ElapsedMilliseconds
                response = $body | ConvertFrom-Json -ErrorAction SilentlyContinue
            }
        } else {
            return @{
                ok = $false
                statusCode = $statusCode
                latencyMs = $sw.ElapsedMilliseconds
                error = $body
            }
        }
    } catch {
        $sw.Stop()
        return @{
            ok = $false
            statusCode = 0
            latencyMs = $sw.ElapsedMilliseconds
            error = "$($_.Exception.Message)"
        }
    }
}

# Apply DDL
Write-Host "Applying DDL..."
$ddlHeaders = @{ "X-Confirm-Code" = $config.confirmCode }
if ($config.headers.Authorization) {
    $ddlHeaders.Authorization = $config.headers.Authorization
}
$ddlResult = Test-Endpoint "POST" "$HostUrl/api/db/apply-ddl" $ddlHeaders
Write-Host "DDL Result:"
$ddlResult | ConvertTo-Json -Depth 10 | Write-Host

# Initialize summary
$summary = @{
    checks = @{}
    overall = @{ ok = $true; totalChecks = 6; passed = 0; failed = 0; skipped = 0 }
}

# Apply DDL
Write-Host "Applying DDL..."
$ddlHeaders = @{ "X-Confirm-Code" = $config.confirmCode }
if ($config.headers.Authorization) {
    $ddlHeaders.Authorization = $config.headers.Authorization
}
Test-Endpoint "POST" "$HostUrl/api/db/apply-ddl" $ddlHeaders

# 1. Health check
$healthUrl = "$HostUrl/api/health"
$healthResult = Test-Endpoint "GET" $healthUrl
if (!$healthResult.ok -and $healthResult.statusCode -ne 200) {
    $healthUrl = "$HostUrl/health"
    $healthResult = Test-Endpoint "GET" $healthUrl
}
$summary.checks.health = @{
    status = if ($healthResult.ok) { "passed" } else { "failed" }
    latencyMs = $healthResult.latencyMs
    ok = $healthResult.ok
}
if ($healthResult.ok) { $summary.overall.passed++ } else { $summary.overall.failed++ }
Write-Json "$logsDir/health_smoke.json" $healthResult

# 2. Metrics check
$metricsUrl = "$HostUrl/metrics"
$metricsResult = Test-Endpoint "GET" $metricsUrl
$summary.checks.metrics = @{
    status = if ($metricsResult.ok) { "passed" } else { "failed" }
    latencyMs = $metricsResult.latencyMs
    ok = $metricsResult.ok
}
if ($metricsResult.ok) { $summary.overall.passed++ } else { $summary.overall.failed++ }
Write-Json "$logsDir/metrics_smoke.json" $metricsResult

# 3. OAuth status check
$oauthUrl = "$HostUrl/auth/google/status"
$oauthResult = Test-Endpoint "GET" $oauthUrl
if (!$oauthResult.ok -and $oauthResult.statusCode -ne 200) {
    $oauthUrl = "$HostUrl/google/status"
    $oauthResult = Test-Endpoint "GET" $oauthUrl
}
$summary.checks.oauth = @{
    status = if ($oauthResult.ok) { "passed" } else { "failed" }
    latencyMs = $oauthResult.latencyMs
    ok = $oauthResult.ok
}
if ($oauthResult.ok) { $summary.overall.passed++ } else { $summary.overall.failed++ }
Write-Json "$logsDir/oauth_smoke.json" $oauthResult

# 4. RBAC check
$rbacResult = @{ status = "skipped" }
if ($config.rbac.probeUrl) {
    $headers = @{}
    if ($config.headers.Authorization) {
        $headers.Authorization = $config.headers.Authorization
    }
    $rbacResult = Test-Endpoint "GET" $config.rbac.probeUrl $headers
    $summary.checks.rbac = @{
        status = if ($rbacResult.ok) { "passed" } else { "failed" }
        latencyMs = $rbacResult.latencyMs
        ok = $rbacResult.ok
    }
    if ($rbacResult.ok) { $summary.overall.passed++ } else { $summary.overall.failed++ }
} else {
    $summary.checks.rbac = @{ status = "skipped"; ok = $true }
    $summary.overall.skipped++
}
Write-Json "$logsDir/rbac_smoke.json" $rbacResult

# 5. Import check
$importResult = @{ status = "skipped" }
if ($config.import.file -and (Test-Path $config.import.file)) {
    $headers = @{ "X-Confirm-Code" = $config.confirmCode }
    if ($config.headers.Authorization) {
        $headers.Authorization = $config.headers.Authorization
    }
    $importUrl = "$HostUrl/api/import/upload?table=$($config.import.table)&mode=$($config.import.mode)"
    $importResult = Test-Import-Endpoint $importUrl $headers $config.import.file
    
    $summary.checks.import = @{
        status = if ($importResult.ok) { "passed" } else { "failed" }
        latencyMs = $importResult.latencyMs
        ok = $importResult.ok
    }
    if ($importResult.ok) { $summary.overall.passed++ } else { $summary.overall.failed++ }
} else {
    $summary.checks.import = @{ status = "skipped"; ok = $true }
    $summary.overall.skipped++
}
Write-Json "$logsDir/import_smoke.json" $importResult

# 6. Calendar check
$calendarResult = @{ status = "skipped" }
if ($config.calendar.title -and $config.calendar.startISO -and $config.calendar.endISO) {
    $headers = @{ "X-Confirm-Code" = $config.confirmCode; "X-Smoke-Google-Auth" = "yes" }
    if ($config.headers.Authorization) {
        $headers.Authorization = $config.headers.Authorization
    }
    $body = @{
        title = $config.calendar.title
        startISO = $config.calendar.startISO
        endISO = $config.calendar.endISO
    }
    if ($config.calendar.notes) {
        $body.notes = $config.calendar.notes
    }
    $calendarResult = Test-Endpoint "POST" "$HostUrl/api/agent/accountant/calendar" $headers ($body | ConvertTo-Json) "application/json"
    $summary.checks.calendar = @{
        status = if ($calendarResult.ok) { "passed" } else { "failed" }
        latencyMs = $calendarResult.latencyMs
        ok = $calendarResult.ok
    }
    if ($calendarResult.ok) { $summary.overall.passed++ } else { $summary.overall.failed++ }
} else {
    $summary.checks.calendar = @{ status = "skipped"; ok = $true }
    $summary.overall.skipped++
}
Write-Json "$logsDir/calendar_smoke.json" $calendarResult

# Write summary
$summary.overall.ok = $summary.overall.failed -eq 0
Write-Json "$logsDir/smoke_suite_summary.json" $summary

Write-Host "Smoke suite completed. Summary: $($summary.overall.passed) passed, $($summary.overall.failed) failed, $($summary.overall.skipped) skipped."