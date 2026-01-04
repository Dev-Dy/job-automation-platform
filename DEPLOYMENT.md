# Deployment Guide

Complete guide for deploying the Job Automation Platform to production.

## Prerequisites

- GitHub account
- Railway/Render/Fly.io account (for backend)
- Vercel account (for frontend)
- Domain name (optional)

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Install Railway CLI** (optional):
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Deploy via Railway Dashboard**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set root directory to `backend`
   - Railway will auto-detect Node.js

3. **Configure Environment Variables**:
   - Go to your project → Variables
   - Add the following:
     ```
     NODE_ENV=production
     PORT=3001
     DATABASE_PATH=/app/data/jobs.db
     DISCOVERY_INTERVAL_MINUTES=60
     TELEGRAM_BOT_TOKEN=your_token (optional)
     TELEGRAM_CHAT_ID=your_chat_id (optional)
     ```

4. **Add Persistent Volume**:
   - Go to your service → Volumes
   - Add volume: `/app/data` (for SQLite database)

5. **Get Your Backend URL**:
   - Railway provides: `https://your-app.railway.app`
   - Copy this URL for frontend configuration

### Option 2: Render

1. **Create New Web Service**:
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**:
   - **Name**: `job-automation-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **Add Environment Variables**:
   - Go to Environment tab
   - Add variables from `backend/.env.production`

4. **Add Persistent Disk**:
   - Go to Disks tab
   - Add disk: `/opt/render/project/src/backend/data` (1GB)

5. **Get Your Backend URL**:
   - Render provides: `https://your-app.onrender.com`

### Option 3: Fly.io

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   flyctl auth login
   ```

2. **Initialize Fly App**:
   ```bash
   cd backend
   flyctl launch
   ```

3. **Deploy**:
   ```bash
   flyctl deploy
   ```

4. **Create Volume**:
   ```bash
   flyctl volumes create jobs_db --size 1
   ```

5. **Set Secrets**:
   ```bash
   flyctl secrets set NODE_ENV=production
   flyctl secrets set DATABASE_PATH=/app/data/jobs.db
   flyctl secrets set DISCOVERY_INTERVAL_MINUTES=60
   ```

## Frontend Deployment (Vercel)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Set root directory to `frontend`

3. **Configure Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
     ```
   - Replace with your actual backend URL

4. **Deploy**:
   - Vercel will auto-deploy on every push to main
   - Or click "Deploy" in dashboard

5. **Get Your Frontend URL**:
   - Vercel provides: `https://your-app.vercel.app`

## Post-Deployment

### 1. Update Backend CORS

Update your backend environment variable:
```
CORS_ORIGIN=https://your-frontend.vercel.app
```

### 2. Run Database Migration

If needed, SSH into your backend and run:
```bash
npm run migrate
```

### 3. Test Deployment

1. **Backend Health Check**:
   ```bash
   curl https://your-backend-url.railway.app/health
   ```

2. **Frontend**:
   - Visit your Vercel URL
   - Check browser console for errors
   - Test discovery functionality

### 4. Set Up Custom Domain (Optional)

**Backend (Railway)**:
- Go to Settings → Domains
- Add your custom domain
- Update DNS records

**Frontend (Vercel)**:
- Go to Project Settings → Domains
- Add your custom domain
- Vercel handles DNS automatically

## Environment Variables Summary

### Backend
```env
NODE_ENV=production
PORT=3001
DATABASE_PATH=/app/data/jobs.db
DISCOVERY_INTERVAL_MINUTES=60
TELEGRAM_BOT_TOKEN= (optional)
TELEGRAM_CHAT_ID= (optional)
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

## Monitoring

### Railway
- Built-in metrics and logs
- View logs: Railway dashboard → Deployments → Logs

### Render
- Built-in logs and metrics
- View logs: Dashboard → Service → Logs

### Vercel
- Built-in analytics
- View logs: Dashboard → Project → Functions → Logs

## Troubleshooting

### Backend Issues

**Database not persisting**:
- Ensure persistent volume is mounted correctly
- Check `DATABASE_PATH` environment variable

**CORS errors**:
- Verify `CORS_ORIGIN` matches your frontend URL exactly
- Check backend logs for CORS errors

**Discovery not running**:
- Check cron schedule in logs
- Verify `DISCOVERY_INTERVAL_MINUTES` is set
- Check for errors in discovery logs

### Frontend Issues

**API connection errors**:
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for CORS errors
- Verify backend is running and accessible

**Build errors**:
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation

## Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] Database migration run
- [ ] CORS configured correctly
- [ ] Health check endpoint working
- [ ] Discovery job running
- [ ] Frontend can connect to backend
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring set up
- [ ] Error logging configured

## Cost Estimates

### Railway
- Free tier: $5/month credit
- Hobby: $5/month
- Pro: $20/month

### Render
- Free tier: Limited hours
- Starter: $7/month
- Standard: $25/month

### Fly.io
- Free tier: 3 shared VMs
- Paid: ~$2-5/month per VM

### Vercel
- Free tier: Unlimited for personal projects
- Pro: $20/month

**Total Estimated Cost**: $0-30/month depending on usage

## Security Notes

1. **Never commit `.env` files**
2. **Use environment variables for all secrets**
3. **Enable HTTPS** (automatic on all platforms)
4. **Set proper CORS origins**
5. **Regularly update dependencies**
6. **Monitor logs for suspicious activity**

## Support

For deployment issues:
- Check platform documentation
- Review application logs
- Test locally first
- Verify environment variables
