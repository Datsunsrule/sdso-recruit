import puppeteer from 'puppeteer';
import nunjucks from 'nunjucks';
import path from 'path';
import { db } from '../db/client';

nunjucks.configure(path.join(__dirname, '../templates'), { autoescape: true });

export async function generatePdf(reportId: string, agencySlug: string): Promise<Buffer> {
  await db.raw('SET search_path = ??', [agencySlug]);

  const report = await db('reports').where({ id: reportId }).first();
  if (!report) throw new Error('Report not found');

  const data = await db('report_data').where({ report_id: reportId }).first();
  const fields = data?.fields || {};

  const submitter = await db('users').where({ id: report.submitted_by }).first();
  const caseRecord = await db('cases').where({ id: report.case_id }).first();
  const agency = await db('public.agencies').where({ slug: agencySlug }).first();

  const templateMap: Record<string, string> = {
    case: 'reports/case.html',
    arrest: 'reports/arrest.html',
    property: 'reports/property.html',
    collision: 'reports/collision.html',
    tow: 'reports/tow.html',
    deputy: 'reports/deputy.html',
    digital: 'reports/digital.html',
  };

  const template = templateMap[report.report_type] || 'reports/generic.html';

  const html = nunjucks.render(template, {
    report,
    fields,
    submitter,
    caseRecord,
    agency,
    isDraft: report.status === 'Draft' || report.status === 'Pending',
    generatedAt: new Date().toLocaleString(),
  });

  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
