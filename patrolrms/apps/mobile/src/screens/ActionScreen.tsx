import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { reportsApi } from '../api/endpoints';
import { TopBar, StatusFooter } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import type { ReportType } from '../types';

const REPORT_TYPES: { type: ReportType; icon: string; label: string; desc: string }[] = [
  { type: 'case', icon: '📋', label: 'Case / Incident Report', desc: 'General crime or incident documentation' },
  { type: 'arrest', icon: '🔒', label: 'Arrest Report', desc: 'Full arrest and booking record' },
  { type: 'property', icon: '📦', label: 'Property & Evidence Log', desc: 'Seized or recovered property tracking' },
  { type: 'collision', icon: '🚗', label: 'Traffic Collision Report', desc: 'SWITRS-compatible collision documentation' },
  { type: 'tow', icon: '🚛', label: 'Tow / Impound Report', desc: 'Vehicle tow and impound record' },
  { type: 'deputy', icon: '📝', label: "Deputy's Report / Activity Log", desc: 'Shift narrative and use-of-force' },
  { type: 'digital', icon: '📁', label: 'Digital Evidence Folder', desc: 'Media and file attachments' },
];

export default function ActionScreen() {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const { user, currentLocation } = useAuthStore();
  const [selected, setSelected] = useState<ReportType | null>(null);

  const createReport = useMutation({
    mutationFn: () => reportsApi.create(caseId!, selected!),
    onSuccess: (report) => {
      navigate(`/reports/${report.id}/${selected}`);
    },
  });

  return (
    <div className="h-full flex flex-col bg-bg">
      <TopBar
        title="Select Report Type"
        onBack={() => navigate('/cases')}
        onHome={() => navigate('/')}
        subtitle={`Case: ${caseId?.slice(0, 8)}…`}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {REPORT_TYPES.map(({ type, icon, label, desc }) => (
          <button
            key={type}
            onClick={() => setSelected(type)}
            className="flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
            style={{
              background: selected === type ? '#fff3e0' : '#ffffff',
              borderColor: selected === type ? '#c8760a' : '#e1e4e8',
              boxShadow: selected === type ? '0 0 0 1px rgba(200,118,10,0.2)' : '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <span className="text-2xl">{icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-text">{label}</div>
              <div className="text-xs text-textSub mt-0.5">{desc}</div>
            </div>
            {selected === type && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8760a" strokeWidth="2.5">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4 pt-2 bg-white border-t border-border">
        <button
          onClick={() => createReport.mutate()}
          disabled={!selected || createReport.isPending}
          className="w-full py-3.5 rounded-xl font-bold text-white text-base disabled:opacity-40 transition-all"
          style={{ background: selected ? '#c8760a' : '#9ca3af', boxShadow: selected ? '0 4px 16px rgba(200,118,10,0.4)' : 'none' }}
        >
          {createReport.isPending ? 'Creating…' : 'Start Report →'}
        </button>
      </div>

      <StatusFooter userId={user?.badge_number} screen="Action" location={currentLocation?.code} />
    </div>
  );
}
