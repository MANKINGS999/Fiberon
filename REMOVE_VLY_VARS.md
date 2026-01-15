# CRITICAL: Remove Vly Environment Variables

## Problem
Your deployment is still showing Vly error dialogs because **VITE_VLY_APP_ID** environment variables are set on Vercel/Netlify.

## Solution

### For Vercel:
1. Go to https://vercel.com/dashboard
2. Select your **Fiberon** project
3. Go to **Settings** → **Environment Variables**
4. **DELETE** these variables:
   - `VITE_VLY_APP_ID`
   - `VITE_VLY_MONITORING_URL`
   - Any other `VITE_VLY_*` variables
5. Keep only: `VITE_CONVEX_URL` = `https://benevolent-hare-437.convex.cloud`
6. Click **Save**
7. Go to **Deployments** → **Redeploy**

### For Netlify:
1. Go to https://app.netlify.com
2. Select your **Fiberon** site
3. Go to **Site Settings** → **Build & Deploy** → **Environment**
4. **DELETE** these variables:
   - `VITE_VLY_APP_ID`
   - `VITE_VLY_MONITORING_URL`
   - Any other `VITE_VLY_*` variables
5. Keep only: `VITE_CONVEX_URL` = `https://benevolent-hare-437.convex.cloud`
6. Click **Save**
7. Go to **Deploys** → **Trigger deploy**

## Why This Happens
The Vly instrumentation code checks for `VITE_VLY_APP_ID` environment variable. If it exists, it tries to connect to Vly and shows error dialogs. Since you don't have a Vly project, it fails and shows errors.

## After Removing Variables
- The error dialog will disappear
- Your app will work normally
- Only Convex backend will be used
- No Vly integration

## Test Locally
To test if variables are the issue:
```bash
# Remove .env.local if it has VITE_VLY_* variables
npm run build
npm run preview
```

If it works locally without the variables, it will work on Vercel/Netlify too!
