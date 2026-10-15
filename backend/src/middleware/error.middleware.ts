import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Prisma error codes we handle explicitly
const PRISMA_KNOWN: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: 'A record with these details already exists.' },
  P2025: { status: 404, message: 'The requested record was not found.' },
  P2003: { status: 400, message: 'Related record not found.' },
  P2016: { status: 400, message: 'Query interpretation error.' },
};

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  logger.error('Unhandled error', {
    message: err?.message,
    stack:   err?.stack,
    url:     req.url,
    method:  req.method,
  });

  // Prisma known errors
  if (err?.code && PRISMA_KNOWN[err.code]) {
    const { status, message } = PRISMA_KNOWN[err.code];
    return res.status(status).json({ success: false, message });
  }

  // JWT errors
  if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please sign in again.' });
  }

  // Zod validation errors
  if (err?.name === 'ZodError') {
    const messages = err.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return res.status(400).json({ success: false, message: messages ?? 'Validation failed.' });
  }

  // Explicit status on error object (e.g. from CORS)
  const status  = typeof err?.status === 'number' ? err.status : 500;
  const message = env.isProd && status === 500
    ? 'Something went wrong. Please try again.'
    : (err?.message ?? 'Internal server error');

  res.status(status).json({ success: false, message });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
}
