# Change to server directory
Set-Location "E:\projects\other_projects\zaymazone\server"

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
} else {
    Write-Host "Dependencies already installed"
}

# Start the server
Write-Host "Starting server..."
npm run dev