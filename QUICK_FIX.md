# 🚀 QUICK FIX - Blank Page on Vercel/Netlify

## The Problem
Your website shows a blank page because:
- ❌ `VITE_CONVEX_URL` environment variable is NOT SET
- ❌ Convex backend hasn't been deployed to production
- ❌ Frontend can't connect to backend

## The Solution (3 Steps)

### STEP 1️⃣: Deploy Convex Backend
```bash
cd Fiberon
pnpm install
npx convex deploy --prod
```
📋 **Copy the deployment URL** that appears (looks like: `https://abc-xyz-123.convex.cloud`)

### STEP 2️⃣: Add Environment Variable to Vercel/Netlify

**VERCEL:**
1. Go to https://vercel.com/dashboard
2. Select your Fiberon project
3. Settings → Environment Variables
4. Add: `VITE_CONVEX_URL` = `https://your-convex-url.convex.cloud`
5. Redeploy (Deployments → Redeploy)

**NETLIFY:**
1. Go to https://app.netlify.com
2. Select your Fiberon site
3. Site Settings → Build & Deploy → Environment
4. Add: `VITE_CONVEX_URL` = `https://your-convex-url.convex.cloud`
5. Click "Trigger Deploy"

### STEP 3️⃣: Test
- Visit your live site
- You should see the app (not blank!)
- Try logging in at `/auth`

---

## ✅ Already Done For You
I've already:
- ✅ Created `vercel.json` (Vercel config)
- ✅ Created `netlify.toml` (Netlify config)
- ✅ Created `.env.example` (reference)
- ✅ Updated `src/main.tsx` (better error messages)
- ✅ Created `DEPLOYMENT_GUIDE.md` (full guide)
- ✅ Created `deploy.sh` (setup script)
- ✅ Pushed all changes to GitHub

## 🔍 Verify It Works
After deploying:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Should NOT see error about `VITE_CONVEX_URL`
4. Should see your app rendered

## ⚠️ If Still Blank
1. Check build logs on Vercel/Netlify
2. Verify `VITE_CONVEX_URL` is NOT empty
3. Verify Convex deployment succeeded
4. Try: `VITE_CONVEX_URL=https://your-url.convex.cloud pnpm build`

---

**Still stuck? See DEPLOYMENT_GUIDE.md for detailed troubleshooting**
