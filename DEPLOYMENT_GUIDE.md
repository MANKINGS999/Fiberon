# Deployment Guide - Fiberon

## Problem: Blank Page After Deployment

The blank page issue occurs because:
1. ❌ Missing `VITE_CONVEX_URL` environment variable
2. ❌ Convex backend not deployed to production
3. ❌ Build configuration not set up correctly

---

## Solution: Step-by-Step Deployment

### Step 1: Deploy Convex Backend to Production

The Convex backend MUST be deployed before the frontend can work.

```bash
cd Fiberon
pnpm install
npx convex deploy --prod
```

This will:
- Deploy your Convex functions to production
- Output your production deployment URL (e.g., `https://abc-xyz-123.convex.cloud`)
- Save it to `convex.json`

**Copy this deployment URL - you'll need it next!**

---

### Step 2: Push Code to GitHub

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

---

### Step 3: Deploy to Vercel (Recommended)

#### Option A: Via Vercel Dashboard
1. Go to https://vercel.com/new
2. Import the Fiberon repository
3. Under "Environment Variables", add:
   - **Name:** `VITE_CONVEX_URL`
   - **Value:** Paste your Convex deployment URL from Step 1
4. Click Deploy

#### Option B: Via CLI
```bash
npm i -g vercel
vercel --prod --env VITE_CONVEX_URL=https://your-deployment-url.convex.cloud
```

---

### Step 4: Deploy to Netlify (Alternative)

#### Option A: Via Netlify Dashboard
1. Go to https://app.netlify.com/sites
2. Click "Add new site" → "Import an existing project"
3. Select your GitHub repo
4. In "Build settings":
   - Build command: `pnpm build`
   - Publish directory: `dist`
5. Under "Environment variables":
   - Key: `VITE_CONVEX_URL`
   - Value: Paste your Convex deployment URL
6. Deploy

#### Option B: Via CLI
```bash
npm i -g netlify-cli
netlify deploy --prod --build
```
When prompted for environment variables, add `VITE_CONVEX_URL`.

---

## Troubleshooting

### Still seeing a blank page?

**Check 1: Verify Environment Variables**
- Vercel: Project Settings → Environment Variables → Verify `VITE_CONVEX_URL` is set
- Netlify: Site settings → Build & Deploy → Environment → Check `VITE_CONVEX_URL`

**Check 2: Verify Build Output**
- Vercel: Deployments tab → View build logs
- Netlify: Deploys tab → View deploy log
- Look for errors about `VITE_CONVEX_URL` being undefined

**Check 3: Test Locally**
```bash
pnpm install
VITE_CONVEX_URL=https://your-url.convex.cloud pnpm build
pnpm preview
```

**Check 4: Verify Convex is Running**
- Go to https://dashboard.convex.dev
- Select your project
- Check "Deployments" tab - should show recent production deployment

### Build fails with missing dependencies?
```bash
pnpm install
pnpm build
```

### Port already in use?
```bash
pnpm preview -- --port 4174
```

---

## Important Notes

⚠️ **Critical Steps in Order:**
1. Deploy Convex backend first (`npx convex deploy --prod`)
2. Copy the deployment URL
3. Set environment variables on Vercel/Netlify
4. Deploy frontend

⚠️ **Don't skip this:**
- The `VITE_CONVEX_URL` must be set BEFORE deployment
- It's a build-time variable (not runtime), so redeploy after changing it

⚠️ **TypeScript Compilation:**
If you see TypeScript errors:
```bash
pnpm build  # runs "tsc -b && vite build"
```

---

## After Deployment

1. Test the live site
2. Try logging in via `/auth`
3. Check browser console (F12) for errors
4. Verify API calls are reaching Convex dashboard

---

## Quick Reference

| Platform | Docs | Env Vars |
|----------|------|----------|
| Vercel | https://vercel.com/docs/projects/environment-variables | Project Settings → Env |
| Netlify | https://docs.netlify.com/configure-builds/environment-variables | Build & Deploy → Env |
| Convex | https://docs.convex.dev/cli | `npx convex deploy --prod` |

---

**Need help?**
- Check deployment logs first
- Verify `VITE_CONVEX_URL` is not empty
- Make sure Convex backend is actually deployed
