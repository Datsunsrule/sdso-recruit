import Dexie, { Table } from 'dexie';

interface DraftReport {
  id: string;
  report_type: string;
  case_id: string;
  fields: Record<string, unknown>;
  synced: boolean;
  updated_at: number;
}

interface SyncQueue {
  id?: number;
  operation: 'save_draft';
  report_id: string;
  fields: Record<string, unknown>;
  queued_at: number;
}

class PatrolRMSDb extends Dexie {
  drafts!: Table<DraftReport>;
  syncQueue!: Table<SyncQueue>;

  constructor() {
    super('PatrolRMS');
    this.version(1).stores({
      drafts: 'id, report_type, case_id, synced, updated_at',
      syncQueue: '++id, report_id, queued_at',
    });
  }
}

export const offlineDb = new PatrolRMSDb();

export async function saveDraftOffline(
  reportId: string,
  reportType: string,
  caseId: string,
  fields: Record<string, unknown>
) {
  await offlineDb.drafts.put({ id: reportId, report_type: reportType, case_id: caseId, fields, synced: false, updated_at: Date.now() });
  await offlineDb.syncQueue.add({ operation: 'save_draft', report_id: reportId, fields, queued_at: Date.now() });
}

export async function getDraftOffline(reportId: string) {
  return offlineDb.drafts.get(reportId);
}

export async function markSynced(reportId: string) {
  await offlineDb.drafts.update(reportId, { synced: true });
  await offlineDb.syncQueue.where('report_id').equals(reportId).delete();
}

export async function getPendingSync() {
  return offlineDb.syncQueue.orderBy('queued_at').toArray();
}
