import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queueApi, reportsApi } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import { TopBar, StatusBadge, Card, StatusFooter, Modal, Btn } from '../components/ui';
import type { Report } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || '';

function elapsed(isoDate?: string) {
  if (!isoDate) return '—';
  const ms = Date.now() - new Date(isoDate).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function SupervisorQueue() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, currentLocation, token } = useAuthStore();

  const [rejectModal, setRejectModal] = useState<Report | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const { data: reports = [], refetch } = useQuery({
    queryKey: ['queue', currentLocation?.id],
    queryFn: () => queueApi.list({ location: currentLocation?.id, status: 'Pending' }),
  });

  const { data: stats } = useQuery({
    queryKey: ['queue-stats', currentLocation?.id],
    queryFn: () => queueApi.stats({ location: currentLocation?.id }),
  });

  // Real-time updates
  useEffect(() => {
    if (!token || !WS_URL) return;
    const ws = new WebSocket(`${WS_URL}/queue/ws?token=${token}`);
    ws.onopen = () => {
      if (currentLocation?.id) ws.send(JSON.stringify({ type: 'set_location', location_id: currentLocation.id }));
    };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'queue_update') refetch();
    };
    return () => ws.close();
  }, [token, currentLocation, refetch]);

  const approve = useMutation({
    mutationFn: (id: string) => reportsApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['queue'] }),
  });

  const reject = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => reportsApi.reject(id, notes),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['queue'] }); setRejectModal(null); setRejectNotes(''); },
  });

  const REPORT_LABELS: Record<string, string> = {
    case: 'Case/Incident', arrest: 'Arrest', property: 'Property & Evidence',
    collision: 'Traffic Collision', tow: 'Tow/Impound', deputy: "Deputy's Report", digital: 'Digital Evidence',
  };

  const grouped = reports.reduce((acc: Record<string, Report[]>, r: Report) => {
    const key = r.report_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="h-full flex flex-col bg-bg">
      <TopBar
        title="Supervisor Queue"
        onBack={() => navigate('/cases')}
        onHome={() => navigate('/')}
        subtitle={currentLocation?.label}
        rightContent={
          <span className="ml-2 bg-accent/20 text-accent text-xs font-bold px-2 py-1 rounded-lg">
            {currentLocation?.code}
          </span>
        }
      />

      {/* Stats row */}
      {stats && (
        <div className="flex gap-3 px-4 py-3 bg-white border-b border-border">
          {[
            { label: 'Pending', value: stats.pending, color: 'text-warning' },
            { label: 'Approved Today', value: stats.approved_today, color: 'text-success' },
            { label: 'Rejected Today', value: stats.rejected_today, color: 'text-danger' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 text-center">
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-[10px] text-textMuted uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {reports.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">✓</div>
            <p className="text-textMuted text-sm font-semibold">Queue is clear</p>
            <p className="text-textMuted text-xs mt-1">No pending reports</p>
          </div>
        )}

        {Object.entries(grouped).map(([type, rpts]) => (
          <div key={type}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-textSub mb-2">
              {REPORT_LABELS[type] || type} ({rpts.length})
            </div>
            <div className="flex flex-col gap-2">
              {rpts.map((r: Report) => (
                <Card key={r.id} className="overflow-hidden">
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-text">{r.case_number}</div>
                        <div className="text-xs text-textSub">{r.officer_name} · Badge {r.badge_number}</div>
                        <div className="text-xs text-textMuted mt-0.5">{r.crime_type}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={r.status} />
                        <span className="text-[10px] font-bold text-warning bg-warningLight px-2 py-0.5 rounded-full">
                          {elapsed(r.submitted_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex border-t border-border">
                    <button
                      onClick={() => approve.mutate(r.id)}
                      disabled={approve.isPending}
                      className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-success hover:bg-successLight transition-colors border-r border-border"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => { setRejectModal(r); setRejectNotes(''); }}
                      className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-danger hover:bg-dangerLight transition-colors border-r border-border"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Reject
                    </button>
                    <button
                      onClick={() => navigate(`/reports/${r.id}/${r.report_type}`)}
                      className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-textSub hover:bg-surfaceAlt transition-colors"
                    >
                      View
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <StatusFooter userId={user?.badge_number} screen="Queue" location={currentLocation?.code} />

      {/* Reject modal */}
      {rejectModal && (
        <Modal title="Reject Report" onClose={() => setRejectModal(null)}>
          <div className="flex flex-col gap-3">
            <p className="text-sm text-textSub">
              Rejecting <strong>{rejectModal.case_number}</strong> — {REPORT_LABELS[rejectModal.report_type]}
            </p>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textSub mb-1">Rejection Notes (required)</label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows={4}
                className="w-full bg-surfaceAlt border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-borderFocus resize-none"
                placeholder="Explain what needs to be corrected…"
              />
            </div>
            <div className="flex gap-2">
              <Btn variant="ghost" fullWidth onClick={() => setRejectModal(null)}>Cancel</Btn>
              <Btn
                variant="danger" fullWidth
                disabled={!rejectNotes.trim() || reject.isPending}
                onClick={() => reject.mutate({ id: rejectModal.id, notes: rejectNotes })}
              >
                {reject.isPending ? 'Rejecting…' : 'Reject'}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
