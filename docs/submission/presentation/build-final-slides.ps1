$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..\..\..")
$texFile = Join-Path $scriptDir "ddiscover-final-slides.tex"

function Invoke-Latex($command) {
  Push-Location $repoRoot
  try {
    & $command -interaction=nonstopmode -halt-on-error -output-directory $scriptDir $texFile
    & $command -interaction=nonstopmode -halt-on-error -output-directory $scriptDir $texFile
  } finally {
    Pop-Location
  }
}

function Invoke-Tectonic {
  Push-Location $repoRoot
  try {
    & tectonic --outdir $scriptDir $texFile
  } finally {
    Pop-Location
  }
}

if (Get-Command tectonic -ErrorAction SilentlyContinue) {
  Invoke-Tectonic
} elseif (Get-Command lualatex -ErrorAction SilentlyContinue) {
  Invoke-Latex "lualatex"
} elseif (Get-Command xelatex -ErrorAction SilentlyContinue) {
  Invoke-Latex "xelatex"
} elseif (Get-Command pdflatex -ErrorAction SilentlyContinue) {
  Invoke-Latex "pdflatex"
} else {
  throw "No LaTeX engine found. Install Tectonic, MiKTeX, or TeX Live, then run this script again."
}
