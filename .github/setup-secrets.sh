#!/bin/bash

# Setup GitHub Secrets for Skillence CI/CD
# This script guides you through setting up GitHub Secrets
# Requires: GitHub CLI (gh) installed - https://cli.github.com

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Skillence CI/CD: GitHub Secrets Setup Helper        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found!"
    echo ""
    echo "Install GitHub CLI from: https://cli.github.com"
    echo "Then run: gh auth login"
    echo ""
    exit 1
fi

echo "✅ GitHub CLI found"
echo ""

# Get repository info
echo "Getting your repository information..."
REPO_INFO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
echo "Repository: $REPO_INFO"
echo ""

# Helper function to set secret
set_github_secret() {
    local secret_name=$1
    local description=$2
    local url=$3
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Setting: $secret_name"
    echo "Description: $description"
    
    if [ -n "$url" ]; then
        echo "Get from: $url"
        if command -v open &> /dev/null; then
            open "$url"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "$url"
        fi
    fi
    
    read -p "Enter the secret value (or press Ctrl+C to skip): " value
    
    if [ -n "$value" ]; then
        echo "$value" | gh secret set "$secret_name"
        echo "✅ Secret '$secret_name' set successfully!"
    else
        echo "⊘ Skipped"
    fi
    echo ""
}

# Required Render Secrets
echo ""
echo "═══════════════════════════════════════════════════════"
echo "RENDER BACKEND SECRETS (Required)"
echo "═══════════════════════════════════════════════════════"
echo ""

set_github_secret \
    "RENDER_DEPLOY_HOOK" \
    "Webhook URL from Render to trigger deployments" \
    "https://dashboard.render.com"

set_github_secret \
    "RENDER_BACKEND_URL" \
    "Your Render backend domain (e.g., skillence-backend.onrender.com)" \
    "https://dashboard.render.com"

# Required Vercel Secrets
echo ""
echo "═══════════════════════════════════════════════════════"
echo "VERCEL FRONTEND SECRETS (Required)"
echo "═══════════════════════════════════════════════════════"
echo ""

set_github_secret \
    "VERCEL_TOKEN" \
    "Personal access token from Vercel account settings" \
    "https://vercel.com/account/tokens"

set_github_secret \
    "VERCEL_ORG_ID" \
    "Your Vercel organization/account ID" \
    "https://vercel.com/account/settings"

set_github_secret \
    "VERCEL_PROJECT_ID" \
    "Your Vercel project ID" \
    "https://vercel.com"

set_github_secret \
    "VERCEL_DEPLOYMENT_URL" \
    "Your Vercel frontend domain (e.g., skillence-frontend.vercel.app)" \
    "https://vercel.com"

# Verify secrets
echo ""
echo "═══════════════════════════════════════════════════════"
echo "VERIFYING SECRETS"
echo "═══════════════════════════════════════════════════════"
echo ""

echo "Listing all secrets..."
gh secret list

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   ✅ Setup Complete!                                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Make a small code change"
echo "2. Commit and push to 'main' branch"
echo "3. Go to GitHub Actions tab to watch deployments"
echo "4. Check Render and Vercel dashboards for live updates"
echo ""
echo "See .github/SECRETS_SETUP.md for manual setup instructions"
echo ""
