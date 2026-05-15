import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsApi } from '../api/endpoints';
import { TopBar, StatusFooter, OfflineBanner, Toast } from './ui';
import { useAuthStore } from '../store/authStore';
import { useAutoSave } from '../hooks/useAutoSave';
import { useNetwork } from '../hooks/useNetwork';

interface ReportShellProps {
  title: string;
  icon?: string;
  reportType: string;
  children: (fields: Record<string, any>, setField: (k: string, v: any) => void) => React.ReactNode;
}

export default function ReportShell({ title, icon, reportType, children }: ReportShellProps) {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();
  const { user, currentLocation } = useAuthStore();
  const online = useNetwork();

  const [fields, setFields] = useState<Record<string, any>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  const { data: report } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => reportsApi.get(reportId!),
    enabled: !!reportId,
  });

  useEffect(() => {
    if (report?.fields) {
      const now = new Date();
      setFields({
        report_date: now.toLocaleDateString(),
        report_time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reporting_officer: user?.full_name,
        badge_number: user?.badge_number,
        station: currentLocation?.label,
        ...report.fields,
      });
    }
  }, [report, user, currentLocation]);

  const setField = (key: string, value: any) => setFields((prev) => ({ ...prev, [key]: value }));

  const savedAt = useAutoSave(reportId!, reportType, report?.case_id || '', fields);

  const submitMutation = useMutation({
    mutationFn: () => reportsApi.saveData(reportId!, fields).then(() => reportsApi.submit(reportId!)),
    onSuccess: () => {
      showToast('Submitted for approval ✓', 'success');
      setTimeout(() => navigate('/cases'), 1500);
    },
    onError: () => showToast('Submission failed', 'error'),
  });

  const saveMutation = useMutation({
    mutationFn: () => reportsApi.saveData(reportId!, fields),
    onSuccess: () => showToast('Saved ✓', 'success'),
    onError: () => showToast('Save failed', 'error'),
  });

  function showToast(msg: string, type: 'success' | 'error' | 'info') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  const isLocked = report?.status === 'Approved';

  return (
    <div className="h-full flex flex-col bg-bg">
      <TopBar
        title={title}
        icon={icon}
        onBack={() => navigate('/cases')}
        onHome={() => navigate('/')}
        subtitle={report?.fields?.case_number || report?.case_id?.slice(0, 8)}
        rightContent={
          savedAt && online ? (
            <span className="text-white/50 text-[10px] ml-2">✓ Saved</span>
          ) : undefined
        }
      />
      {!online && <OfflineBanner />}

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {children(fields, setField)}
      </div>

      {!isLocked && (
        <div className="flex gap-2 px-4 pb-4 pt-2 bg-white border-t border-border shrink-0">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-textSub hover:bg-surfaceAlt transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            className="flex-1 py-2.5 rounded-lg bg-accent text-white text-sm font-bold hover:bg-accentHov transition-colors disabled:opacity-50"
            style={{ boxShadow: '0 2px 8px rgba(200,118,10,0.35)' }}
          >
            {submitMutation.isPending ? 'Submitting…' : 'Submit for Approval'}
          </button>
        </div>
      )}

      <StatusFooter userId={user?.badge_number} screen={title} location={currentLocation?.code} />
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
