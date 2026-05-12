# GitHub Actions CI/CD Setup

This directory contains automated deployment workflows for Skillence. Every push to the `main` branch triggers automatic tests and deployments to Render (backend) and Vercel (frontend).

## Workflows Overview

### test-and-lint.yml
**Triggers:** Every push to `main`/`develop` and all pull requests
- Backend: Python linting (flake8) + pytest tests
- Frontend: ESLint + Vite build verification
- Catches bugs before deployment

### deploy-backend.yml
**Triggers:** Push to `main` with changes in `backend/` or `render.yaml`
- Calls Render deploy hook to trigger backend deployment
- Waits up to 5 minutes for backend to be live

### deploy-frontend.yml
**Triggers:** Push to `main` with changes in `frontend/`
- Uses a Vercel deploy action to build and deploy frontend
- Verifies deployment succeeded

## Quick Setup

### 1. Add GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

**For Render (Backend):**
- `RENDER_DEPLOY_HOOK` - Deployment hook URL from Render
- `RENDER_BACKEND_URL` - Backend domain (e.g., `skillence-backend.onrender.com`)

**For Vercel (Frontend):**
- `VERCEL_TOKEN` - Personal access token from Vercel
- `VERCEL_ORG_ID` - Organization/team ID
- `VERCEL_PROJECT_ID` - Project ID
- `VERCEL_DEPLOYMENT_URL` - Frontend domain (e.g., `skillence-frontend.vercel.app`)

### 2. Test It

- Push a small change to the `main` branch
- Go to **Actions** tab in GitHub
- Watch workflows execute
- Check Render and Vercel dashboards for live deployments

### 3. Monitor Deployments

- GitHub: **Actions** tab shows all workflow runs
- Render: Dashboard shows deployment status
- Vercel: Dashboard shows deployment history

## Troubleshooting

**Workflows not triggering?**
- Verify you're pushing to `main` branch (not `develop`)
- Check that files changed in `backend/` or `frontend/`
- Ensure GitHub Secrets are set with exact names

**Backend deployment fails?**
- Check Render dashboard logs
- Verify `MONGODB_URI` and other env vars are set in Render
- Try manual deployment from Render dashboard

**Frontend build fails?**
- Check GitHub Actions logs
- Verify `pnpm-lock.yaml` is committed
- Run `pnpm install` and push again

**Tests fail but deployment succeeds?**
- Workflows are set to `continue-on-error: true`
- Tests are advisory but don't block deployments
- Fix tests locally before pushing to avoid future failures

## For More Details

See [DEPLOYMENT_GUIDE.md](../../docs/DEPLOYMENT_GUIDE.md) for complete setup instructions.
