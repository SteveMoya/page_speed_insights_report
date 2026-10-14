<#
.SYNOPSIS
    Abre cada dominio de un archivo de lista (uno por linea) como https://<dominio>/wp-admin

.DESCRIPTION
    Equivalente PowerShell de opentobrowser.sh para Windows.
    Por defecto usa el navegador predeterminado del sistema (Vivaldi en este equipo).
    Con -Browser puedes forzar un ejecutable concreto.

.PARAMETER Lista
    Ruta del archivo con un dominio por linea. Por defecto urls.csv

.PARAMETER Browser
    Ruta opcional al ejecutable del navegador. Ej: vivaldi.exe

.PARAMETER DelayMs
    Pausa en milisegundos entre cada apertura. Por defecto 500

.EXAMPLE
    .\opentobrowser.ps1 urls.csv

.EXAMPLE
    .\opentobrowser.ps1 urls.csv -Browser "$env:LOCALAPPDATA\Vivaldi\Application\vivaldi.exe"

.EXAMPLE
    .\opentobrowser.ps1 -Lista urls.csv -DelayMs 1000
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Lista = "urls.csv",

    [string]$Browser,

    [int]$DelayMs = 500
)

$ErrorActionPreference = "Stop"

# 1. Verificar que el archivo existe
if (-not (Test-Path -LiteralPath $Lista)) {
    Write-Host "Error: El archivo '$Lista' no existe." -ForegroundColor Red
    exit 1
}

# 2. Comprobar navegador forzado (si se indico)
if ($Browser -and -not (Test-Path -LiteralPath $Browser)) {
    Write-Host "Error: El navegador '$Browser' no existe." -ForegroundColor Red
    exit 1
}

Write-Host "Procesando lista de dominios..."

# 3. Leer linea por linea
foreach ($linea in (Get-Content -LiteralPath $Lista)) {

    # Limpieza: quitar espacios, CR y saltos
    $dominio = ($linea -replace "`r|`n", "").Trim()

    # Saltar lineas vacias o comentarios
    if ([string]::IsNullOrWhiteSpace($dominio) -or $dominio.StartsWith("#")) {
        continue
    }

    # Construir URL completa
    $url = "https://$dominio/wp-admin"

    Write-Host "   -> Abriendo: $url"

    if ($Browser) {
        Start-Process -FilePath $Browser -ArgumentList $url | Out-Null
    }
    else {
        # Usa el navegador predeterminado del sistema
        Start-Process $url | Out-Null
    }

    # Pausa de seguridad
    if ($DelayMs -gt 0) {
        Start-Sleep -Milliseconds $DelayMs
    }
}

Write-Host "Todas las webs han sido lanzadas."
