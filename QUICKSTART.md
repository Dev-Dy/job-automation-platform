# Quick Start Guide

Get the job automation platform running in 5 minutes.

## 1. Backend Setup (2 minutes)

```bash
cd backend
npm install
cp env.example .env
```

Edit `.env` and add at minimum:
```env
OPENAI_API_KEY=sk-your-key-here
```

Or for Ollama:
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

Start backend:
```bash
npm run dev
```

Backend runs on `http://localhost:3001`

## 2. Frontend Setup (2 minutes)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## 3. First Discovery (1 minute)

1. Open `http://localhost:3000`
2. Click "🔍 Discover Jobs" button
3. Wait 30-60 seconds for discovery to complete
4. View opportunities in the dashboard

## Optional: Telegram Notifications

1. Create bot via [@BotFather](https://t.me/botfather)
2. Get chat ID: Send message to bot, visit `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Add to backend `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=your_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```

## Troubleshooting

**"Cannot find module" errors:**
- Run `npm install` in both backend and frontend directories

**No jobs discovered:**
- Check browser console and backend logs
- Verify source websites are accessible
- Try manual discovery: `curl -X POST http://localhost:3001/api/discover`

**LLM errors:**
- Verify API key is correct (OpenAI)
- For Ollama: Ensure `ollama serve` is running

**Database errors:**
- Ensure `backend/data/` directory exists and is writable

## Next Steps

- Customize your profile in `backend/src/llm/client.ts`
- Add more job sources in `backend/src/sources/`
- Deploy to production (see README.md)
