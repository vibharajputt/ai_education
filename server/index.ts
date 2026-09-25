import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Load Environment Variables (.env)
// ---------------------------------------------------------------------------
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { assistRateLimiter } from './middleware/rateLimiter.js';
import { assistRouter } from './routes/assist.js';
import { resumeRouter } from './routes/analyzeResume.js';
import { geminiExplainRouter } from './routes/geminiExplain.js';

export const app = express();

// ---------------------------------------------------------------------------
// CORS Configuration
// ---------------------------------------------------------------------------
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS policy'));
    },
    credentials: true,
  })
);

// ---------------------------------------------------------------------------
// Body Parsing & Logging Middleware
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ---------------------------------------------------------------------------
// AI Routes
// ---------------------------------------------------------------------------
app.use(assistRateLimiter);
app.use(assistRouter);
app.use(resumeRouter);
app.use(geminiExplainRouter);

// ---------------------------------------------------------------------------
// Static Frontend Serving (if dist exists, e.g. single-container/Render deploy)
// ---------------------------------------------------------------------------
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// ---------------------------------------------------------------------------
// 404 & Global Error Handling
// ---------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested route does not exist. Only /api/assist, /api/analyze-resume, and /api/gemini-explain are permitted.',
    },
  });
});

app.use(errorHandler);

// ---------------------------------------------------------------------------
// Server Initialization
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Minimal Express AI Service listening on http://localhost:${PORT}`);
  });
}
