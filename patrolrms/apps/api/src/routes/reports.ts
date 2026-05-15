import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { requireRole } from '../middleware/auth';
import { auditLog } from '../services/audit';
import { generateReportNumber } from '../services/caseNumber';
import { generatePdf } from '../workers/pdfGenerator';
import { broadcastQueueUpdate } from '../services/websocket';

export const reportsRouter = Router();

reportsRouter.post('/', async (req: Request, res: Response) => {
  const { case_id, report_type } = req.body;

  const c = await db('cases').where({ id: case_id }).first();
  if (!c) { res.status(400).json({ error: 'Case not found' }); return; }

  const report_number = generateReportNumber(c.case_number, report_type);

  const [report] = await db('reports')
    .insert({
      case_id,
      report_type,
      status: 'Draft',
      submitted_by: req.user!.sub,
    })
    .returning('*');

  await db('report_data').insert({
    report_id: report.id,
    fields: JSON.stringify({ report_number, case_number: c.case_number }),
  });

  await auditLog(req.user!.agency_slug, req.user!.sub, 'CREATE', 'reports', report.id, req.ip || '');
  res.status(201).json({ ...report, report_number });
});

reportsRouter.get('/:id', async (req: Request, res: Response) => {
  const report = await db('reports').where({ id: req.params.id }).first();
  if (!report) { res.status(404).json({ error: 'Report not found' }); return; }

  const data = await db('report_data').where({ report_id: req.params.id }).first();
  res.json({ ...report, fields: data?.fields || {} });
});

reportsRouter.put('/:id/data', async (req: Request, res: Response) => {
  const { fields } = req.body;

  const existing = await db('report_data').where({ report_id: req.params.id }).first();
  if (existing) {
    await db('report_data')
      .where({ report_id: req.params.id })
      .update({ fields: JSON.stringify(fields), updated_at: db.fn.now() });
  } else {
    await db('report_data').insert({ report_id: req.params.id, fields: JSON.stringify(fields) });
  }

  await db('reports').where({ id: req.params.id }).update({ updated_at: db.fn.now() });
  res.json({ success: true });
});

reportsRouter.post('/:id/submit', async (req: Request, res: Response) => {
  const report = await db('reports').where({ id: req.params.id }).first();
  if (!report) { res.status(404).json({ error: 'Report not found' }); return; }
  if (report.status !== 'Draft' && report.status !== 'Rejected') {
    res.status(400).json({ error: 'Report cannot be submitted in current state' });
    return;
  }

  const [updated] = await db('reports')
    .where({ id: req.params.id })
    .update({ status: 'Pending', submitted_at: db.fn.now(), updated_at: db.fn.now() })
    .returning('*');

  const caseRecord = await db('cases').where({ id: report.case_id }).first();
  await broadcastQueueUpdate(req.user!.agency_slug, caseRecord?.location_id, updated);

  await auditLog(req.user!.agency_slug, req.user!.sub, 'SUBMIT', 'reports', req.params.id, req.ip || '');
  res.json(updated);
});

reportsRouter.post('/:id/approve', requireRole('supervisor', 'admin'), async (req: Request, res: Response) => {
  const { notes } = req.body;
  const [updated] = await db('reports')
    .where({ id: req.params.id })
    .update({
      status: 'Approved',
      reviewed_by: req.user!.sub,
      review_notes: notes,
      reviewed_at: db.fn.now(),
      updated_at: db.fn.now(),
    })
    .returning('*');

  if (!updated) { res.status(404).json({ error: 'Report not found' }); return; }

  try {
    await generatePdf(req.params.id, req.user!.agency_slug);
  } catch (e) {
    console.error('PDF generation failed (non-fatal):', e);
  }

  await auditLog(req.user!.agency_slug, req.user!.sub, 'APPROVE', 'reports', req.params.id, req.ip || '');
  res.json(updated);
});

reportsRouter.post('/:id/reject', requireRole('supervisor', 'admin'), async (req: Request, res: Response) => {
  const { notes } = req.body;
  if (!notes) { res.status(400).json({ error: 'Rejection notes required' }); return; }

  const [updated] = await db('reports')
    .where({ id: req.params.id })
    .update({
      status: 'Rejected',
      reviewed_by: req.user!.sub,
      review_notes: notes,
      reviewed_at: db.fn.now(),
      updated_at: db.fn.now(),
    })
    .returning('*');

  await auditLog(req.user!.agency_slug, req.user!.sub, 'REJECT', 'reports', req.params.id, req.ip || '');
  res.json(updated);
});

reportsRouter.get('/:id/pdf', async (req: Request, res: Response) => {
  const pdfBuffer = await generatePdf(req.params.id, req.user!.agency_slug);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="report-${req.params.id}.pdf"`);
  res.send(pdfBuffer);
});
