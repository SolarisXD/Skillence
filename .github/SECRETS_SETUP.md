# GitHub Secrets Setup Guide for Skillence CI/CD

This script helps you gather the required information to set up GitHub Secrets for automatic deployment.

## Prerequisites

Before running this script, you should have:
- ✅ GitHub account with this repository
- ✅ Render account with backend deployed
- ✅ Vercel account with frontend deployed
- ✅ Access to both Render and Vercel dashboards

## Required Secrets Checklist

Use this checklist to gather and set up each secret:

### Render Backend Secrets

**[ ] 1. RENDER_DEPLOY_HOOK**
1. Go to: https://dashboard.render.com
2. Click your `skillence-backend` service
3. Go to **Settings** tab
4. Scroll to **Deploy Hook**
5. Copy the webhook URL
6. GitHub: **Settings → Secrets → New Secret**
   - Name: `RENDER_DEPLOY_HOOK`
   - Value: (paste webhook URL)

**[ ] 2. RENDER_BACKEND_URL**
1. In Render dashboard, your service shows a URL like: `https://skillence-backend.onrender.com`
2. Copy only the domain part (without https://): `skillence-backend.onrender.com`
3. GitHub: **Settings → Secrets → New Secret**
   - Name: `RENDER_BACKEND_URL`
   - Value: (paste domain)

### Vercel Frontend Secrets

**[ ] 3. VERCEL_TOKEN**
1. Go to: https://vercel.com/account/tokens
2. Click **Create**
   - Token name: `GitHub CI/CD`
   - Expiration: 90 days (or longer)
   - Scope: Full account access (or your team)
3. Copy the token (shown only once!)
4. GitHub: **Settings → Secrets → New Secret**
   - Name: `VERCEL_TOKEN`
   - Value: (paste token)

**[ ] 4. VERCEL_ORG_ID**
1. Go to: https://vercel.com/account/settings
2. Look for **ID** under account info
3. Copy it
4. GitHub: **Settings → Secrets → New Secret**
   - Name: `VERCEL_ORG_ID`
   - Value: (paste ID)

**[ ] 5. VERCEL_PROJECT_ID**
1. Go to your Vercel project dashboard
2. Click **Settings** (top right)
3. Look for **Project ID**
4. Copy it
5. GitHub: **Settings → Secrets → New Secret**
   - Name: `VERCEL_PROJECT_ID`
   - Value: (paste ID)

**[ ] 6. VERCEL_DEPLOYMENT_URL**
1. In Vercel dashboard, find your deployment URL
   - Example: `https://skillence-frontend.vercel.app`
2. Copy only the domain (without https://): `skillence-frontend.vercel.app`
3. GitHub: **Settings → Secrets → New Secret**
   - Name: `VERCEL_DEPLOYMENT_URL`
   - Value: (paste domain)

## After Setup

1. Go to GitHub: **Actions** tab
2. Make a small change to your code
3. Push to `main` branch
4. Watch workflows execute automatically
5. Check Render and Vercel for live deployments

## Verification

All secrets are set correctly if:
- ✅ GitHub Actions workflows run without "missing secret" errors
- ✅ Backend auto-deploys to Render after `backend/` changes
- ✅ Frontend auto-deploys to Vercel after `frontend/` changes

## Troubleshooting

**Workflows don't run?**
- Ensure you're pushing to `main` branch (not `develop`)
- Check GitHub Actions tab for error messages
- Verify all 6 required secrets are set

**Deployment fails?**
- Check the failed workflow log in GitHub Actions
- Verify environment variables in Render and Vercel dashboards
- Try manual deployment from their respective dashboards first

**Can't find secret values?**
- Render: Dashboard → Your service → Settings
- Vercel: vercel.com/account/settings and project settings
- GitHub: repo → Settings → Secrets and variables → Actions

## For More Details

See [DEPLOYMENT_GUIDE.md](../docs/DEPLOYMENT_GUIDE.md) for complete information.
