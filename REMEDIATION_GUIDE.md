# Security Remediation Guide

## Issue Summary
The following files with exposed test credentials and real user data are currently tracked in git:
- `backend/output/dummy_placement_seed_summary_20260314_142559.json`
- `backend/output/placement_dataset_snapshot_20260314_142547.json`
- `backend/output/placement_dataset_snapshot_20260314_142605.json`

## Step 1: Prevent Future Commits ✅ (Already Done)
The `.gitignore` has been updated to prevent these files from being committed in the future:
```
backend/output/
```

## Step 2: Remove from Git History (Only if Repository is Public)

### Option A: Using git-filter-branch (Built-in, but slower)
```bash
# Navigate to project root
cd CareerAI-main

# Remove directory from all commits
git filter-branch --tree-filter 'rm -rf backend/output' HEAD

# Force push to remote (WARNING: This rewrites history!)
git push origin --force-all

# Clean up reflog
git reflog expire --expire=now --all
git gc --prune=now
```

### Option B: Using BFG Repo-Cleaner (Faster for large repos)
```bash
# Download BFG from https://rtyley.github.io/bfg-repo-cleaner/
# Or install via package manager

# Remove the entire directory
bfg --delete-folders backend/output

# Clean up git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push all branches
git push origin --force-all
```

### Option C: Manual Cleanup (Selective)
If you want to keep other output files but remove just the sensitive ones:

```bash
git filter-branch --tree-filter 'rm -f backend/output/dummy_placement_seed_summary_20260314_142559.json' HEAD
git filter-branch --tree-filter 'rm -f backend/output/placement_dataset_snapshot_20260314_142547.json' HEAD
git filter-branch --tree-filter 'rm -f backend/output/placement_dataset_snapshot_20260314_142605.json' HEAD

git push origin --force-all
```

## Step 3: Local Cleanup
```bash
# After pushing, clean up local repository
git reflog expire --expire=now --all
git gc --prune=now
```

## Step 4: Verification
```bash
# Verify files are removed from git history
git log --all --full-history --diff-filter=D -- backend/output/

# Should show no results or only commits that delete the files
```

## Step 5: Communicate to Team
If this is a team project, notify all developers that they need to:
1. Fetch the rewritten repository: `git fetch --all`
2. Reset their local branches: `git reset --hard origin/main` (or appropriate branch)
3. Clean their git cache: `git clean -fd`

## Important Security Notes

⚠️ **Before making this repository public:**
1. Review `SECURITY_FINDINGS.md` - already generated
2. Ensure `.env` file is NEVER committed (it's in `.gitignore` ✅)
3. Verify all API keys are environment-based (they are ✅)
4. Remove historical commits with credentials if making repo public
5. Consider using a secrets management service (AWS Secrets Manager, Azure Key Vault, etc.)

## Files Already Secured
- ✅ `.env` - Not tracked in git
- ✅ API keys - Using environment variables only
- ✅ Database credentials - Environment-based
- ✅ JWT secret - Environment-based
- ✅ `.gitignore` - Updated to prevent future leaks

## Environment Variables Template
A `.env.example` file has been created with all required environment variables documented. Share this with team members for local setup.

## CI/CD Recommendations
1. Add pre-commit hooks to check for secrets:
   ```bash
   npm install husky --save-dev
   npx husky install
   npx husky add .husky/pre-commit "npm run lint-secrets"
   ```

2. Use tools like:
   - `detect-secrets` (Python)
   - `git-secrets` (General)
   - `talisman` (Language-agnostic)
   - GitHub's built-in secret scanning

3. Add to deployment pipeline to scan for hardcoded secrets

## Resources
- [GitHub: Removing sensitive data from repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [Git filter-branch Documentation](https://git-scm.com/docs/git-filter-branch)
- [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

