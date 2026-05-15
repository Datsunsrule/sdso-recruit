export interface Agency {
  id: string;
  slug: string;
  name: string;
  logo_url?: string;
  tier: 'standard' | 'premium';
}

export interface User {
  id: string;
  badge_number: string;
  full_name: string;
  rank: string;
  role: 'officer' | 'supervisor' | 'admin';
  default_location?: string;
}

export interface Location {
  id: string;
  code: string;
  label: string;
  type?: string;
  active: boolean;
}

export interface Case {
  id: string;
  case_number: string;
  crime_type: string;
  status: 'Open' | 'Active' | 'Closed';
  priority: 'High' | 'Med' | 'Low';
  location_id: string;
  location_label?: string;
  assigned_officer_id?: string;
  officer_name?: string;
  incident_date?: string;
  incident_time?: string;
  created_at: string;
}

export type ReportType = 'case' | 'arrest' | 'property' | 'collision' | 'tow' | 'deputy' | 'digital';
export type ReportStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

export interface Report {
  id: string;
  case_id: string;
  report_type: ReportType;
  status: ReportStatus;
  submitted_by: string;
  reviewed_by?: string;
  review_notes?: string;
  submitted_at?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  fields?: Record<string, unknown>;
  report_number?: string;
  officer_name?: string;
  badge_number?: string;
  case_number?: string;
  crime_type?: string;
}

export interface EvidenceItem {
  id: string;
  report_id: string;
  item_number?: string;
  description?: string;
  quantity: number;
  category?: string;
  condition?: string;
  storage_loc?: string;
  collected_at?: string;
}

export interface EvidenceFile {
  id: string;
  report_id: string;
  filename: string;
  original_name?: string;
  mime_type?: string;
  file_size?: number;
  s3_url?: string;
  uploaded_at: string;
}

export interface CustodyEntry {
  id: string;
  evidence_id: string;
  action: string;
  from_person?: string;
  to_person?: string;
  location?: string;
  notes?: string;
  performed_at: string;
}

export interface QueueStats {
  pending: number;
  approved_today: number;
  rejected_today: number;
}

export const CRIME_TYPES = [
  '459 PC – Burglary',
  '245 PC – Aggravated Assault',
  '10851 VC – Vehicle Theft',
  '11350 HS – Possession Controlled Substance',
  '273.5 PC – Domestic Violence',
  '20001 VC – Hit & Run (Injury)',
  '243 PC – Battery',
  '594 PC – Vandalism',
  '211 PC – Robbery',
  '415 PC – Disturbing the Peace',
  '148 PC – Obstruction of Justice',
  '187 PC – Murder / Homicide',
  '207 PC – Kidnapping',
  '240 PC – Assault',
  '647 PC – Disorderly Conduct',
  '488 PC – Petty Theft',
  '484 PC – Theft',
  '487 PC – Grand Theft',
  '496 PC – Receiving Stolen Property',
  '11377 HS – Possession of Methamphetamine',
  '11357 HS – Possession of Marijuana',
  '11359 HS – Possession for Sale',
  '11360 HS – Transportation/Sale',
  '23152 VC – DUI Alcohol',
  '23153 VC – DUI with Injury',
  '23103 VC – Reckless Driving',
  '22350 VC – Unsafe Speed',
  '21453 VC – Red Light Violation',
  '12500 VC – Unlicensed Driver',
  '14601 VC – Suspended License',
  '16028 VC – No Proof of Insurance',
  '4000 VC – Unregistered Vehicle',
  '422 PC – Criminal Threats',
  '136.1 PC – Witness Intimidation',
  '518 PC – Extortion',
  '182 PC – Conspiracy',
  '236 PC – False Imprisonment',
  '278 PC – Child Abduction',
  '290 PC – Sex Offender Registration Violation',
  '314 PC – Indecent Exposure',
  '288 PC – Lewd Acts on Minor',
  '647.6 PC – Child Annoyance',
  '530.5 PC – Identity Theft',
  '502 PC – Unauthorized Computer Access',
  '4573 PC – Controlled Substance in Jail',
  '4550 PC – Escape',
];

export const OFFICERS = [
  'Dep. A. Cross', 'Dep. C. Holt', 'Dep. J. Ramos',
  'Dep. K. Daniels', 'Dep. P. Garrett', 'Dep. S. Liu',
  'Dep. T. Webb', 'Cpl. M. Torres', 'Cpl. R. Harmon',
  'Cpl. J. Bradford', 'Sgt. B. Okafor',
];
