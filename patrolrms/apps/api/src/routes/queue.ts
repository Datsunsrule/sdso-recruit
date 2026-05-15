import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { requireRole } from '../middleware/auth';

export const queueRouter = Router();

queueRouter.get('/', requireRole('supervisor', 'admin'), async (req: Request, res: Response) => {
  const { location, status = 'Pending' } = req.query;

  let query = db('reports')
    .select(
      'reports.*',
      'users.full_name as officer_name',
      'users.badge_number',
      'cases.case_number',
      'cases.crime_type',
      'cases.location_id'
    )
    .join('users', 'reports.submitted_by', 'users.id')
    .join('cases', 'reports.case_id', 'cases.id')
    .where('reports.status', String(status))
    .orderBy('reports.submitted_at', 'asc');

  if (location) query = query.where('cases.location_id', String(location));

  const reports = await query;
  res.json(reports);
});

queueRouter.get('/stats', requireRole('supervisor', 'admin'), async (req: Request, res: Response) => {
  const { location } = req.query;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let base = db('reports').join('cases', 'reports.case_id', 'cases.id');
  if (location) base = base.where('cases.location_id', String(location));

  const [pending, approvedToday, rejectedToday] = await Promise.all([
    base.clone().where('reports.status', 'Pending').count('* as count').first(),
    base.clone().where('reports.status', 'Approved').where('reports.reviewed_at', '>=', today).count('* as count').first(),
    base.clone().where('reports.status', 'Rejected').where('reports.reviewed_at', '>=', today).count('* as count').first(),
  ]);

  res.json({
    pending: Number(pending?.count || 0),
    approved_today: Number(approvedToday?.count || 0),
    rejected_today: Number(rejectedToday?.count || 0),
  });
});
