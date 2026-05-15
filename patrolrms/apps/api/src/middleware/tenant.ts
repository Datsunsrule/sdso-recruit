import { Request, Response, NextFunction } from 'express';
import { db } from '../db/client';

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.agency_slug) {
    res.status(401).json({ error: 'No agency context' });
    return;
  }
  try {
    await db.raw('SET search_path = ??', [req.user.agency_slug]);
    next();
  } catch {
    res.status(500).json({ error: 'Failed to set tenant context' });
  }
}
