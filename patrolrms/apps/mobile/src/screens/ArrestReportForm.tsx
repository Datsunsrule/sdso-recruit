import ReportShell from '../components/ReportShell';
import { SectionLabel, Fld, SpeechTextarea, inputCls, selectCls, MultiSelect } from '../components/ui';
import { OFFICERS } from '../types';

export default function ArrestReportForm() {
  return (
    <ReportShell title="Arrest Report" icon="🔒" reportType="arrest">
      {(fields, setField) => (
        <div className="flex flex-col gap-1">

          <SectionLabel title="Routing" />
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Case Number"><input readOnly value={fields.case_number || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Report Date"><input readOnly value={fields.report_date || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Report Time"><input readOnly value={fields.report_time || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Arrest Date"><input type="date" value={fields.arrest_date || ''} onChange={(e) => setField('arrest_date', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Arrest Time"><input type="time" value={fields.arrest_time || ''} onChange={(e) => setField('arrest_time', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Arrest Type">
              <select value={fields.arrest_type || ''} onChange={(e) => setField('arrest_type', e.target.value)} className={selectCls}>
                <option value="">—</option><option>On-View</option><option>Warrant</option><option>Citizen's</option>
              </select>
            </Fld>
            <Fld label="Arrest Location" span={2}><input value={fields.arrest_location || ''} onChange={(e) => setField('arrest_location', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Arrest City"><input value={fields.arrest_city || ''} onChange={(e) => setField('arrest_city', e.target.value)} className={inputCls} /></Fld>
            <Fld label="State"><input value={fields.arrest_state || 'CA'} onChange={(e) => setField('arrest_state', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Book Date"><input type="date" value={fields.book_date || ''} onChange={(e) => setField('book_date', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Book Time"><input type="time" value={fields.book_time || ''} onChange={(e) => setField('book_time', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Book Location"><input value={fields.book_location || ''} onChange={(e) => setField('book_location', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Booking Number"><input value={fields.booking_number || ''} onChange={(e) => setField('booking_number', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Transport Method">
              <select value={fields.transport_method || ''} onChange={(e) => setField('transport_method', e.target.value)} className={selectCls}>
                <option value="">—</option><option>Patrol Unit</option><option>Transport Van</option><option>Ambulance</option><option>Other</option>
              </select>
            </Fld>
            <Fld label="Station"><input readOnly value={fields.station || ''} className={inputCls + ' opacity-60'} /></Fld>
          </div>

          <SectionLabel title="Officers" />
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Arresting Officer"><input readOnly value={fields.reporting_officer || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Badge"><input readOnly value={fields.badge_number || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Assisting Officers" span={2}>
              <MultiSelect options={OFFICERS} value={fields.assisting_officers || []} onChange={(v) => setField('assisting_officers', v)} />
            </Fld>
            <Fld label="Supervisor" span={2}><input value={fields.supervisor || ''} onChange={(e) => setField('supervisor', e.target.value)} className={inputCls} /></Fld>
          </div>

          <SectionLabel title="Arrestee Information" />
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Name"><input value={fields.arrestee_name || ''} onChange={(e) => setField('arrestee_name', e.target.value)} className={inputCls} /></Fld>
            <Fld label="DOB"><input type="date" value={fields.arrestee_dob || ''} onChange={(e) => setField('arrestee_dob', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Age"><input type="number" value={fields.arrestee_age || ''} onChange={(e) => setField('arrestee_age', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Sex">
              <select value={fields.arrestee_sex || ''} onChange={(e) => setField('arrestee_sex', e.target.value)} className={selectCls}>
                <option value="">—</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </Fld>
            <Fld label="Race">
              <select value={fields.arrestee_race || ''} onChange={(e) => setField('arrestee_race', e.target.value)} className={selectCls}>
                <option value="">—</option>
                {['White','Hispanic','Black','Asian','Pacific Islander','American Indian','Other','Unknown'].map(r => <option key={r}>{r}</option>)}
              </select>
            </Fld>
            <Fld label="SSN"><input value={fields.ssn || ''} onChange={(e) => setField('ssn', e.target.value)} className={inputCls} type="password" placeholder="XXX-XX-XXXX" /></Fld>
            <Fld label="Driver License"><input value={fields.dl_number || ''} onChange={(e) => setField('dl_number', e.target.value)} className={inputCls} /></Fld>
            <Fld label="DL State"><input value={fields.dl_state || 'CA'} onChange={(e) => setField('dl_state', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Height"><input value={fields.height || ''} onChange={(e) => setField('height', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Weight"><input value={fields.weight || ''} onChange={(e) => setField('weight', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Hair"><input value={fields.hair || ''} onChange={(e) => setField('hair', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Eyes"><input value={fields.eyes || ''} onChange={(e) => setField('eyes', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Build"><input value={fields.build || ''} onChange={(e) => setField('build', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Complexion"><input value={fields.complexion || ''} onChange={(e) => setField('complexion', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Tattoos / Marks" span={2}><input value={fields.tattoos || ''} onChange={(e) => setField('tattoos', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Scars" span={2}><input value={fields.scars || ''} onChange={(e) => setField('scars', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Address" span={2}><input value={fields.arrestee_address || ''} onChange={(e) => setField('arrestee_address', e.target.value)} className={inputCls} /></Fld>
            <Fld label="City"><input value={fields.arrestee_city || ''} onChange={(e) => setField('arrestee_city', e.target.value)} className={inputCls} /></Fld>
            <Fld label="State / ZIP"><input value={fields.arrestee_state_zip || ''} onChange={(e) => setField('arrestee_state_zip', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Phone"><input value={fields.arrestee_phone || ''} onChange={(e) => setField('arrestee_phone', e.target.value)} className={inputCls} inputMode="tel" /></Fld>
            <Fld label="Employer"><input value={fields.employer || ''} onChange={(e) => setField('employer', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Prior Arrests">
              <select value={fields.prior_arrests || ''} onChange={(e) => setField('prior_arrests', e.target.value)} className={selectCls}>
                <option value="">—</option><option>Unknown</option><option>None</option><option>Misdemeanor</option><option>Felony</option>
              </select>
            </Fld>
            <Fld label="Gang Affiliation"><input value={fields.gang_affiliation || ''} onChange={(e) => setField('gang_affiliation', e.target.value)} className={inputCls} /></Fld>
          </div>

          <SectionLabel title="Property Seized" />
          <SpeechTextarea value={fields.property_seized || ''} onChange={(v) => setField('property_seized', v)} minHeight={80} />

          <SectionLabel title="Vehicle Information" />
          <input value={fields.vehicle_info || ''} onChange={(e) => setField('vehicle_info', e.target.value)} className={inputCls} placeholder="Year / Make / Model / Color / Plate" />

          <SectionLabel title="Narrative" />
          <SpeechTextarea value={fields.narrative || ''} onChange={(v) => setField('narrative', v)} minHeight={150} />

          <SectionLabel title="Conditions of Release" />
          <input value={fields.conditions_of_release || ''} onChange={(e) => setField('conditions_of_release', e.target.value)} className={inputCls} />

          <SectionLabel title="Disposition" />
          <select value={fields.disposition || ''} onChange={(e) => setField('disposition', e.target.value)} className={selectCls}>
            <option value="">—</option>
            {['Booked','Cited & Released','Juvenile Referral','OR Release'].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      )}
    </ReportShell>
  );
}
