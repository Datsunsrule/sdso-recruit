import { Router, Request, Response } from 'express';
import { db } from '../db/client';

export const evidenceRouter = Router();

evidenceRouter.get('/reports/:reportId/evidence', async (req: Request, res: Response) => {
  const items = await db('evidence_items').where({ report_id: req.params.reportId }).orderBy('created_at');
  res.json(items);
});

evidenceRouter.post('/reports/:reportId/evidence', async (req: Request, res: Response) => {
  const { item_number, description, quantity, category, condition, storage_loc, collected_at } = req.body;
  const [item] = await db('evidence_items')
    .insert({
      report_id: req.params.reportId,
      item_number,
      description,
      quantity: quantity || 1,
      category,
      condition,
      storage_loc,
      collected_by: req.user!.sub,
      collected_at,
    })
    .returning('*');
  res.status(201).json(item);
});

evidenceRouter.put('/:id', async (req: Request, res: Response) => {
  const [updated] = await db('evidence_items').where({ id: req.params.id }).update(req.body).returning('*');
  if (!updated) { res.status(404).json({ error: 'Evidence item not found' }); return; }
  res.json(updated);
});

evidenceRouter.delete('/:id', async (req: Request, res: Response) => {
  await db('evidence_items').where({ id: req.params.id }).delete();
  res.json({ success: true });
});

evidenceRouter.get('/:id/custody', async (req: Request, res: Response) => {
  const log = await db('custody_log').where({ evidence_id: req.params.id }).orderBy('performed_at');
  res.json(log);
});

evidenceRouter.post('/:id/custody', async (req: Request, res: Response) => {
  const { action, from_person, to_person, location, notes } = req.body;
  const [entry] = await db('custody_log')
    .insert({
      evidence_id: req.params.id,
      action,
      from_person,
      to_person,
      location,
      notes,
      performed_by: req.user!.sub,
    })
    .returning('*');
  res.status(201).json(entry);
});
