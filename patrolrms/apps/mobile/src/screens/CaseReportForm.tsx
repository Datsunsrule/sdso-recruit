import ReportShell from '../components/ReportShell';
import { SectionLabel, Fld, SpeechTextarea, inputCls, selectCls, MultiSelect } from '../components/ui';
import { OFFICERS } from '../types';

export default function CaseReportForm() {
  return (
    <ReportShell title="Case / Incident Report" icon="📋" reportType="case">
      {(fields, setField) => (
        <div className="flex flex-col gap-1">

          <SectionLabel title="Routing" />
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Case Number"><input readOnly value={fields.case_number || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Report Date"><input readOnly value={fields.report_date || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Report Time"><input readOnly value={fields.report_time || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Incident Date"><input type="date" value={fields.incident_date || ''} onChange={(e) => setField('incident_date', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Incident Time"><input type="time" value={fields.incident_time || ''} onChange={(e) => setField('incident_time', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Crime Type"><input readOnly value={fields.crime_type || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Beat"><input value={fields.beat || ''} onChange={(e) => setField('beat', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Station"><input readOnly value={fields.station || ''} className={inputCls + ' opacity-60'} /></Fld>
          </div>

          <SectionLabel title="Incident Location" />
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Location" span={2}><input value={fields.incident_location || ''} onChange={(e) => setField('incident_location', e.target.value)} className={inputCls} placeholder="Street address or description" /></Fld>
            <Fld label="City"><input value={fields.city || ''} onChange={(e) => setField('city', e.target.value)} className={inputCls} /></Fld>
            <Fld label="State"><input value={fields.state || ''} onChange={(e) => setField('state', e.target.value)} className={inputCls} defaultValue="CA" /></Fld>
            <Fld label="ZIP"><input value={fields.zip || ''} onChange={(e) => setField('zip', e.target.value)} className={inputCls} inputMode="numeric" /></Fld>
          </div>

          <SectionLabel title="Officers" />
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Reporting Officer"><input readOnly value={fields.reporting_officer || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Badge / ID"><input readOnly value={fields.badge_number || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Assisting Officers" span={2}>
              <MultiSelect options={OFFICERS} value={fields.assisting_officers || []} onChange={(v) => setField('assisting_officers', v)} placeholder="None" />
            </Fld>
            <Fld label="Supervisor" span={2}><input value={fields.supervisor || ''} onChange={(e) => setField('supervisor', e.target.value)} className={inputCls} /></Fld>
          </div>

          <SectionLabel title="Victim Information" />
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Name"><input value={fields.victim_name || ''} onChange={(e) => setField('victim_name', e.target.value)} className={inputCls} /></Fld>
            <Fld label="DOB"><input type="date" value={fields.victim_dob || ''} onChange={(e) => setField('victim_dob', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Phone"><input value={fields.victim_phone || ''} onChange={(e) => setField('victim_phone', e.target.value)} className={inputCls} inputMode="tel" /></Fld>
            <Fld label="Address"><input value={fields.victim_address || ''} onChange={(e) => setField('victim_address', e.target.value)} className={inputCls} /></Fld>
          </div>

          <SectionLabel title="Suspect Information" />
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Name"><input value={fields.suspect_name || ''} onChange={(e) => setField('suspect_name', e.target.value)} className={inputCls} /></Fld>
            <Fld label="DOB"><input type="date" value={fields.suspect_dob || ''} onChange={(e) => setField('suspect_dob', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Race">
              <select value={fields.suspect_race || ''} onChange={(e) => setField('suspect_race', e.target.value)} className={selectCls}>
                <option value="">—</option>
                {['White','Hispanic','Black','Asian','Pacific Islander','American Indian','Other','Unknown'].map(r => <option key={r}>{r}</option>)}
              </select>
            </Fld>
            <Fld label="Sex">
              <select value={fields.suspect_sex || ''} onChange={(e) => setField('suspect_sex', e.target.value)} className={selectCls}>
                <option value="">—</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </Fld>
            <Fld label="Height"><input value={fields.suspect_height || ''} onChange={(e) => setField('suspect_height', e.target.value)} className={inputCls} placeholder='e.g. 5&apos;10"' /></Fld>
            <Fld label="Weight"><input value={fields.suspect_weight || ''} onChange={(e) => setField('suspect_weight', e.target.value)} className={inputCls} placeholder="lbs" /></Fld>
            <Fld label="Hair"><input value={fields.suspect_hair || ''} onChange={(e) => setField('suspect_hair', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Eyes"><input value={fields.suspect_eyes || ''} onChange={(e) => setField('suspect_eyes', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Address" span={2}><input value={fields.suspect_address || ''} onChange={(e) => setField('suspect_address', e.target.value)} className={inputCls} /></Fld>
          </div>

          <SectionLabel title="Narrative" />
          <SpeechTextarea value={fields.narrative || ''} onChange={(v) => setField('narrative', v)} placeholder="Describe the incident in detail…" minHeight={150} />

          <SectionLabel title="Evidence / Property" />
          <SpeechTextarea value={fields.evidence_notes || ''} onChange={(v) => setField('evidence_notes', v)} placeholder="List any evidence or property collected…" minHeight={80} />

          <SectionLabel title="Charges / Disposition" />
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Charges" span={2}><input value={fields.charges || ''} onChange={(e) => setField('charges', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Disposition" span={2}>
              <select value={fields.disposition || ''} onChange={(e) => setField('disposition', e.target.value)} className={selectCls}>
                <option value="">—</option>
                {['Open','Active','Closed','Referred','Unfounded'].map(d => <option key={d}>{d}</option>)}
              </select>
            </Fld>
          </div>
        </div>
      )}
    </ReportShell>
  );
}
