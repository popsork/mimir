param(
    [string]$Root,
    [switch]$PersistUser
)

$ErrorActionPreference = "Stop"

function Get-Score {
    param([string]$Path)
    if ($Path -match "metrics|mdapi|gpa") { return 2 }
    if ($Path -match "intel") { return 1 }
    return 0
}

function Find-SdkRoots {
    param([string]$BasePath, [int]$MaxDepth)

    $queue = New-Object System.Collections.Generic.Queue[object]
    $queue.Enqueue([pscustomobject]@{ Path = $BasePath; Depth = 0 })
    $found = @()

    while ($queue.Count -gt 0) {
        $item = $queue.Dequeue()
        $path = $item.Path
        $depth = $item.Depth

        if (-not (Test-Path -LiteralPath $path)) {
            continue
        }

        $includePath = Join-Path $path "include"
        $libPath = Join-Path $path "lib"
        if ((Test-Path -LiteralPath $includePath) -and (Test-Path -LiteralPath $libPath)) {
            $libFiles = Get-ChildItem -LiteralPath $libPath -Filter "*.lib" -ErrorAction SilentlyContinue
            if ($libFiles) {
                $found += [pscustomobject]@{ Path = $path; Score = (Get-Score -Path $path) }
                continue
            }
        }

        if ($depth -ge $MaxDepth) {
            continue
        }

        Get-ChildItem -LiteralPath $path -Directory -ErrorAction SilentlyContinue | ForEach-Object {
            $queue.Enqueue([pscustomobject]@{ Path = $_.FullName; Depth = $depth + 1 })
        }
    }

    return $found
}

function Select-LibraryName {
    param([string]$LibPath)

    $libs = Get-ChildItem -LiteralPath $LibPath -Filter "*.lib" -ErrorAction SilentlyContinue
    if (-not $libs) {
        return $null
    }

    $preferred = $libs | Where-Object { $_.Name -match "mdapi|metrics|gpa" }
    $selected = if ($preferred) { $preferred[0] } else { $libs[0] }
    return [System.IO.Path]::GetFileNameWithoutExtension($selected.Name)
}

$searchRoots = @()
if ($Root) {
    $searchRoots += $Root
} else {
    $searchRoots += "C:\\Program Files\\Intel"
    $searchRoots += "C:\\Program Files (x86)\\Intel"
}

$candidates = @()
foreach ($base in $searchRoots) {
    $candidates += Find-SdkRoots -BasePath $base -MaxDepth 4
}

if (-not $candidates) {
    Write-Host "No SDK candidates found. Re-run with -Root <path-to-sdk-root>." -ForegroundColor Yellow
    exit 1
}

$selectedSdk = $candidates | Sort-Object Score -Descending | Select-Object -First 1
$sdkRoot = $selectedSdk.Path

$libPath = Join-Path $sdkRoot "lib"
$libName = Select-LibraryName -LibPath $libPath
if (-not $libName) {
    Write-Host "Found SDK root but no .lib files in $libPath" -ForegroundColor Yellow
    exit 1
}

$env:INTEL_MD_SDK = $sdkRoot
if ($PersistUser) {
    [Environment]::SetEnvironmentVariable("INTEL_MD_SDK", $sdkRoot, "User")
}

Write-Host "INTEL_MD_SDK set to: $sdkRoot"
Write-Host "Suggested -l name: $libName"
Write-Host "Update intel_md_windows.go to use: -l$libName"
