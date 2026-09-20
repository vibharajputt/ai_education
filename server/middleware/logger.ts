import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export interface StructuredLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  requestId: string;
  method?: string;
  path?: string;
  status?: number;
  durationMs?: number;
  message?: string;
  error?: string;
}

export const logBuffer: StructuredLog[] = [];

export function logStructured(log: StructuredLog): void {
  logBuffer.push(log);
  // Sanitize: ensure no raw text, body, or PII can ever be printed
  const safeLog = {
    timestamp: log.timestamp,
    level: log.level,
    requestId: log.requestId,
    method: log.method,
    path: log.path,
    status: log.status,
    durationMs: log.durationMs,
    message: log.message,
    error: log.error,
  };
  console.log(JSON.stringify(safeLog));
}

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);

  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logStructured({
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 400 ? 'warn' : 'info',
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs,
    });
  });

  next();
}
