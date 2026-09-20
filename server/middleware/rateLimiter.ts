import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const ipStore = new Map<string, RateLimitStore>();
const resumeUploadStore = new Map<string, RateLimitStore>();

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
  store?: Map<string, RateLimitStore>;
}) {
  const store = options.store || new Map<string, RateLimitStore>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    const record = store.get(ip);
    if (!record || now > record.resetTime) {
      store.set(ip, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      return next();
    }

    if (record.count >= options.max) {
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: options.message,
        },
      });
    }

    record.count += 1;
    next();
  };
}

// Standard Assist Endpoint Rate Limiter (e.g. max 30 requests per minute per IP)
export const assistRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many assistant requests. Please wait a moment before trying again.',
  store: ipStore,
});

// Hard Rate Limiter for Resume Analysis (e.g. max 5 uploads per 15 minutes per IP)
export const resumeRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Resume upload limit reached. Please wait 15 minutes before uploading another document.',
  store: resumeUploadStore,
});
