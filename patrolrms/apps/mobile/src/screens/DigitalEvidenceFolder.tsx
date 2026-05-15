import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '../api/endpoints';
import ReportShell from '../components/ReportShell';
import { Card, Modal, Btn } from '../components/ui';
import type { EvidenceFile } from '../types';

function fileIcon(mime?: string) {
  if (!mime) return '📄';
  if (mime.startsWith('image/')) return '📷';
  if (mime.startsWith('video/')) return '🎬';
  if (mime.startsWith('audio/')) return '🎵';
  return '📄';
}

function formatBytes(bytes?: number) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function DigitalEvidenceFolder() {
  const { reportId } = useParams<{ reportId: string }>();
  const qc = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ file: EvidenceFile; x: number; y: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<EvidenceFile | null>(null);

  const { data: files = [] } = useQuery({
    queryKey: ['evidence-files', reportId],
    queryFn: () => filesApi.list(reportId!),
    enabled: !!reportId,
  });

  const deleteFile = useMutation({
    mutationFn: (id: string) => filesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['evidence-files', reportId] }); setConfirmDelete(null); },
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !reportId) return;
    setUploading(true);
    setUploadPct(0);
    try {
      await filesApi.upload(reportId, file, setUploadPct);
      qc.invalidateQueries({ queryKey: ['evidence-files', reportId] });
    } finally {
      setUploading(false);
      setUploadPct(0);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function handleDownload(file: EvidenceFile) {
    const { url } = await filesApi.download(file.id);
    window.open(url, '_blank');
    setContextMenu(null);
  }

  return (
    <ReportShell title="Digital Evidence" icon="📁" reportType="digital">
      {() => (
        <div className="flex flex-col gap-3">
          {/* Upload button */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-text">{files.length} file{files.length !== 1 ? 's' : ''}</span>
            <button
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accentHov transition-colors disabled:opacity-50"
              style={{ boxShadow: '0 2px 8px rgba(200,118,10,0.35)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Evidence
            </button>
            <input ref={fileInput} type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" />
          </div>

          {/* Upload progress */}
          {uploading && (
            <div className="bg-surfaceAlt rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-text">Uploading…</span>
                <span className="text-sm text-textSub">{uploadPct}%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-accent transition-all rounded-full" style={{ width: `${uploadPct}%` }} />
              </div>
            </div>
          )}

          {/* File grid */}
          {files.length === 0 && !uploading && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📁</div>
              <p className="text-textMuted text-sm">No evidence files uploaded yet</p>
              <p className="text-textMuted text-xs mt-1">Tap "Add Evidence" to attach files</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {files.map((file) => (
              <Card
                key={file.id}
                className="p-3 cursor-pointer hover:border-accent/40 transition-colors"
                onContextMenu={(e) => { e.preventDefault(); setContextMenu({ file, x: e.clientX, y: e.clientY }); }}
              >
                <div className="text-3xl mb-2 text-center">{fileIcon(file.mime_type)}</div>
                <div className="text-xs font-semibold text-text truncate">{file.filename}</div>
                <div className="text-[10px] text-textMuted mt-0.5">{formatBytes(file.file_size)}</div>
                <div className="text-[10px] text-textMuted">{new Date(file.uploaded_at).toLocaleDateString()}</div>
                <button
                  onClick={() => handleDownload(file)}
                  className="mt-2 w-full text-[10px] font-bold py-1 rounded-md bg-surfaceAlt border border-border text-textSub hover:border-accent hover:text-accent transition-colors"
                >
                  Download
                </button>
              </Card>
            ))}
          </div>

          {/* Context menu */}
          {contextMenu && (
            <div
              className="fixed z-50 bg-white rounded-xl shadow-md border border-border overflow-hidden"
              style={{ top: contextMenu.y, left: contextMenu.x, minWidth: 160 }}
            >
              <button onClick={() => handleDownload(contextMenu.file)} className="w-full px-4 py-2.5 text-sm text-left hover:bg-surfaceAlt">
                ↓ Download
              </button>
              <button onClick={() => { setConfirmDelete(contextMenu.file); setContextMenu(null); }}
                className="w-full px-4 py-2.5 text-sm text-left text-danger hover:bg-dangerLight">
                ✕ Delete
              </button>
              <button onClick={() => setContextMenu(null)} className="w-full px-4 py-2.5 text-sm text-left text-textSub hover:bg-surfaceAlt">
                Cancel
              </button>
            </div>
          )}
          {contextMenu && <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />}

          {/* Delete confirm */}
          {confirmDelete && (
            <Modal title="Delete File?" onClose={() => setConfirmDelete(null)}>
              <p className="text-sm text-textSub mb-4">Delete <strong>{confirmDelete.filename}</strong>? This cannot be undone.</p>
              <div className="flex gap-2">
                <Btn variant="ghost" fullWidth onClick={() => setConfirmDelete(null)}>Cancel</Btn>
                <Btn variant="danger" fullWidth onClick={() => deleteFile.mutate(confirmDelete.id)} disabled={deleteFile.isPending}>
                  {deleteFile.isPending ? 'Deleting…' : 'Delete'}
                </Btn>
              </div>
            </Modal>
          )}
        </div>
      )}
    </ReportShell>
  );
}
