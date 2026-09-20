import { Request, Response, NextFunction } from 'express';
import { logStructured } from './logger.js';

export interface TypedErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  const requestId = req.id || 'unknown';
  const statusCode = err.status || err.statusCode || 500;

  logStructured({
    timestamp: new Date().toISOString(),
    level: 'error',
    requestId,
    method: req.method,
    path: req.path,
    status: statusCode,
    error: err.message || String(err),
  });

  const errorCode = err.code || (statusCode === 429 ? 'RATE_LIMIT_EXCEEDED' : 'INTERNAL_SERVER_ERROR');
  const userMessage =
    err.publicMessage ||
    err.message ||
    'The AI assistant is temporarily unavailable. Please try again.';

  return res.status(statusCode).json({
    error: {
      code: errorCode,
      message: userMessage,
    },
  });
}
