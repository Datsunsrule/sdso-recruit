import { useState, useEffect } from 'react';
import { reportsApi } from '../api/endpoints';
import { getPendingSync, markSynced } from '../store/offlineDb';

export function useNetwork() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => { setOnline(true); flushSyncQueue(); };
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return online;
}

async function flushSyncQueue() {
  const pending = await getPendingSync();
  for (const item of pending) {
    try {
      await reportsApi.saveData(item.report_id, item.fields);
      await markSynced(item.report_id);
    } catch {}
  }
}
