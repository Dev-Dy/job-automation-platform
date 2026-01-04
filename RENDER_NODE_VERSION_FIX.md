# Fix: Render Still Using Node.js 18

## Problem
Render is still using Node.js 18.20.8 even after updating configuration files.

## Solution: Set Node Version in Render Dashboard

The `render.yaml` file might not be automatically used. You need to set it manually in the Render dashboard.

### Steps to Fix:

1. **Go to Render Dashboard**:
   - Open your Render service
   - Click on your service name

2. **Go to Settings**:
   - Click "Settings" tab
   - Scroll to "Build & Deploy" section

3. **Set Node Version**:
   - Find "Node Version" field
   - Enter: `20` (or `20.x.x` for specific version)
   - Click "Save Changes"

4. **Redeploy**:
   - Go to "Manual Deploy" tab
   - Click "Clear build cache & deploy"
   - Or push a new commit to trigger redeploy

## Alternative: Use Environment Variable

You can also set it via environment variable:

1. Go to "Environment" tab
2. Add new variable:
   - Key: `NODE_VERSION`
   - Value: `20`
3. Save and redeploy

## Verify

After redeploy, check the logs. You should see:
```
Node.js v20.x.x
```

Instead of:
```
Node.js v18.20.8
```

## Why This Happens

Render might not automatically read `render.yaml` for existing services, or the `nodeVersion` field might need to be set in the dashboard for it to take effect.
