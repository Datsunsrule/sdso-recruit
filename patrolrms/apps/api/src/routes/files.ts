import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from '../db/client';
import { uploadToS3, deleteFromS3, getPresignedUrl } from '../services/s3';

export const filesRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

filesRouter.post('/reports/:reportId/files', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

  const s3Key = `${req.user!.agency_slug}/evidence/${req.params.reportId}/${Date.now()}-${req.file.originalname}`;
  const s3Url = await uploadToS3(s3Key, req.file.buffer, req.file.mimetype);

  const [file] = await db('evidence_files')
    .insert({
      report_id: req.params.reportId,
      filename: req.file.originalname,
      original_name: req.file.originalname,
      mime_type: req.file.mimetype,
      file_size: req.file.size,
      s3_key: s3Key,
      s3_url: s3Url,
      uploaded_by: req.user!.sub,
    })
    .returning('*');

  res.status(201).json(file);
});

filesRouter.get('/reports/:reportId/files', async (req: Request, res: Response) => {
  const files = await db('evidence_files').where({ report_id: req.params.reportId }).orderBy('uploaded_at');
  res.json(files);
});

filesRouter.delete('/:id', async (req: Request, res: Response) => {
  const file = await db('evidence_files').where({ id: req.params.id }).first();
  if (!file) { res.status(404).json({ error: 'File not found' }); return; }

  await deleteFromS3(file.s3_key);
  await db('evidence_files').where({ id: req.params.id }).delete();
  res.json({ success: true });
});

filesRouter.get('/:id/download', async (req: Request, res: Response) => {
  const file = await db('evidence_files').where({ id: req.params.id }).first();
  if (!file) { res.status(404).json({ error: 'File not found' }); return; }

  const url = await getPresignedUrl(file.s3_key);
  res.json({ url });
});
