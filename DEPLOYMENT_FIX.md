# Deployment Fix - Node.js Version

## Issue
The deployment was failing with `ReferenceError: File is not defined` because Node.js 18 doesn't support the `File` API used by some dependencies.

## Solution
Updated to Node.js 20 which includes the `File` API and other modern features.

## Changes Made

1. **package.json**: Updated engines to require Node.js >= 20.0.0
2. **Dockerfile**: Changed from `node:18-alpine` to `node:20-alpine`
3. **render.yaml**: Added `nodeVersion: 20`
4. **.nvmrc**: Updated to 20

## For Render Deployment

If you're deploying to Render, make sure to:

1. **Set Node Version in Render Dashboard**:
   - Go to your service → Settings
   - Under "Build & Deploy"
   - Set "Node Version" to `20` (or leave blank to use .nvmrc)

2. **Or use render.yaml**:
   - The `render.yaml` file now includes `nodeVersion: 20`
   - Render will automatically use this when deploying

## Redeploy

After these changes, redeploy your service. The build should now succeed.

## Verify Node Version

You can verify the Node version in your service logs:
```bash
node --version
# Should show: v20.x.x
```
