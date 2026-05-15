import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/client';
import { requireRole } from '../middleware/auth';

export const adminRouter = Router();
adminRouter.use(requireRole('admin'));

adminRouter.get('/users', async (_req: Request, res: Response) => {
  const users = await db('users')
    .select('id', 'badge_number', 'full_name', 'rank', 'role', 'active', 'last_login', 'default_location')
    .orderBy('full_name');
  res.json(users);
});

adminRouter.post('/users', async (req: Request, res: Response) => {
  const { badge_number, pin, full_name, rank, role, default_location } = req.body;
  const pin_hash = await bcrypt.hash(String(pin), 12);

  const [user] = await db('users')
    .insert({ badge_number, pin_hash, full_name, rank, role, default_location })
    .returning(['id', 'badge_number', 'full_name', 'rank', 'role', 'active']);

  res.status(201).json(user);
});

adminRouter.put('/users/:id', async (req: Request, res: Response) => {
  const { full_name, rank, role, active, default_location, pin } = req.body;
  const updates: Record<string, unknown> = { full_name, rank, role, active, default_location };

  if (pin) updates.pin_hash = await bcrypt.hash(String(pin), 12);

  const [updated] = await db('users').where({ id: req.params.id }).update(updates).returning('*');
  if (!updated) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(updated);
});

adminRouter.post('/users/:id/unlock', async (req: Request, res: Response) => {
  await db('users').where({ id: req.params.id }).update({ failed_attempts: 0 });
  res.json({ success: true });
});

adminRouter.get('/locations', async (_req: Request, res: Response) => {
  const locations = await db('locations').where({ active: true }).orderBy('label');
  res.json(locations);
});

adminRouter.post('/locations', async (req: Request, res: Response) => {
  const { code, label, type } = req.body;
  const [loc] = await db('locations').insert({ code, label, type }).returning('*');
  res.status(201).json(loc);
});

adminRouter.put('/locations/:id', async (req: Request, res: Response) => {
  const [updated] = await db('locations').where({ id: req.params.id }).update(req.body).returning('*');
  res.json(updated);
});

adminRouter.get('/stats', async (_req: Request, res: Response) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [reportsByType, casesByStatus, recentActivity] = await Promise.all([
    db('reports').where('created_at', '>=', thirtyDaysAgo).groupBy('report_type').select('report_type').count('* as count'),
    db('cases').groupBy('status').select('status').count('* as count'),
    db('audit_log').where('occurred_at', '>=', thirtyDaysAgo).orderBy('occurred_at', 'desc').limit(50),
  ]);

  res.json({ reports_by_type: reportsByType, cases_by_status: casesByStatus, recent_activity: recentActivity });
});
