# Job Opportunity Automation Platform

A complete, production-ready MVP of a job opportunity automation platform that automatically discovers, evaluates, and helps you apply to relevant job opportunities. Features rule-based scoring (no LLM required), advanced filtering, and a professional dashboard.

## Features

- **Automatic Job Discovery**: Scans public sources (Web3 job boards, GitHub issues) for new opportunities
- **Rule-Based Scoring**: Intelligent keyword-based scoring (0-100) - no LLM required
- **Smart Deduplication**: Prevents duplicate entries using content hashing
- **Template-Based Proposals**: Generates professional proposals using templates
- **Status Tracking**: Track viewed, applied, replied, and rejected opportunities
- **Analytics Dashboard**: Beautiful Next.js dashboard with charts and metrics
- **Telegram Notifications**: Get notified about high-scoring opportunities
- **Automated Scheduling**: Runs discovery on a configurable interval

## Tech Stack

**Backend:**
- Node.js + TypeScript
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

**Notifications:**
- Telegram Bot API

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (or Ollama running locally)
- Telegram Bot Token (optional, for notifications)

### Backend Setup

```bash
cd backend
npm install

# Copy environment file
cp env.example .env

# Edit .env and add your API keys:
# - OPENAI_API_KEY (or set OLLAMA_BASE_URL and OLLAMA_MODEL)
# - TELEGRAM_BOT_TOKEN (optional)
# - TELEGRAM_CHAT_ID (optional)
```

**Environment Variables:**
```env
PORT=3001
DATABASE_PATH=./data/jobs.db
OPENAI_API_KEY=sk-...
# OR for Ollama:
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=llama2
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
DISCOVERY_INTERVAL_MINUTES=60
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

## Usage

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Trigger Discovery**: 
   - Visit `http://localhost:3001/api/discover` (POST) or
   - Wait for scheduled discovery (default: every 60 minutes)
4. **View Dashboard**: Open `http://localhost:3000`

### Manual Discovery

```bash
curl -X POST http://localhost:3001/api/discover
```

### API Endpoints

- `GET /api/opportunities` - List all opportunities
- `GET /api/opportunities/:id` - Get single opportunity
- `POST /api/opportunities/:id/apply` - Mark as applied (generates proposal)
- `GET /api/opportunities/analytics/overview` - Dashboard overview stats
- `GET /api/opportunities/analytics/funnel` - Application funnel data
- `GET /api/opportunities/analytics/sources` - Source performance
- `POST /api/discover` - Trigger manual discovery

## Job Sources

Currently implemented:
- **Web3.careers**: Public Web3 job board
- **GitHub Issues**: Searches for "hiring" labeled issues in relevant repos

To add more sources, create a new class in `backend/src/sources/` extending `JobSource`.

## LLM Configuration

### Using OpenAI

Set `OPENAI_API_KEY` in `.env`. Uses GPT-3.5-turbo by default.

### Using Ollama (Local)

1. Install Ollama: https://ollama.ai
2. Pull a model: `ollama pull llama2`
3. Set in `.env`:
   ```env
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama2
   ```

## Telegram Notifications

1. Create a bot via [@BotFather](https://t.me/botfather)
2. Get your chat ID: Send a message to your bot, then visit `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Add to `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=your_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```

You'll receive notifications for opportunities with score ≥ 70.

## Deployment

### Backend (Railway / Render / Fly.io)

1. **Railway:**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Render:**
   - Connect GitHub repo
   - Set build command: `cd backend && npm install && npm run build`
   - Set start command: `cd backend && npm start`
   - Add environment variables

3. **Fly.io:**
   ```bash
   flyctl launch
   flyctl deploy
   ```

**Important**: Set all environment variables in your hosting platform.

### Frontend (Vercel)

1. **Vercel CLI:**
   ```bash
   npm i -g vercel
   cd frontend
   vercel
   ```

2. **Vercel Dashboard:**
   - Import GitHub repo
   - Set root directory to `frontend`
   - Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.com`

### Database

SQLite database is stored in `backend/data/jobs.db`. For production:
- Use a persistent volume (Railway/Render provide this)
- Or migrate to PostgreSQL (recommended for production)

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── db/           # Database schema and connection
│   │   ├── sources/      # Job source connectors
│   │   ├── services/     # Discovery, Telegram services
│   │   ├── llm/          # LLM client (OpenAI/Ollama)
│   │   ├── routes/       # Express API routes
│   │   ├── utils/        # Utilities (hashing, etc.)
│   │   └── index.ts      # Server entry point
│   ├── data/             # SQLite database (gitignored)
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── components/   # React components
│   │   ├── lib/          # API client
│   │   ├── page.tsx      # Main dashboard
│   │   └── layout.tsx
│   └── package.json
└── README.md
```

## Customization

### Profile Matching

Edit `backend/src/llm/client.ts` to change the target profile:

```typescript
const PROFILE = `Your custom profile here...`;
```

### Discovery Interval

Set `DISCOVERY_INTERVAL_MINUTES` in `.env` (default: 60 minutes).

### Score Threshold

Opportunities with score < 40 are filtered out. Change in `backend/src/services/discovery.ts`:

```typescript
if (evaluation.score >= 40) { // Change threshold here
```

## Legal & Safety

- ✅ Only scrapes public pages
- ✅ Respects rate limits
- ✅ No authentication bypassing
- ✅ Polite request intervals
- ✅ Uses public APIs where available

## Troubleshooting

**No jobs discovered:**
- Check source websites are accessible
- Verify selectors in source connectors match current site structure
- Check network requests in logs

**LLM errors:**
- Verify API key is set correctly
- Check rate limits (OpenAI)
- For Ollama, ensure service is running

**Database errors:**
- Ensure `data/` directory is writable
- Check `DATABASE_PATH` in `.env`

## License

MIT

## Contributing

This is an MVP. To extend:
1. Add new sources in `backend/src/sources/`
2. Improve LLM prompts in `backend/src/llm/client.ts`
3. Enhance UI in `frontend/app/`

---

Built with ❤️ for job seekers who want to automate their search.
