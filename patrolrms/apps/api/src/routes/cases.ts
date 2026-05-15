import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { requireRole } from '../middleware/auth';
import { auditLog } from '../services/audit';
import { generateCaseNumber } from '../services/caseNumber';

export const casesRouter = Router();

casesRouter.get('/', async (req: Request, res: Response) => {
  const { location, status, search, page = '1', limit = '25' } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = db('cases')
    .select('cases.*', 'users.full_name as officer_name', 'locations.label as location_label')
    .leftJoin('users', 'cases.assigned_officer_id', 'users.id')
    .leftJoin('locations', 'cases.location_id', 'locations.id')
    .where('cases.deleted_at', null)
    .orderBy('cases.created_at', 'desc')
    .limit(Number(limit))
    .offset(offset);

  if (location) query = query.where('cases.location_id', String(location));
  if (status) query = query.where('cases.status', String(status));
  if (search) {
    query = query.where((b) =>
      b
        .whereLike('cases.case_number', `%${search}%`)
        .orWhereLike('cases.crime_type', `%${search}%`)
    );
  }

  const [cases, [{ count }]] = await Promise.all([
    query,
    db('cases').count('* as count').where('deleted_at', null),
  ]);

  res.json({ cases, total: Number(count) });
});

casesRouter.post('/', async (req: Request, res: Response) => {
  const { crime_type, location_id, incident_date, incident_time, priority } = req.body;

  const location = await db('locations').where({ id: location_id }).first();
  if (!location) {
    res.status(400).json({ error: 'Invalid location' });
    return;
  }

  const case_number = await generateCaseNumber(location.code);

  const [newCase] = await db('cases')
    .insert({
      case_number,
      crime_type,
      location_id,
      incident_date,
      incident_time,
      priority: priority || 'Med',
      assigned_officer_id: req.user!.sub,
      created_by: req.user!.sub,
    })
    .returning('*');

  await auditLog(req.user!.agency_slug, req.user!.sub, 'CREATE', 'cases', newCase.id, req.ip || '');
  res.status(201).json(newCase);
});

casesRouter.get('/:id', async (req: Request, res: Response) => {
  const c = await db('cases')
    .select('cases.*', 'users.full_name as officer_name', 'locations.label as location_label')
    .leftJoin('users', 'cases.assigned_officer_id', 'users.id')
    .leftJoin('locations', 'cases.location_id', 'locations.id')
    .where({ 'cases.id': req.params.id, 'cases.deleted_at': null })
    .first();

  if (!c) { res.status(404).json({ error: 'Case not found' }); return; }
  res.json(c);
});

casesRouter.put('/:id', async (req: Request, res: Response) => {
  const { crime_type, status, priority, incident_date, incident_time } = req.body;
  const [updated] = await db('cases')
    .where({ id: req.params.id })
    .update({ crime_type, status, priority, incident_date, incident_time, updated_at: db.fn.now() })
    .returning('*');

  if (!updated) { res.status(404).json({ error: 'Case not found' }); return; }
  await auditLog(req.user!.agency_slug, req.user!.sub, 'UPDATE', 'cases', req.params.id, req.ip || '');
  res.json(updated);
});

casesRouter.delete('/:id', requireRole('supervisor', 'admin'), async (req: Request, res: Response) => {
  await db('cases').where({ id: req.params.id }).update({ deleted_at: db.fn.now() });
  await auditLog(req.user!.agency_slug, req.user!.sub, 'DELETE', 'cases', req.params.id, req.ip || '');
  res.json({ success: true });
});

casesRouter.get('/:id/reports', async (req: Request, res: Response) => {
  const reports = await db('reports')
    .where({ case_id: req.params.id })
    .orderBy('created_at', 'desc');
  res.json(reports);
});
