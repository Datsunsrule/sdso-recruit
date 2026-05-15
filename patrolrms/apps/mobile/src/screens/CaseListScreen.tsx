import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { casesApi, queueApi } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import { TopBar, StatusBadge, PriorityBar, Card, StatusFooter, Modal } from '../components/ui';
import { CRIME_TYPES } from '../types';
import type { Case } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || '';

export default function CaseListScreen() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, currentLocation, token } = useAuthStore();

  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCrimeType, setNewCrimeType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['cases', currentLocation?.id, search],
    queryFn: () => casesApi.list({ location: currentLocation?.id, search }),
  });

  const { data: qStats } = useQuery({
    queryKey: ['queue-stats', currentLocation?.id],
    queryFn: () => queueApi.stats({ location: currentLocation?.id }),
    enabled: user?.role !== 'officer',
  });

  useEffect(() => {
    if (qStats) setPendingCount(qStats.pending);
  }, [qStats]);

  // Real-time WebSocket for supervisor badge
  useEffect(() => {
    if (!token || !WS_URL) return;
    const ws = new WebSocket(`${WS_URL}/queue/ws?token=${token}`);
    ws.onopen = () => {
      if (currentLocation?.id) ws.send(JSON.stringify({ type: 'set_location', location_id: currentLocation.id }));
    };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'queue_update') {
        setPendingCount((n) => n + 1);
        qc.invalidateQueries({ queryKey: ['cases'] });
      }
    };
    return () => ws.close();
  }, [token, currentLocation, qc]);

  const createCase = useMutation({
    mutationFn: () => casesApi.create({ crime_type: newCrimeType, location_id: currentLocation?.id }),
    onSuccess: (newCase) => {
      setShowNewModal(false);
      qc.invalidateQueries({ queryKey: ['cases'] });
      navigate(`/cases/${newCase.id}/action`);
    },
  });

  const cases: Case[] = data?.cases || [];

  return (
    <div className="h-full flex flex-col bg-bg">
      <TopBar
        title="Case Queue"
        subtitle={currentLocation?.label}
        onHome={() => navigate('/')}
        rightContent={
          user?.role !== 'officer' ? (
            <button onClick={() => navigate('/queue')}
              className="relative ml-2 bg-[#1a1a2e] text-white rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1">
              Queue
              {pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>
          ) : undefined
        }
      />

      {/* Search + New */}
      <div className="flex gap-2 px-4 py-3 bg-white border-b border-border">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cases…"
            className="w-full pl-8 pr-3 py-2 bg-surfaceAlt border border-border rounded-lg text-sm focus:outline-none focus:border-borderFocus"
          />
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accentHov transition-colors shrink-0">
          + New
        </button>
      </div>

      {/* Case list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {isLoading && <p className="text-textMuted text-sm text-center py-8">Loading cases…</p>}
        {!isLoading && cases.length === 0 && (
          <p className="text-textMuted text-sm text-center py-8">No cases found</p>
        )}
        {cases.map((c) => (
          <Card key={c.id}>
            <button className="w-full text-left" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
              <div className="flex gap-0">
                <PriorityBar priority={c.priority} />
                <div className="flex-1 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-text">{c.case_number}</span>
                    <div className="flex gap-1.5 items-center">
                      <StatusBadge status={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                  <div className="text-xs text-textSub mt-0.5">{c.crime_type}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-textMuted">{c.officer_name || '—'}</span>
                    <span className="text-textMuted">·</span>
                    <span className="text-[11px] text-textMuted">{c.incident_date || 'No date'}</span>
                  </div>
                </div>
              </div>
            </button>
            {expanded === c.id && (
              <div className="px-3 pb-3 pt-0 border-t border-border">
                <button
                  onClick={() => navigate(`/cases/${c.id}/action`)}
                  className="w-full mt-2 py-2 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accentHov transition-colors">
                  Open Case →
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <StatusFooter userId={user?.badge_number} screen="Cases" location={currentLocation?.code} />

      {/* New Case Modal */}
      {showNewModal && (
        <Modal title="New Case" onClose={() => setShowNewModal(false)}>
          <div className="flex flex-col gap-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-textSub">Crime Type</label>
            <select
              value={newCrimeType}
              onChange={(e) => setNewCrimeType(e.target.value)}
              className="w-full bg-surfaceAlt border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-borderFocus"
            >
              <option value="">Select crime type…</option>
              {CRIME_TYPES.map((ct) => <option key={ct} value={ct}>{ct}</option>)}
            </select>
            <button
              onClick={() => createCase.mutate()}
              disabled={!newCrimeType || createCase.isPending}
              className="w-full py-3 bg-accent text-white font-bold rounded-lg disabled:opacity-50 hover:bg-accentHov transition-colors"
            >
              {createCase.isPending ? 'Creating…' : 'Create Case'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
