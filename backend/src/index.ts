import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { discoveryService } from './services/discovery';
import opportunitiesRouter from './routes/opportunities';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/opportunities', opportunitiesRouter);

// Manual discovery trigger
app.post('/api/discover', async (req, res) => {
  try {
    const opportunities = await discoveryService.discoverAndScore();
    res.json({ success: true, count: opportunities.length, opportunities });
  } catch (error) {
    console.error('Discovery error:', error);
    res.status(500).json({ error: 'Discovery failed' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 API: http://localhost:${PORT}/api/opportunities`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Schedule automatic discovery
const intervalMinutes = parseInt(process.env.DISCOVERY_INTERVAL_MINUTES || '60');
const cronExpression = `*/${intervalMinutes} * * * *`;

console.log(`⏰ Scheduling discovery every ${intervalMinutes} minutes`);

cron.schedule(cronExpression, async () => {
  console.log(`\n🔍 Starting scheduled discovery at ${new Date().toISOString()}`);
  try {
    await discoveryService.discoverAndScore();
    console.log('✅ Discovery completed');
  } catch (error) {
    console.error('❌ Discovery failed:', error);
  }
});

// Run initial discovery on startup (optional, can be removed)
// discoveryService.discoverAndScore().catch(console.error);
