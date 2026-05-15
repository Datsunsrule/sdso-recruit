import { db } from '../db/client';

export async function auditLog(
  schema: string,
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  ipAddress: string,
  details?: object
) {
  try {
    await db.raw('SET search_path = ??', [schema]);
    await db('audit_log').insert({
      user_id: userId,
      action,
      resource,
      resource_id: resourceId,
      ip_address: ipAddress,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (e) {
    console.error('Audit log error:', e);
  }
}
