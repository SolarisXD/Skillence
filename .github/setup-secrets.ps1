# Setup GitHub Secrets for Skillence CI/CD (Windows)
# This script guides you through setting up GitHub Secrets
# Requires: GitHub CLI (gh) installed - https://cli.github.com

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Skillence CI/CD: GitHub Secrets Setup Helper        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if GitHub CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install GitHub CLI from: https://cli.github.com"
    Write-Host "Then run: gh auth login"
    Write-Host ""
    exit 1
}

Write-Host "✅ GitHub CLI found" -ForegroundColor Green
Write-Host ""

# Get repository info
Write-Host "Getting your repository information..." -ForegroundColor Yellow
$repoInfo = gh repo view --json nameWithOwner -q '.nameWithOwner'
Write-Host "Repository: $repoInfo" -ForegroundColor Green
Write-Host ""

# Helper function to set secret
function Set-GitHubSecret {
    param(
        [string]$SecretName,
        [string]$Description,
        [string]$Url
    )
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "Setting: $SecretName" -ForegroundColor Yellow
    Write-Host "Description: $Description" -ForegroundColor Gray
    
    if ($Url) {
        Write-Host "Get from: $Url" -ForegroundColor Blue
        Start-Process $Url
        Write-Host "Opening in browser..." -ForegroundColor Gray
    }
    
    $value = Read-Host "Enter the secret value (or press Ctrl+C to skip)"
    
    if ($value) {
        gh secret set $SecretName --body $value
        Write-Host "✅ Secret '$SecretName' set successfully!" -ForegroundColor Green
    } else {
        Write-Host "⊘ Skipped" -ForegroundColor Gray
    }
    Write-Host ""
}

# Required Render Secrets
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "RENDER BACKEND SECRETS (Required)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Set-GitHubSecret `
    -SecretName "RENDER_DEPLOY_HOOK" `
    -Description "Webhook URL from Render to trigger deployments" `
    -Url "https://dashboard.render.com"

Set-GitHubSecret `
    -SecretName "RENDER_BACKEND_URL" `
    -Description "Your Render backend domain (e.g., skillence-backend.onrender.com)" `
    -Url "https://dashboard.render.com"

# Required Vercel Secrets
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "VERCEL FRONTEND SECRETS (Required)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Set-GitHubSecret `
    -SecretName "VERCEL_TOKEN" `
    -Description "Personal access token from Vercel account settings" `
    -Url "https://vercel.com/account/tokens"

Set-GitHubSecret `
    -SecretName "VERCEL_ORG_ID" `
    -Description "Your Vercel organization/account ID" `
    -Url "https://vercel.com/account/settings"

Set-GitHubSecret `
    -SecretName "VERCEL_PROJECT_ID" `
    -Description "Your Vercel project ID" `
    -Url "https://vercel.com"

Set-GitHubSecret `
    -SecretName "VERCEL_DEPLOYMENT_URL" `
    -Description "Your Vercel frontend domain (e.g., skillence-frontend.vercel.app)" `
    -Url "https://vercel.com"

# Verify secrets
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "VERIFYING SECRETS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Listing all secrets..." -ForegroundColor Yellow
gh secret list

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ✅ Setup Complete!                                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Make a small code change" -ForegroundColor Green
Write-Host "2. Commit and push to 'main' branch" -ForegroundColor Green
Write-Host "3. Go to GitHub Actions tab to watch deployments" -ForegroundColor Green
Write-Host "4. Check Render and Vercel dashboards for live updates" -ForegroundColor Green
Write-Host ""
Write-Host "See .github/SECRETS_SETUP.md for manual setup instructions" -ForegroundColor Gray
Write-Host ""
