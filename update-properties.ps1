# PowerShell script to automatically update property image lists in script.js
# Run this script whenever you add new images to the properties folders

Write-Host "🔍 Scanning properties directories..." -ForegroundColor Cyan

# Define the properties base directory
$PropertiesDir = "media\properties"
$ScriptFile = "script.js"

# Check if directories exist
if (-not (Test-Path $PropertiesDir)) {
    Write-Host "❌ Error: $PropertiesDir directory not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $ScriptFile)) {
    Write-Host "❌ Error: $ScriptFile not found!" -ForegroundColor Red
    exit 1
}

# Function to get images from a directory
function Get-Images {
    param($Directory)
    
    if (Test-Path $Directory) {
        $images = Get-ChildItem -Path $Directory -File | Where-Object { 
            $_.Extension -match '\.(jpg|jpeg|png|webp)$' 
        } | Sort-Object Name | ForEach-Object { 
            "`"$($_.Name)`"" 
        }
        return $images -join ",`n                        "
    }
    return ""
}

# Function to generate property data
function Generate-PropertyData {
    param($PropertyFolder)
    
    $PropertyPath = Join-Path $PropertiesDir $PropertyFolder
    Write-Host "📁 Processing: $PropertyFolder" -ForegroundColor Yellow
    
    # Get images from original and remodel folders
    $OriginalPath = Join-Path $PropertyPath "original"
    $OriginalImages = Get-Images $OriginalPath
    
    # Check for both "remodel" and "Remodel" folders
    $RemodelPath = Join-Path $PropertyPath "remodel"
    $RemodelPathCap = Join-Path $PropertyPath "Remodel"
    $RemodelFolder = "remodel"
    $RemodelImages = ""
    
    if (Test-Path $RemodelPath) {
        $RemodelImages = Get-Images $RemodelPath
        $RemodelFolder = "remodel"
    } elseif (Test-Path $RemodelPathCap) {
        $RemodelImages = Get-Images $RemodelPathCap
        $RemodelFolder = "Remodel"
    } else {
        Write-Host "⚠️  No remodel folder found for $PropertyFolder" -ForegroundColor Yellow
    }
    
    # Count images
    $OriginalCount = if ($OriginalImages) { ($OriginalImages -split ',').Count } else { 0 }
    $RemodelCount = if ($RemodelImages) { ($RemodelImages -split ',').Count } else { 0 }
    
    Write-Host "   📸 Original images: $OriginalCount" -ForegroundColor Green
    Write-Host "   📸 Remodel images: $RemodelCount" -ForegroundColor Green
    
    # Generate property object
    return @"
            {
                name: "$PropertyFolder",
                address: "Address for $PropertyFolder",
                folder: "$PropertyFolder",
                improvements: [
                    "Complete Kitchen Renovation",
                    "Bathroom Modernization",
                    "Flooring Upgrades",
                    "Fresh Paint Throughout",
                    "Updated Fixtures & Hardware",
                    "Landscaping Improvements"
                ],
                images: {
                    original: [
                        $OriginalImages
                    ],
                    remodel: [
                        $RemodelImages
                    ]
                },
                folders: {
                    original: "original",
                    remodel: "$RemodelFolder"
                }
            }
"@

# Create backup of original script.js
Copy-Item $ScriptFile "$ScriptFile.backup"
Write-Host "💾 Created backup: $ScriptFile.backup" -ForegroundColor Green

# Generate new properties data
Write-Host "🔄 Generating new properties data..." -ForegroundColor Cyan

$PropertiesData = @()
$PropertyCount = 0

# Loop through all property directories
Get-ChildItem -Path $PropertiesDir -Directory | ForEach-Object {
    $PropertyName = $_.Name
    $PropertyPath = $_.FullName
    
    # Check if it has original or remodel folders
    $HasOriginal = Test-Path (Join-Path $PropertyPath "original")
    $HasRemodel = (Test-Path (Join-Path $PropertyPath "remodel")) -or (Test-Path (Join-Path $PropertyPath "Remodel"))
    
    if ($HasOriginal -or $HasRemodel) {
        $PropertyData = Generate-PropertyData $PropertyName
        $PropertiesData += $PropertyData
        $PropertyCount++
    }
}

# Join all properties with commas
$AllPropertiesData = $PropertiesData -join ",`n"

# Create the new properties section
$NewPropertiesSection = @"
        // PROPERTIES_DATA_START - Do not modify this line
        this.properties = [
$AllPropertiesData
        ];
        // PROPERTIES_DATA_END - Do not modify this line
"@

# Read the original file
$Content = Get-Content $ScriptFile -Raw

# Replace the properties section
$Pattern = '(?s)(\s*// PROPERTIES_DATA_START[^\n]*\n).*?(\s*// PROPERTIES_DATA_END[^\n]*\n)'
$NewContent = $Content -replace $Pattern, "`n$NewPropertiesSection`n        "

# Write the updated content
Set-Content -Path $ScriptFile -Value $NewContent -NoNewline

Write-Host "✅ Updated $ScriptFile with $PropertyCount properties" -ForegroundColor Green
Write-Host "🎉 Done! Refresh your browser to see the changes." -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Note: You may want to manually update property names and addresses in script.js" -ForegroundColor Yellow
Write-Host "🔧 To customize a property, edit the generated data between the PROPERTIES_DATA_START and PROPERTIES_DATA_END markers" -ForegroundColor Yellow