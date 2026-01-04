# Deployment Checklist

Use this checklist to ensure a smooth deployment.

## Pre-Deployment

### Code Quality
- [x] TypeScript compiles without errors
- [x] All dependencies installed
- [x] Environment variables documented
- [x] Database migrations ready
- [x] Error handling implemented
- [x] CORS configured
- [x] Health check endpoint working

### Backend
- [x] Build script works (`npm run build`)
- [x] Start script works (`npm start`)
- [x] Database path configured for production
- [x] Logging configured
- [x] Graceful shutdown implemented
- [x] Environment variables template created

### Frontend
- [x] Build script works (`npm run build`)
- [x] API URL configurable via environment variable
- [x] Production optimizations enabled
- [x] Error boundaries implemented
- [x] Loading states implemented

## Deployment Steps

### 1. Backend Deployment

#### Railway
- [ ] Create Railway account
- [ ] Create new project
- [ ] Connect GitHub repository
- [ ] Set root directory: `backend`
- [ ] Add environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001`
  - [ ] `DATABASE_PATH=/app/data/jobs.db`
  - [ ] `DISCOVERY_INTERVAL_MINUTES=60`
  - [ ] `CORS_ORIGIN=https://your-frontend.vercel.app`
  - [ ] `TELEGRAM_BOT_TOKEN` (optional)
  - [ ] `TELEGRAM_CHAT_ID` (optional)
- [ ] Add persistent volume: `/app/data`
- [ ] Deploy
- [ ] Test health endpoint
- [ ] Copy backend URL

#### Render
- [ ] Create Render account
- [ ] Create new web service
- [ ] Connect GitHub repository
- [ ] Set root directory: `backend`
- [ ] Set build command: `npm install && npm run build`
- [ ] Set start command: `npm start`
- [ ] Add environment variables (same as Railway)
- [ ] Add persistent disk: `/opt/render/project/src/backend/data`
- [ ] Deploy
- [ ] Test health endpoint
- [ ] Copy backend URL

#### Fly.io
- [ ] Install Fly CLI
- [ ] Create Fly account
- [ ] Run `flyctl launch` in backend directory
- [ ] Create volume: `flyctl volumes create jobs_db`
- [ ] Set secrets (environment variables)
- [ ] Deploy: `flyctl deploy`
- [ ] Test health endpoint
- [ ] Copy backend URL

### 2. Frontend Deployment

#### Vercel
- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Set root directory: `frontend`
- [ ] Add environment variable:
  - [ ] `NEXT_PUBLIC_API_URL=https://your-backend-url`
- [ ] Deploy
- [ ] Test frontend URL
- [ ] Verify API connection

### 3. Post-Deployment

- [ ] Update backend `CORS_ORIGIN` with frontend URL
- [ ] Run database migration (if needed)
- [ ] Test discovery endpoint
- [ ] Test job listing
- [ ] Test filtering and search
- [ ] Test job application flow
- [ ] Verify analytics display
- [ ] Check error handling
- [ ] Monitor logs for errors

### 4. Monitoring Setup

- [ ] Set up error tracking (optional)
- [ ] Configure uptime monitoring (optional)
- [ ] Set up log aggregation (optional)
- [ ] Configure alerts (optional)

### 5. Custom Domain (Optional)

- [ ] Configure backend domain
- [ ] Configure frontend domain
- [ ] Update DNS records
- [ ] Update CORS_ORIGIN
- [ ] Update NEXT_PUBLIC_API_URL
- [ ] Test with custom domain

## Testing Checklist

### Backend API Tests
- [ ] `GET /health` returns 200
- [ ] `GET /api/opportunities` returns opportunities
- [ ] `POST /api/discover` triggers discovery
- [ ] `POST /api/opportunities/:id/apply` updates status
- [ ] `GET /api/opportunities/analytics/overview` returns data
- [ ] CORS headers present

### Frontend Tests
- [ ] Dashboard loads
- [ ] Overview cards display
- [ ] Analytics charts render
- [ ] Search works
- [ ] Filters work
- [ ] Pagination works
- [ ] Job detail modal opens
- [ ] Apply functionality works
- [ ] Toast notifications appear
- [ ] Error states display correctly

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check environment variables
- Verify database path is writable
- Check logs for errors
- Verify PORT is set correctly

**Frontend can't connect to backend:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration
- Verify backend is running
- Check browser console for errors

**Database not persisting:**
- Verify persistent volume is mounted
- Check `DATABASE_PATH` environment variable
- Verify volume has write permissions

**Discovery not running:**
- Check `DISCOVERY_INTERVAL_MINUTES` is set
- Check cron logs
- Verify sources are accessible
- Check for rate limiting

## Rollback Plan

If deployment fails:
1. Keep previous deployment running
2. Fix issues locally
3. Test thoroughly
4. Redeploy

## Success Criteria

Deployment is successful when:
- ✅ Backend health check returns 200
- ✅ Frontend loads without errors
- ✅ API calls succeed
- ✅ Discovery runs automatically
- ✅ Jobs can be viewed and applied
- ✅ Analytics display correctly
- ✅ No console errors
- ✅ All features work as expected

## Next Steps After Deployment

1. Monitor for 24-48 hours
2. Check logs regularly
3. Gather user feedback
4. Optimize based on usage
5. Scale if needed
6. Add monitoring/alerting
7. Set up backups (if using database)
