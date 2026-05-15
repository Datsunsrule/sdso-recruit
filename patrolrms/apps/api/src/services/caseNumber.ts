import { db } from '../db/client';

export async function generateCaseNumber(locationCode: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `${year}-${locationCode}-`;

  const last = await db('cases')
    .where('case_number', 'like', `${prefix}%`)
    .orderBy('case_number', 'desc')
    .first();

  let seq = 1;
  if (last) {
    const parts = last.case_number.split('-');
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}${String(seq).padStart(5, '0')}`;
}

export function generateReportNumber(caseNumber: string, reportType: string): string {
  const codes: Record<string, string> = {
    case: 'CIR',
    arrest: 'ARR',
    property: 'EVD',
    collision: 'COL',
    tow: 'TOW',
    deputy: 'DAR',
    digital: 'DEF',
  };
  return `${caseNumber}-${codes[reportType] || 'RPT'}`;
}
