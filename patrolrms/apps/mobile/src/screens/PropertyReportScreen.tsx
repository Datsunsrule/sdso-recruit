import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { evidenceApi } from '../api/endpoints';
import ReportShell from '../components/ReportShell';
import { SectionLabel, Fld, SpeechTextarea, inputCls, selectCls, TabBar, Card, Btn, Modal } from '../components/ui';
import type { EvidenceItem, CustodyEntry } from '../types';

export default function PropertyReportScreen() {
  const { reportId } = useParams<{ reportId: string }>();
  const qc = useQueryClient();
  const [tab, setTab] = useState('Items');
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<EvidenceItem>>({});
  const [selectedEvId, setSelectedEvId] = useState<string | null>(null);
  const [custodyForm, setCustodyForm] = useState<Partial<CustodyEntry>>({});
  const [showCustody, setShowCustody] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ['evidence', reportId],
    queryFn: () => evidenceApi.list(reportId!),
    enabled: !!reportId,
  });

  const { data: custody = [] } = useQuery({
    queryKey: ['custody', selectedEvId],
    queryFn: () => evidenceApi.custody(selectedEvId!),
    enabled: !!selectedEvId,
  });

  const addItem = useMutation({
    mutationFn: () => evidenceApi.create(reportId!, newItem),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['evidence', reportId] }); setShowAddItem(false); setNewItem({}); },
  });

  const addCustody = useMutation({
    mutationFn: () => evidenceApi.addCustody(selectedEvId!, custodyForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['custody', selectedEvId] }); setShowCustody(false); setCustodyForm({}); },
  });

  const CATEGORIES = ['Narcotics', 'Weapon', 'Currency', 'Electronics', 'Other'];
  const ACTIONS = ['Received', 'Transferred', 'Released', 'Destroyed'];

  return (
    <ReportShell title="Property & Evidence" icon="📦" reportType="property">
      {(fields, setField) => (
        <div className="flex flex-col gap-1 -mx-4 -mt-4">
          <TabBar tabs={['Items', 'Collection Info', 'Chain of Custody']} active={tab} onChange={setTab} />
          <div className="px-4 pt-4">

            {tab === 'Items' && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-text">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                  <Btn small variant="primary" onClick={() => setShowAddItem(true)}>+ Add Item</Btn>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <Card key={item.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-sm">{item.description || '(no description)'}</div>
                          <div className="text-xs text-textSub mt-0.5">Item #{item.item_number} · Qty: {item.quantity}</div>
                          {item.category && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-accentLight text-accent mt-1 inline-block">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <button onClick={() => { setSelectedEvId(item.id); setShowCustody(true); }}
                          className="text-xs text-textSub border border-border rounded-lg px-2 py-1 hover:border-accent hover:text-accent transition-colors">
                          Custody
                        </button>
                      </div>
                    </Card>
                  ))}
                  {items.length === 0 && <p className="text-textMuted text-sm text-center py-8">No evidence items yet</p>}
                </div>
              </>
            )}

            {tab === 'Collection Info' && (
              <div className="flex flex-col gap-1">
                <div className="grid grid-cols-2 gap-3">
                  <Fld label="Report Number"><input readOnly value={fields.report_number || ''} className={inputCls + ' opacity-60'} /></Fld>
                  <Fld label="Case Number"><input readOnly value={fields.case_number || ''} className={inputCls + ' opacity-60'} /></Fld>
                  <Fld label="Report Date"><input readOnly value={fields.report_date || ''} className={inputCls + ' opacity-60'} /></Fld>
                  <Fld label="Report Time"><input readOnly value={fields.report_time || ''} className={inputCls + ' opacity-60'} /></Fld>
                  <Fld label="Collecting Officer"><input readOnly value={fields.reporting_officer || ''} className={inputCls + ' opacity-60'} /></Fld>
                  <Fld label="Badge"><input readOnly value={fields.badge_number || ''} className={inputCls + ' opacity-60'} /></Fld>
                  <Fld label="Collection Location" span={2}><input value={fields.collection_location || ''} onChange={(e) => setField('collection_location', e.target.value)} className={inputCls} /></Fld>
                  <Fld label="Collection Date"><input type="date" value={fields.collection_date || ''} onChange={(e) => setField('collection_date', e.target.value)} className={inputCls} /></Fld>
                  <Fld label="Collection Time"><input type="time" value={fields.collection_time || ''} onChange={(e) => setField('collection_time', e.target.value)} className={inputCls} /></Fld>
                  <Fld label="Storage Location" span={2}><input value={fields.storage_location || ''} onChange={(e) => setField('storage_location', e.target.value)} className={inputCls} /></Fld>
                </div>
                <SectionLabel title="Notes" />
                <SpeechTextarea value={fields.notes || ''} onChange={(v) => setField('notes', v)} minHeight={100} />
              </div>
            )}

            {tab === 'Chain of Custody' && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-text">Select an item to view custody</span>
                  <select className={selectCls + ' w-auto text-xs'} value={selectedEvId || ''} onChange={(e) => setSelectedEvId(e.target.value)}>
                    <option value="">Select item…</option>
                    {items.map((i) => <option key={i.id} value={i.id}>#{i.item_number} – {i.description}</option>)}
                  </select>
                </div>
                {selectedEvId && (
                  <>
                    <Btn small variant="primary" onClick={() => setShowCustody(true)}>+ Add Entry</Btn>
                    <div className="mt-3 flex flex-col gap-2">
                      {custody.map((c) => (
                        <Card key={c.id} className="p-3">
                          <div className="font-semibold text-sm">{c.action}</div>
                          <div className="text-xs text-textSub">{c.from_person} → {c.to_person}</div>
                          {c.notes && <div className="text-xs text-textMuted mt-1">{c.notes}</div>}
                          <div className="text-[10px] text-textMuted mt-1">{new Date(c.performed_at).toLocaleString()}</div>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Add Item Modal */}
          {showAddItem && (
            <Modal title="Add Evidence Item" onClose={() => setShowAddItem(false)}>
              <div className="flex flex-col gap-3">
                <div><label className="block text-xs font-bold uppercase text-textSub mb-1">Description</label>
                  <input value={newItem.description || ''} onChange={(e) => setNewItem(p => ({ ...p, description: e.target.value }))} className={inputCls} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold uppercase text-textSub mb-1">Item #</label>
                    <input value={newItem.item_number || ''} onChange={(e) => setNewItem(p => ({ ...p, item_number: e.target.value }))} className={inputCls} /></div>
                  <div><label className="block text-xs font-bold uppercase text-textSub mb-1">Qty</label>
                    <input type="number" value={newItem.quantity || 1} onChange={(e) => setNewItem(p => ({ ...p, quantity: Number(e.target.value) }))} className={inputCls} /></div>
                </div>
                <div><label className="block text-xs font-bold uppercase text-textSub mb-1">Category</label>
                  <select value={newItem.category || ''} onChange={(e) => setNewItem(p => ({ ...p, category: e.target.value }))} className={selectCls}>
                    <option value="">—</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select></div>
                <div><label className="block text-xs font-bold uppercase text-textSub mb-1">Condition</label>
                  <input value={newItem.condition || ''} onChange={(e) => setNewItem(p => ({ ...p, condition: e.target.value }))} className={inputCls} /></div>
                <Btn variant="primary" fullWidth onClick={() => addItem.mutate()} disabled={addItem.isPending}>
                  {addItem.isPending ? 'Saving…' : 'Add Item'}
                </Btn>
              </div>
            </Modal>
          )}

          {/* Custody Entry Modal */}
          {showCustody && selectedEvId && (
            <Modal title="Add Custody Entry" onClose={() => setShowCustody(false)}>
              <div className="flex flex-col gap-3">
                <div><label className="block text-xs font-bold uppercase text-textSub mb-1">Action</label>
                  <select value={custodyForm.action || ''} onChange={(e) => setCustodyForm(p => ({ ...p, action: e.target.value }))} className={selectCls}>
                    <option value="">—</option>{ACTIONS.map(a => <option key={a}>{a}</option>)}
                  </select></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold uppercase text-textSub mb-1">From</label>
                    <input value={custodyForm.from_person || ''} onChange={(e) => setCustodyForm(p => ({ ...p, from_person: e.target.value }))} className={inputCls} /></div>
                  <div><label className="block text-xs font-bold uppercase text-textSub mb-1">To</label>
                    <input value={custodyForm.to_person || ''} onChange={(e) => setCustodyForm(p => ({ ...p, to_person: e.target.value }))} className={inputCls} /></div>
                </div>
                <div><label className="block text-xs font-bold uppercase text-textSub mb-1">Location</label>
                  <input value={custodyForm.location || ''} onChange={(e) => setCustodyForm(p => ({ ...p, location: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs font-bold uppercase text-textSub mb-1">Notes</label>
                  <input value={custodyForm.notes || ''} onChange={(e) => setCustodyForm(p => ({ ...p, notes: e.target.value }))} className={inputCls} /></div>
                <Btn variant="primary" fullWidth onClick={() => addCustody.mutate()} disabled={addCustody.isPending}>
                  {addCustody.isPending ? 'Saving…' : 'Add Entry'}
                </Btn>
              </div>
            </Modal>
          )}
        </div>
      )}
    </ReportShell>
  );
}
