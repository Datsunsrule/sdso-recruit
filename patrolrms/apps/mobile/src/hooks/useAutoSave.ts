import { useEffect, useRef, useState } from 'react';
import { reportsApi } from '../api/endpoints';
import { saveDraftOffline } from '../store/offlineDb';
import { useNetwork } from './useNetwork';

export function useAutoSave(
  reportId: string,
  reportType: string,
  caseId: string,
  fields: Record<string, unknown>,
  debounceMs = 2000
) {
  const online = useNetwork();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!reportId) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await saveDraftOffline(reportId, reportType, caseId, fields);
      if (online) {
        try {
          await reportsApi.saveData(reportId, fields);
        } catch {}
      }
      setSavedAt(new Date());
    }, debounceMs);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [fields, reportId, online, debounceMs, reportType, caseId]);

  return savedAt;
}
