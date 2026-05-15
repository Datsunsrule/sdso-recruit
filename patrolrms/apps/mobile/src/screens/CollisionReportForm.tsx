import { useState } from 'react';
import ReportShell from '../components/ReportShell';
import { SectionLabel, Fld, SpeechTextarea, inputCls, selectCls, TabBar } from '../components/ui';

export default function CollisionReportForm() {
  const [tab, setTab] = useState('Location');

  return (
    <ReportShell title="Traffic Collision Report" icon="🚗" reportType="collision">
      {(fields, setField) => (
        <div className="flex flex-col gap-1 -mx-4 -mt-4">
          <TabBar tabs={['Location', 'Parties', 'Collision', 'Conditions', 'Narrative']} active={tab} onChange={setTab} />
          <div className="px-4 pt-4">

            {tab === 'Location' && (
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Report Number"><input readOnly value={fields.report_number || ''} className={inputCls + ' opacity-60'} /></Fld>
                <Fld label="Case Number"><input readOnly value={fields.case_number || ''} className={inputCls + ' opacity-60'} /></Fld>
                <Fld label="Report Date"><input readOnly value={fields.report_date || ''} className={inputCls + ' opacity-60'} /></Fld>
                <Fld label="Report Time"><input readOnly value={fields.report_time || ''} className={inputCls + ' opacity-60'} /></Fld>
                <Fld label="Collision Date"><input type="date" value={fields.collision_date || ''} onChange={(e) => setField('collision_date', e.target.value)} className={inputCls} /></Fld>
                <Fld label="Collision Time"><input type="time" value={fields.collision_time || ''} onChange={(e) => setField('collision_time', e.target.value)} className={inputCls} /></Fld>
                <Fld label="Reporting Officer"><input readOnly value={fields.reporting_officer || ''} className={inputCls + ' opacity-60'} /></Fld>
                <Fld label="Badge"><input readOnly value={fields.badge_number || ''} className={inputCls + ' opacity-60'} /></Fld>
                <Fld label="NCIC ORI"><input value={fields.ncic_ori || ''} onChange={(e) => setField('ncic_ori', e.target.value)} className={inputCls} /></Fld>
                <Fld label="Jurisdiction"><input value={fields.jurisdiction || ''} onChange={(e) => setField('jurisdiction', e.target.value)} className={inputCls} /></Fld>
                <Fld label="Beat"><input value={fields.beat || ''} onChange={(e) => setField('beat', e.target.value)} className={inputCls} /></Fld>
                <Fld label="County"><input value={fields.county || ''} onChange={(e) => setField('county', e.target.value)} className={inputCls} /></Fld>
                <Fld label="City" span={2}><input value={fields.city || ''} onChange={(e) => setField('city', e.target.value)} className={inputCls} /></Fld>
                <Fld label="Primary Road" span={2}><input value={fields.primary_road || ''} onChange={(e) => setField('primary_road', e.target.value)} className={inputCls} /></Fld>
                <Fld label="Cross Street" span={2}><input value={fields.cross_street || ''} onChange={(e) => setField('cross_street', e.target.value)} className={inputCls} /></Fld>
                <Fld label="Intersection?">
                  <select value={fields.is_intersection || ''} onChange={(e) => setField('is_intersection', e.target.value)} className={selectCls}>
                    <option value="">—</option><option>Yes</option><option>No</option>
                  </select>
                </Fld>
                <Fld label="Feet from Int."><input type="number" value={fields.feet_from_intersection || ''} onChange={(e) => setField('feet_from_intersection', e.target.value)} className={inputCls} /></Fld>
                <Fld label="Direction"><input value={fields.direction || ''} onChange={(e) => setField('direction', e.target.value)} className={inputCls} placeholder="N/S/E/W" /></Fld>
                <Fld label="GPS Lat"><input value={fields.gps_lat || ''} onChange={(e) => setField('gps_lat', e.target.value)} className={inputCls} /></Fld>
                <Fld label="GPS Lng"><input value={fields.gps_lng || ''} onChange={(e) => setField('gps_lng', e.target.value)} className={inputCls} /></Fld>
              </div>
            )}

            {tab === 'Parties' && (
              <div className="flex flex-col gap-4">
                {[1, 2].map((n) => (
                  <div key={n}>
                    <SectionLabel title={`Party ${n}`} />
                    <div className="grid grid-cols-2 gap-3">
                      <Fld label="Name"><input value={fields[`p${n}_name`] || ''} onChange={(e) => setField(`p${n}_name`, e.target.value)} className={inputCls} /></Fld>
                      <Fld label="DOB"><input type="date" value={fields[`p${n}_dob`] || ''} onChange={(e) => setField(`p${n}_dob`, e.target.value)} className={inputCls} /></Fld>
                      <Fld label="Sex">
                        <select value={fields[`p${n}_sex`] || ''} onChange={(e) => setField(`p${n}_sex`, e.target.value)} className={selectCls}>
                          <option value="">—</option><option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </Fld>
                      <Fld label="Race"><input value={fields[`p${n}_race`] || ''} onChange={(e) => setField(`p${n}_race`, e.target.value)} className={inputCls} /></Fld>
                      <Fld label="Phone"><input value={fields[`p${n}_phone`] || ''} onChange={(e) => setField(`p${n}_phone`, e.target.value)} className={inputCls} /></Fld>
                      <Fld label="Address"><input value={fields[`p${n}_address`] || ''} onChange={(e) => setField(`p${n}_address`, e.target.value)} className={inputCls} /></Fld>
                      <Fld label="DL #"><input value={fields[`p${n}_dl`] || ''} onChange={(e) => setField(`p${n}_dl`, e.target.value)} className={inputCls} /></Fld>
                      <Fld label="DL State"><input value={fields[`p${n}_dl_state`] || 'CA'} onChange={(e) => setField(`p${n}_dl_state`, e.target.value)} className={inputCls} /></Fld>
                      <Fld label="Insurance" span={2}><input value={fields[`p${n}_insurance`] || ''} onChange={(e) => setField(`p${n}_insurance`, e.target.value)} className={inputCls} /></Fld>
                      <SectionLabel title={`Party ${n} Vehicle`} />
                      <Fld label="Year"><input value={fields[`p${n}_veh_year`] || ''} onChange={(e) => setField(`p${n}_veh_year`, e.target.value)} className={inputCls} /></Fld>
                      <Fld label="Make"><input value={fields[`p${n}_veh_make`] || ''} onChange={(e) => setField(`p${n}_veh_make`, e.target.value)} className={inputCls} /></Fld>
                      <Fld label="Model"><input value={fields[`p${n}_veh_model`] || ''} onChange={(e) => setField(`p${n}_veh_model`, e.target.value)} className={inputCls} /></Fld>
                      <Fld label="Color"><input value={fields[`p${n}_veh_color`] || ''} onChange={(e) => setField(`p${n}_veh_color`, e.target.value)} className={inputCls} /></Fld>
                      <Fld label="Plate"><input value={fields[`p${n}_veh_plate`] || ''} onChange={(e) => setField(`p${n}_veh_plate`, e.target.value)} className={inputCls} /></Fld>
                      <Fld label="Plate State"><input value={fields[`p${n}_veh_plate_state`] || 'CA'} onChange={(e) => setField(`p${n}_veh_plate_state`, e.target.value)} className={inputCls} /></Fld>
                      <Fld label="Injuries" span={2}>
                        <select value={fields[`p${n}_injuries`] || ''} onChange={(e) => setField(`p${n}_injuries`, e.target.value)} className={selectCls}>
                          <option value="">—</option><option>None</option><option>Complaint</option><option>Visible</option><option>Severe</option><option>Fatal</option>
                        </select>
                      </Fld>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'Collision' && (
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Collision Type" span={2}>
                  <select value={fields.collision_type || ''} onChange={(e) => setField('collision_type', e.target.value)} className={selectCls}>
                    <option value="">—</option>
                    {['Rear End','Head On','Sideswipe','Broadside','Hit Object','Overturned','Vehicle/Pedestrian'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </Fld>
                <Fld label="Collision Manner" span={2}><input value={fields.collision_manner || ''} onChange={(e) => setField('collision_manner', e.target.value)} className={inputCls} /></Fld>
                <Fld label="PCF Party #"><input type="number" value={fields.pcf_party || ''} onChange={(e) => setField('pcf_party', e.target.value)} className={inputCls} /></Fld>
                <Fld label="PCF Violation Code"><input value={fields.pcf_code || ''} onChange={(e) => setField('pcf_code', e.target.value)} className={inputCls} /></Fld>
                <Fld label="PCF Category" span={2}><input value={fields.pcf_category || ''} onChange={(e) => setField('pcf_category', e.target.value)} className={inputCls} placeholder="A–H" /></Fld>
                <Fld label="PCF Violation Description" span={2}><input value={fields.pcf_description || ''} onChange={(e) => setField('pcf_description', e.target.value)} className={inputCls} /></Fld>
                <Fld label="Other Factor 1" span={2}><input value={fields.other_factor_1 || ''} onChange={(e) => setField('other_factor_1', e.target.value)} className={inputCls} /></Fld>
                <Fld label="Other Factor 2" span={2}><input value={fields.other_factor_2 || ''} onChange={(e) => setField('other_factor_2', e.target.value)} className={inputCls} /></Fld>
                {['Hit & Run', 'School Bus Involved', 'Alcohol/Drug Involved'].map((lbl) => {
                  const key = lbl.toLowerCase().replace(/[^a-z]/g, '_');
                  return (
                    <Fld key={lbl} label={lbl}>
                      <select value={fields[key] || ''} onChange={(e) => setField(key, e.target.value)} className={selectCls}>
                        <option value="">—</option><option>Yes</option><option>No</option>
                      </select>
                    </Fld>
                  );
                })}
                <Fld label="Overall Severity" span={2}>
                  <select value={fields.overall_severity || ''} onChange={(e) => setField('overall_severity', e.target.value)} className={selectCls}>
                    <option value="">—</option>
                    {['PDO','Injury – Complaint','Injury – Visible','Injury – Severe','Fatal'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </Fld>
                <Fld label="Killed"><input type="number" value={fields.killed || ''} onChange={(e) => setField('killed', e.target.value)} className={inputCls} /></Fld>
                <Fld label="Injured Severe"><input type="number" value={fields.injured_severe || ''} onChange={(e) => setField('injured_severe', e.target.value)} className={inputCls} /></Fld>
                <Fld label="Injured Other"><input type="number" value={fields.injured_other || ''} onChange={(e) => setField('injured_other', e.target.value)} className={inputCls} /></Fld>
                <Fld label="Injured Complaint"><input type="number" value={fields.injured_complaint || ''} onChange={(e) => setField('injured_complaint', e.target.value)} className={inputCls} /></Fld>
              </div>
            )}

            {tab === 'Conditions' && (
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Lighting" span={2}>
                  <select value={fields.lighting || ''} onChange={(e) => setField('lighting', e.target.value)} className={selectCls}>
                    <option value="">—</option><option>Daylight</option><option>Dusk/Dawn</option><option>Dark Street Lights</option><option>Dark No Lights</option>
                  </select>
                </Fld>
                <Fld label="Weather" span={2}>
                  <select value={fields.weather || ''} onChange={(e) => setField('weather', e.target.value)} className={selectCls}>
                    <option value="">—</option><option>Clear</option><option>Cloudy</option><option>Raining</option><option>Snowing</option><option>Fog</option><option>Other</option>
                  </select>
                </Fld>
                <Fld label="Road Surface" span={2}>
                  <select value={fields.road_surface || ''} onChange={(e) => setField('road_surface', e.target.value)} className={selectCls}>
                    <option value="">—</option><option>Dry</option><option>Wet</option><option>Snowy</option><option>Icy</option><option>Slippery</option>
                  </select>
                </Fld>
                <Fld label="Road Condition" span={2}>
                  <select value={fields.road_condition || ''} onChange={(e) => setField('road_condition', e.target.value)} className={selectCls}>
                    <option value="">—</option><option>No Unusual Condition</option><option>Holes / Ruts</option><option>Loose Material</option><option>Construction</option><option>Flooded</option>
                  </select>
                </Fld>
                <Fld label="Road Type" span={2}>
                  <select value={fields.road_type || ''} onChange={(e) => setField('road_type', e.target.value)} className={selectCls}>
                    <option value="">—</option><option>Two-Lane</option><option>Multi-Lane Divided</option><option>Multi-Lane Undivided</option><option>One-Way</option><option>Freeway</option>
                  </select>
                </Fld>
                <Fld label="Lane Count"><input type="number" value={fields.lane_count || ''} onChange={(e) => setField('lane_count', e.target.value)} className={inputCls} /></Fld>
                <Fld label="Speed Limit"><input type="number" value={fields.speed_limit || ''} onChange={(e) => setField('speed_limit', e.target.value)} className={inputCls} /></Fld>
              </div>
            )}

            {tab === 'Narrative' && (
              <div className="flex flex-col gap-3">
                <SpeechTextarea value={fields.narrative || ''} onChange={(v) => setField('narrative', v)} label="Narrative" minHeight={200} />
                <div>
                  <label className="block text-[11px] font-bold tracking-wider uppercase text-textSub mb-1">Diagram Description</label>
                  <input value={fields.diagram_notes || ''} onChange={(e) => setField('diagram_notes', e.target.value)} className={inputCls} placeholder="Describe collision diagram / scene layout" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-wider uppercase text-textSub mb-1">Supervisor</label>
                  <input value={fields.supervisor || ''} onChange={(e) => setField('supervisor', e.target.value)} className={inputCls} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ReportShell>
  );
}
