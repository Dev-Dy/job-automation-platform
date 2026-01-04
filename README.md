# Job Opportunity Automation Platform

A complete, production-ready MVP of a job opportunity automation platform that automatically discovers, evaluates, and helps you apply to relevant job opportunities. Features rule-based scoring (no LLM required), advanced filtering, and a professional dashboard.

## ✨ Features

- **Automatic Job Discovery**: Scans public sources (Web3 job boards, GitHub issues, crypto job sites) for new opportunities
- **Rule-Based Scoring**: Intelligent keyword-based scoring (0-100) - **no LLM required**
- **Smart Deduplication**: Prevents duplicate entries using content hashing
- **Template-Based Proposals**: Generates professional proposals using templates
- **Status Management**: Mark jobs as viewed, applied, replied, old, not useful, or archived
- **Advanced Search & Filtering**: Real-time search, category filters, source filters, score filters
- **Analytics Dashboard**: Professional Next.js dashboard with charts, metrics, and insights
- **Job Categories**: Automatically categorizes jobs (MERN, Backend, Crypto, Rust, Mixed)
- **Telegram Notifications**: Get notified about high-scoring opportunities (optional)
- **Automated Scheduling**: Runs discovery on a configurable interval
- **Manual/Email Import**: Import jobs manually or via email alerts
- **Pagination**: Efficient handling of large job lists
- **Job Detail Modals**: View full job details in a beautiful modal

## 🛠️ Tech Stack

**Backend:**
- Node.js 20+ + TypeScript
- Express
- SQLite (better-sqlite3)
- Rule-based scoring engine (no LLM required)
- node-cron for scheduling
- Axios + Cheerio for web scraping

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts for analytics
- Toast notifications
- Responsive design

**Notifications:**
- Telegram Bot API (optional)

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** and npm
- Telegram Bot Token (optional, for notifications)

### Backend Setup

```bash
cd backend
npm install

# Copy environment file
cp env.example .env

# Edit .env (minimal configuration needed):
# - DATABASE_PATH=./data/jobs.db
# - DISCOVERY_INTERVAL_MINUTES=60
# - TELEGRAM_BOT_TOKEN (optional)
# - TELEGRAM_CHAT_ID (optional)
```

**Environment Variables:**
```env
PORT=3001
DATABASE_PATH=./data/jobs.db
DISCOVERY_INTERVAL_MINUTES=60
TELEGRAM_BOT_TOKEN= (optional)
TELEGRAM_CHAT_ID= (optional)
CORS_ORIGIN=http://localhost:3000
```

**Run Backend:**
```bash
npm run dev    # Development with hot reload
npm run build  # Build for production
npm start      # Run production build
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env.local (optional, defaults to localhost:3001)
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

**Run Frontend:**
```bash
npm run dev    # Development server (http://localhost:3000)
npm run build  # Production build
npm start      # Production server
```

## 📖 Usage

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Trigger Discovery**: 
   - Click "🔍 Discover Jobs" button in dashboard, or
   - Visit `http://localhost:3001/api/discover` (POST), or
   - Wait for scheduled discovery (default: every 60 minutes)
4. **View Dashboard**: Open `http://localhost:3000`

### Manual Discovery

```bash
curl -X POST http://localhost:3001/api/discover
```

### Import Jobs Manually

```bash
curl -X POST http://localhost:3001/api/opportunities/import \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Node.js Developer",
    "description": "Looking for Node.js, React, MongoDB developer...",
    "url": "https://example.com/job/123",
    "source": "Upwork (manual)",
    "sourceType": "manual"
  }'
```

## 🔌 API Endpoints

### Opportunities
- `GET /api/opportunities` - List all opportunities (supports query params: `minScore`, `source`, `status`, `excludeArchived`)
- `GET /api/opportunities/:id` - Get single opportunity
- `POST /api/opportunities/:id/apply` - Update status (applied, old, not_useful, archived, etc.)
- `POST /api/opportunities/import` - Manual job import
- `POST /api/opportunities/import/email` - Email alert ingestion

### Analytics
- `GET /api/opportunities/analytics/overview` - Dashboard overview stats
- `GET /api/opportunities/analytics/funnel` - Application funnel data
- `GET /api/opportunities/analytics/sources` - Source performance
- `GET /api/opportunities/analytics/categories` - Skill category breakdown

### Discovery
- `POST /api/discover` - Trigger manual discovery

### Health
- `GET /health` - Health check endpoint

## 📊 Job Sources

Currently implemented:
- **Web3.careers**: Public Web3 job board
- **CryptoJobsList.com**: Crypto job listings
- **CryptoJobs.com**: Crypto job board
- **GitHub Issues**: Searches for "hiring" labeled issues in relevant repos

To add more sources, create a new class in `backend/src/sources/` extending `JobSource`.

## 🎯 Job Categories & Scoring

The platform automatically categorizes and scores jobs based on:

- **MERN Stack**: MongoDB, Express, React, Node.js (Weight: 15)
- **Backend**: Node.js, TypeScript, APIs (Weight: 12-14)
- **Crypto/Web3**: Blockchain, DeFi, Smart Contracts (Weight: 18)
- **Rust**: Rust programming (Weight: 16)
- **Solana**: Solana ecosystem (Weight: 20 - highest)

Jobs are scored 0-100, with a minimum threshold of 40 to be stored.

## 📱 Status Management

Jobs can be marked with the following statuses:
- **New**: Just discovered
- **Viewed**: You've looked at it
- **Applied**: You've applied
- **Replied**: You received a reply
- **Rejected**: Application was rejected
- **Old**: Job is outdated
- **Not Useful**: Doesn't match your needs
- **Archived**: Keep for reference

Jobs marked as `old`, `not_useful`, or `archived` cannot be marked as applied (prevents accidental applications).

## 🔔 Telegram Notifications

1. Create a bot via [@BotFather](https://t.me/botfather)
2. Get your chat ID: Send a message to your bot, then visit `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Add to `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=your_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```

You'll receive notifications for opportunities with score ≥ 70.

## 🆓 FREE Deployment

Deploy **100% FREE** using Render (backend) and Vercel (frontend).

### Backend (Render - FREE)

1. Go to [render.com](https://render.com) → Sign up FREE
2. New Web Service → Connect GitHub
3. Configure:
   - **Root Directory**: `backend`
   - **Node Version**: `20` ⚠️ **IMPORTANT**
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **FREE**
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_PATH=/opt/render/project/src/backend/data/jobs.db
   DISCOVERY_INTERVAL_MINUTES=60
   ```
5. Add Disk: `/opt/render/project/src/backend/data` (1GB FREE)
6. Deploy → Get URL: `https://your-app.onrender.com`

### Frontend (Vercel - FREE)

1. Go to [vercel.com](https://vercel.com) → Sign up FREE
2. Import GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js (auto-detected)
4. Add Environment Variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend.onrender.com` (your Render backend URL)
   - **Environment**: Production
5. Deploy → Get URL: `https://your-app.vercel.app`

### Post-Deployment

1. Update backend `CORS_ORIGIN` with your Vercel frontend URL
2. Test the deployment
3. ✅ Done! **Total cost: $0/month**

**Note**: Render free tier spins down after 15 min inactivity (wakes on request). Vercel is always fast.

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── db/           # Database schema and connection
│   │   ├── sources/      # Job source connectors
│   │   ├── services/     # Discovery, scoring, proposal, Telegram
│   │   ├── routes/       # Express API routes
│   │   ├── utils/        # Utilities (hashing, etc.)
│   │   └── index.ts      # Server entry point
│   ├── data/             # SQLite database (gitignored)
│   ├── Dockerfile        # Docker configuration
│   ├── render.yaml       # Render deployment config
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── components/   # React components (Table, Charts, Modals, etc.)
│   │   ├── hooks/       # Custom hooks (useToast)
│   │   ├── lib/          # API client
│   │   ├── page.tsx      # Main dashboard
│   │   └── layout.tsx
│   ├── vercel.json       # Vercel deployment config
│   └── package.json
└── README.md
```

## ⚙️ Customization

### Profile Matching

Edit `backend/src/services/scoring.ts` to customize skill keywords and weights:

```typescript
const SKILL_KEYWORDS = {
  mern: {
    keywords: ['mern', 'mongo', ...],
    weight: 15,
    category: 'mern' as const,
  },
  // Add your custom skills here
};
```

### Discovery Interval

Set `DISCOVERY_INTERVAL_MINUTES` in `.env` (default: 60 minutes).

### Score Threshold

Opportunities with score < 40 are filtered out. Change in `backend/src/services/discovery.ts`:

```typescript
if (evaluation.score >= 40) { // Change threshold here
```

### Proposal Templates

Edit `backend/src/services/proposal.ts` to customize proposal generation.

## 🔒 Legal & Safety

- ✅ Only scrapes public pages
- ✅ Respects rate limits
- ✅ No authentication bypassing
- ✅ Polite request intervals
- ✅ Uses public APIs where available
- ✅ No CAPTCHA bypassing
- ✅ Complies with robots.txt

## 🐛 Troubleshooting

**No jobs discovered:**
- Check source websites are accessible
- Verify selectors in source connectors match current site structure
- Check network requests in logs
- Some sources may require updated selectors

**Database errors:**
- Ensure `data/` directory is writable
- Check `DATABASE_PATH` in `.env`
- Run migration: `npm run migrate`

**Deployment errors:**
- **Node.js version**: Ensure Node.js 20 is set in deployment platform
- **Build errors**: Check logs for missing dependencies
- **CORS errors**: Verify `CORS_ORIGIN` matches frontend URL exactly

**Frontend can't connect:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is running and accessible
- Verify CORS is configured correctly

## 📝 Database Migration

If you have an existing database, run the migration to add new columns:

```bash
cd backend
npm run migrate
```

This adds:
- `source_type` (automated/email/manual)
- `matched_skills` (JSON array)
- `category` (mern/backend/crypto/rust/mixed/other)

## 🎨 UI Features

- **Search**: Real-time search across titles, descriptions, and skills
- **Filters**: Category, source, status, minimum score
- **Sorting**: By date, score, or title
- **Pagination**: 20 items per page
- **Job Details**: Click any job to view full details in modal
- **Status Actions**: Quick buttons to mark jobs (Old, Not Useful, Archive)
- **Analytics**: Charts for funnel, sources, and categories
- **Toast Notifications**: Professional notifications instead of alerts

## 📄 License

MIT

## 🤝 Contributing

This is an MVP. To extend:
1. Add new sources in `backend/src/sources/`
2. Customize scoring in `backend/src/services/scoring.ts`
3. Enhance UI in `frontend/app/`
4. Add new job categories or skills

---

Built with ❤️ for job seekers who want to automate their search.

**Total Cost**: $0/month (FREE deployment)  
**Node.js**: 20+ required  
**No LLM Required**: Rule-based scoring works out of the box
