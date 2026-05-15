import ReportShell from '../components/ReportShell';
import { SectionLabel, Fld, SpeechTextarea, inputCls } from '../components/ui';

const TOW_REASONS = ['Accident','Abandoned','Stolen Recovery','Arrest','Parking','Mechanical','Evidence Hold','Other'];

export default function TowImpoundForm() {
  return (
    <ReportShell title="Tow / Impound Report" icon="🚛" reportType="tow">
      {(fields, setField) => (
        <div className="flex flex-col gap-1">

          <SectionLabel title="Routing" />
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Report Number"><input readOnly value={fields.report_number || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Case Number"><input readOnly value={fields.case_number || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Report Date"><input readOnly value={fields.report_date || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Report Time"><input readOnly value={fields.report_time || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Tow Date"><input type="date" value={fields.tow_date || ''} onChange={(e) => setField('tow_date', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Tow Time"><input type="time" value={fields.tow_time || ''} onChange={(e) => setField('tow_time', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Requesting Officer"><input readOnly value={fields.reporting_officer || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Badge"><input readOnly value={fields.badge_number || ''} className={inputCls + ' opacity-60'} /></Fld>
            <Fld label="Station"><input readOnly value={fields.station || ''} className={inputCls + ' opacity-60'} /></Fld>
          </div>

          <SectionLabel title="Vehicle" />
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Year"><input value={fields.veh_year || ''} onChange={(e) => setField('veh_year', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Make"><input value={fields.veh_make || ''} onChange={(e) => setField('veh_make', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Model"><input value={fields.veh_model || ''} onChange={(e) => setField('veh_model', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Color"><input value={fields.veh_color || ''} onChange={(e) => setField('veh_color', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Plate #"><input value={fields.veh_plate || ''} onChange={(e) => setField('veh_plate', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Plate State"><input value={fields.veh_plate_state || 'CA'} onChange={(e) => setField('veh_plate_state', e.target.value)} className={inputCls} /></Fld>
            <Fld label="VIN" span={2}><input value={fields.vin || ''} onChange={(e) => setField('vin', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Reg. Owner Name" span={2}><input value={fields.owner_name || ''} onChange={(e) => setField('owner_name', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Owner Address" span={2}><input value={fields.owner_address || ''} onChange={(e) => setField('owner_address', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Owner Phone"><input value={fields.owner_phone || ''} onChange={(e) => setField('owner_phone', e.target.value)} className={inputCls} inputMode="tel" /></Fld>
            <Fld label="Reg. State"><input value={fields.reg_state || 'CA'} onChange={(e) => setField('reg_state', e.target.value)} className={inputCls} /></Fld>
          </div>

          <SectionLabel title="Tow Details" />
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Tow Company" span={2}><input value={fields.tow_company || ''} onChange={(e) => setField('tow_company', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Driver Name"><input value={fields.driver_name || ''} onChange={(e) => setField('driver_name', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Driver License"><input value={fields.driver_license || ''} onChange={(e) => setField('driver_license', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Truck #"><input value={fields.truck_number || ''} onChange={(e) => setField('truck_number', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Release Auth."><input value={fields.release_auth || ''} onChange={(e) => setField('release_auth', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Release Time"><input type="time" value={fields.release_time || ''} onChange={(e) => setField('release_time', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Storage Location" span={2}><input value={fields.storage_location || ''} onChange={(e) => setField('storage_location', e.target.value)} className={inputCls} /></Fld>
            <Fld label="Storage Address" span={2}><input value={fields.storage_address || ''} onChange={(e) => setField('storage_address', e.target.value)} className={inputCls} /></Fld>
          </div>

          <SectionLabel title="Reason for Tow" />
          <div className="grid grid-cols-2 gap-2">
            {TOW_REASONS.map((reason) => {
              const key = `tow_reason_${reason.toLowerCase().replace(/[^a-z]/g, '_')}`;
              return (
                <label key={reason} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!fields[key]}
                    onChange={(e) => setField(key, e.target.checked)}
                    className="w-4 h-4 accent-accent"
                  />
                  <span className="text-sm text-text">{reason}</span>
                </label>
              );
            })}
          </div>

          <SectionLabel title="Vehicle Condition" />
          <SpeechTextarea value={fields.vehicle_condition || ''} onChange={(v) => setField('vehicle_condition', v)} minHeight={80} />

          <SectionLabel title="Notes / Disposition" />
          <SpeechTextarea value={fields.notes || ''} onChange={(v) => setField('notes', v)} minHeight={80} />
        </div>
      )}
    </ReportShell>
  );
}
