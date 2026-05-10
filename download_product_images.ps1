# ============================================================
# Bae's Kankan – Real Product Image Downloader
# Run this script once from the root of your website folder.
# It will replace all placeholder images in img/products/
# with real brand product photos fetched from official CDNs.
# ============================================================

$ErrorActionPreference = "Stop"

# Resolve img/products relative to this script's location
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$imgDir    = Join-Path $scriptDir "img\products"

# Create folder if it doesn't exist yet
if (-not (Test-Path $imgDir)) {
    New-Item -ItemType Directory -Path $imgDir | Out-Null
    Write-Host "  Created folder: $imgDir" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Bae's Kankan – Downloading Product Images" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── Image map: filename => source URL ────────────────────────
$images = [ordered]@{

    # UGG Classic Boots
    "ugg.png"          = "https://dms.deckers.com/ugg/image/upload/t_product-xlarge-wp/v1770062263/1016223-CHE_1.png"

    # New Balance 574 Sneakers
    "new-balance.png"  = "https://nb.scene7.com/is/image/NB/ml574evg_nb_02_i?`$pdpflexf2`$&wid=600&hei=600"

    # Coach Signature Handbag / Coach Leather products
    "coach.png"        = "https://coach.scene7.com/is/image/Coach/ch857_b4bk_a0?`$desktopProduct`$"

    # Burberry Crossbody Bag / Burberry products
    "burberry.png"     = "https://assets.burberry.com/is/image/Burberryltd/170DBE43-9B00-40B1-A766-F1482E6F263D"

    # Daniel Wellington Classic Watch
    "daniel.png"       = "https://us.danielwellington.com/cdn/shop/products/a632d38044c6a937e9dc450156c4f86e26bd4664.png?v=1679995182"

    # Celine Mini Luggage Bag / Celine products
    "celine.png"       = "https://image.celine.com/59c24ab04023b67b/original/4S194CPLB-38NO_1_SUM21_W.jpg"

    # Chanel Ballet Flats / Channel No. 5 / Channel products
    "channel.png"      = "https://www.chanel.com/images///f_auto,q_auto:good,dpr_1.1/w_1024/-9543237304350.jpg"

    # Polo Ralph Lauren products
    "polo-ralph.png"   = "https://dtcralphlauren.scene7.com/is/image/PoloGSI/s7-1396676_alternate10?`$rl_4x5_zoom`$"

    # Aldo Strappy Heels
    "aldo.png"         = "https://m.media-amazon.com/images/I/71d0bRgTy2L._AC_SR768,1024_.jpg"

    # Fetch Gold Hoop Earrings / Fetch jewelry products
    "fetch.png"        = "https://fetch-mkt.com/cdn/shop/files/bba46a7ae4864968b7a606be8fab4265_600x.progressive_905a0d62-e891-4249-a635-e136727347e1.jpg"
}

# ── Download loop ─────────────────────────────────────────────
$success = 0
$failed  = 0

foreach ($entry in $images.GetEnumerator()) {
    $filename   = $entry.Key
    $url        = $entry.Value
    $destPath   = Join-Path $imgDir $filename
    $brand      = $filename -replace "\.png$", ""

    Write-Host "  Downloading  $filename  ($brand)..." -NoNewline

    try {
        $wr = Invoke-WebRequest `
            -Uri $url `
            -OutFile $destPath `
            -UseBasicParsing `
            -TimeoutSec 30 `
            -Headers @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }

        $size = [math]::Round((Get-Item $destPath).Length / 1KB, 1)
        Write-Host "  OK  ($size KB)" -ForegroundColor Green
        $success++
    }
    catch {
        Write-Host "  FAILED" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor DarkRed
        $failed++
    }
}

# ── Summary ───────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Done!  $success downloaded,  $failed failed." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if ($failed -gt 0) {
    Write-Host "  Tip: For any failed images, open the URL in your browser" -ForegroundColor Yellow
    Write-Host "  and save the image manually to img\products\<filename>.png" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "  Images saved to: $imgDir" -ForegroundColor Gray
Write-Host ""
