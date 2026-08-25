import type { NextFunction, Request, Response } from 'express';

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const status = err.status ?? err.statusCode ?? 500;
  const message =
    status >= 500 ? 'Internal server error' : err.message || 'Request failed';

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
}
