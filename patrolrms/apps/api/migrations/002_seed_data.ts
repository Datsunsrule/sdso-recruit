import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

const slug = 'default_agency';

const LOCATIONS = [
  { code: 'RSB', label: 'Roseburg Office', type: 'Patrol Station' },
  { code: 'SPR', label: 'Springfield Office', type: 'Patrol Station' },
  { code: 'MOR', label: 'Morriston Sub-Station', type: 'Sub-Station' },
  { code: 'RCJ', label: 'Roseburg County Jail', type: 'Correctional Facility' },
  { code: 'JHN', label: 'Johnstown Office', type: 'Patrol Station' },
  { code: 'AHQ', label: 'Agency Headquarters', type: 'Administrative' },
];

const OFFICERS = [
  { badge: 'D001', name: 'Dep. A. Cross', rank: 'Deputy', role: 'officer', pin: '1234' },
  { badge: 'D002', name: 'Dep. C. Holt', rank: 'Deputy', role: 'officer', pin: '1234' },
  { badge: 'D003', name: 'Dep. J. Ramos', rank: 'Deputy', role: 'officer', pin: '1234' },
  { badge: 'D004', name: 'Dep. K. Daniels', rank: 'Deputy', role: 'officer', pin: '1234' },
  { badge: 'D005', name: 'Dep. P. Garrett', rank: 'Deputy', role: 'officer', pin: '1234' },
  { badge: 'D006', name: 'Dep. S. Liu', rank: 'Deputy', role: 'officer', pin: '1234' },
  { badge: 'D007', name: 'Dep. T. Webb', rank: 'Deputy', role: 'officer', pin: '1234' },
  { badge: 'C001', name: 'Cpl. M. Torres', rank: 'Corporal', role: 'officer', pin: '1234' },
  { badge: 'C002', name: 'Cpl. R. Harmon', rank: 'Corporal', role: 'officer', pin: '1234' },
  { badge: 'C003', name: 'Cpl. J. Bradford', rank: 'Corporal', role: 'supervisor', pin: '1234' },
  { badge: 'S001', name: 'Sgt. B. Okafor', rank: 'Sergeant', role: 'supervisor', pin: '1234' },
  { badge: 'ADMIN', name: 'Administrator', rank: 'Lieutenant', role: 'admin', pin: '0000' },
];

export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET search_path = public');

  const agencyExists = await knex('agencies').where({ slug }).first();
  if (!agencyExists) {
    await knex('agencies').insert({
      slug,
      name: "San Clemente Sheriff's Office",
      tier: 'standard',
    });
  }

  await knex.raw('SET search_path = ??', [slug]);

  const locCount = await knex('locations').count('* as c').first();
  if (Number(locCount?.c) === 0) {
    await knex('locations').insert(LOCATIONS);
  }

  const spr = await knex('locations').where({ code: 'SPR' }).first();

  for (const o of OFFICERS) {
    const exists = await knex('users').where({ badge_number: o.badge }).first();
    if (!exists) {
      const pin_hash = await bcrypt.hash(o.pin, 12);
      await knex('users').insert({
        badge_number: o.badge,
        pin_hash,
        full_name: o.name,
        rank: o.rank,
        role: o.role,
        default_location: spr?.id,
      });
    }
  }

  await knex.raw('SET search_path = public');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET search_path = ??', [slug]);
  await knex('users').whereIn('badge_number', OFFICERS.map((o) => o.badge)).delete();
  await knex('locations').whereIn('code', LOCATIONS.map((l) => l.code)).delete();
  await knex.raw('SET search_path = public');
  await knex('agencies').where({ slug }).delete();
}
