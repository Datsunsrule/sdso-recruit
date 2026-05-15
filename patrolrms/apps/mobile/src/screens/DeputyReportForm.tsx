import { useState } from 'react';
import ReportShell from '../components/ReportShell';
import { SectionLabel, Fld, SpeechTextarea, inputCls, selectCls, TabBar } from '../components/ui';

const ACTIVITIES = ['Patrol','Calls for Service','Traffic Stops','Foot Patrol','Backup','Court','Training','Administrative','Transport','Other'];

export default function DeputyReportForm() {
  const [tab, setTab] = useState('Activity');

  return (
    <ReportShell title="Deputy's Report" icon="📝" reportType="deputy">
      {(fields, setField) => (
        <div className="flex flex-col gap-1 -mx-4 -mt-4">
          <TabBar tabs={['Activity', 'Use of Force', 'Equipment']} active={tab} onChange={setTab} />
          <div className="px-4 pt-4">

            {tab === 'Activity' && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Fld label="Report Number"><input readOnly value={fields.report_number || ''} className={inputCls + ' opacity-60'} /></Fld>
                  <Fld label="Date"><input readOnly value={fields.report_date || ''} className={inputCls + ' opacity-60'} /></Fld>
                  <Fld label="Start Time"><input type="time" value={fields.start_time || ''} onChange={(e) => setField('start_time', e.target.value)} className={inputCls} /></Fld>
                  <Fld label="End Time"><input type="time" value={fields.end_time || ''} onChange={(e) => setField('end_time', e.target.value)} className={inputCls} /></Fld>
                  <Fld label="Officer"><input readOnly value={fields.reporting_officer || ''} className={inputCls + ' opacity-60'} /></Fld>
                  <Fld label="Badge"><input readOnly value={fields.badge_number || ''} className={inputCls + ' opacity-60'} /></Fld>
                  <Fld label="Station"><input readOnly value={fields.station || ''} className={inputCls + ' opacity-60'} /></Fld>
                  <Fld label="Beat / Patrol Area"><input value={fields.beat || ''} onChange={(e) => setField('beat', e.target.value)} className={inputCls} /></Fld>
                  <Fld label="Mileage Start"><input type="number" value={fields.mileage_start || ''} onChange={(e) => setField('mileage_start', e.target.value)} className={inputCls} /></Fld>
                  <Fld label="Mileage End"><input type="number" value={fields.mileage_end || ''} onChange={(e) => setField('mileage_end', e.target.value)} className={inputCls} /></Fld>
                  <Fld label="Vehicle Unit #" span={2}><input value={fields.vehicle_unit || ''} onChange={(e) => setField('vehicle_unit', e.target.value)} className={inputCls} /></Fld>
                </div>
                <SectionLabel title="Activities" />
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITIES.map((act) => {
                    const key = `activity_${act.toLowerCase().replace(/[^a-z]/g, '_')}`;
                    return (
                      <label key={act} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!fields[key]} onChange={(e) => setField(key, e.target.checked)} className="w-4 h-4 accent-accent" />
                        <span className="text-sm text-text">{act}</span>
                      </label>
                    );
                  })}
                </div>
                <SectionLabel title="Narrative / Summary" />
                <SpeechTextarea value={fields.narrative || ''} onChange={(v) => setField('narrative', v)} minHeight={150} />
              </div>
            )}

            {tab === 'Use of Force' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 bg-surfaceAlt rounded-xl">
                  <span className="text-sm font-semibold flex-1">Force Used?</span>
                  <button
                    onClick={() => setField('force_used', !fields.force_used)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${fields.force_used ? 'bg-accent' : 'bg-border'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${fields.force_used ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {fields.force_used && (
                  <div className="flex flex-col gap-3">
                    <Fld label="Type of Force">
                      <select value={fields.force_type || ''} onChange={(e) => setField('force_type', e.target.value)} className={selectCls}>
                        <option value="">—</option>
                        {['Verbal','Control Hold','OC Spray','Taser','Firearm','Other'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </Fld>
                    <Fld label="Reason for Force">
                      <input value={fields.force_reason || ''} onChange={(e) => setField('force_reason', e.target.value)} className={inputCls} />
                    </Fld>
                    <div className="flex items-center gap-3 p-3 bg-surfaceAlt rounded-xl">
                      <span className="text-sm font-semibold flex-1">Injury to Subject?</span>
                      <button onClick={() => setField('subject_injury', !fields.subject_injury)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${fields.subject_injury ? 'bg-accent' : 'bg-border'}`}>
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${fields.subject_injury ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                    {fields.subject_injury && (
                      <Fld label="Injury Description">
                        <input value={fields.injury_description || ''} onChange={(e) => setField('injury_description', e.target.value)} className={inputCls} />
                      </Fld>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-surfaceAlt rounded-xl">
                      <span className="text-sm font-semibold flex-1">Medical Provided?</span>
                      <button onClick={() => setField('medical_provided', !fields.medical_provided)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${fields.medical_provided ? 'bg-accent' : 'bg-border'}`}>
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${fields.medical_provided ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'Equipment' && (
              <div className="flex flex-col gap-3">
                {[
                  { key: 'firearm_drawn', label: 'Firearm Drawn?' },
                  { key: 'taser_deployed', label: 'Taser Deployed?' },
                  { key: 'oc_deployed', label: 'OC Deployed?' },
                  { key: 'vehicle_pursuit', label: 'Vehicle Pursuit?' },
                  { key: 'bwc_active', label: 'BWC Active?' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3 p-3 bg-surfaceAlt rounded-xl">
                    <span className="text-sm font-semibold flex-1">{label}</span>
                    <button onClick={() => setField(key, !fields[key])}
                      className={`w-12 h-6 rounded-full transition-colors relative ${fields[key] ? 'bg-accent' : 'bg-border'}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${fields[key] ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                ))}

                {fields.vehicle_pursuit && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-accentLight rounded-xl border border-accent/20">
                    <SectionLabel title="Pursuit Details" />
                    <Fld label="Duration (min)"><input type="number" value={fields.pursuit_duration || ''} onChange={(e) => setField('pursuit_duration', e.target.value)} className={inputCls} /></Fld>
                    <Fld label="Max Speed (mph)"><input type="number" value={fields.pursuit_max_speed || ''} onChange={(e) => setField('pursuit_max_speed', e.target.value)} className={inputCls} /></Fld>
                    <Fld label="Outcome" span={2}><input value={fields.pursuit_outcome || ''} onChange={(e) => setField('pursuit_outcome', e.target.value)} className={inputCls} /></Fld>
                  </div>
                )}

                {fields.bwc_active && (
                  <Fld label="BWC Notes">
                    <input value={fields.bwc_notes || ''} onChange={(e) => setField('bwc_notes', e.target.value)} className={inputCls} />
                  </Fld>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </ReportShell>
  );
}
