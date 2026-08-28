import { NextFunction, Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  // Zod validation errors
  if (err?.name === 'ZodError') {
    return res.status(422).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request parameters.',
      details: err.issues,
    });
  }

  // JSON parse errors
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'INVALID_JSON',
      message: 'Request body is not valid JSON.',
    });
  }

  // Body too large
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'PAYLOAD_TOO_LARGE',
      message: 'Request body exceeds the size limit.',
    });
  }

  // Never leak internal error details to clients
  console.error('[MCP Error]', err);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
  });
}
