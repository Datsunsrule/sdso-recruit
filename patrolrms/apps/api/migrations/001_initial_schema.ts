import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Public schema: agency registry
  await knex.schema.withSchema('public').createTableIfNotExists('agencies', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('slug').unique().notNullable();
    t.string('name').notNullable();
    t.string('logo_url');
    t.string('tier').defaultTo('standard');
    t.boolean('active').defaultTo(true);
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // Default agency schema
  const slug = process.env.DEFAULT_AGENCY_SLUG || 'default_agency';
  await knex.raw(`CREATE SCHEMA IF NOT EXISTS ??`, [slug]);
  await knex.raw(`SET search_path = ??`, [slug]);

  await knex.schema.createTableIfNotExists('locations', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('code').notNullable();
    t.string('label').notNullable();
    t.string('type');
    t.boolean('active').defaultTo(true);
  });

  await knex.schema.createTableIfNotExists('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('badge_number').unique().notNullable();
    t.string('pin_hash').notNullable();
    t.string('full_name').notNullable();
    t.string('rank').notNullable();
    t.string('role').notNullable().defaultTo('officer');
    t.uuid('default_location').references('id').inTable('locations').nullable();
    t.boolean('active').defaultTo(true);
    t.integer('failed_attempts').defaultTo(0);
    t.timestamp('last_login', { useTz: true }).nullable();
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  await knex.schema.createTableIfNotExists('cases', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('case_number').unique().notNullable();
    t.string('crime_type').notNullable();
    t.string('status').defaultTo('Open');
    t.string('priority').defaultTo('Med');
    t.uuid('location_id').references('id').inTable('locations').nullable();
    t.uuid('assigned_officer_id').references('id').inTable('users').nullable();
    t.date('incident_date').nullable();
    t.time('incident_time').nullable();
    t.uuid('created_by').references('id').inTable('users').nullable();
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    t.timestamp('deleted_at', { useTz: true }).nullable();
  });

  await knex.schema.createTableIfNotExists('reports', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('case_id').references('id').inTable('cases').onDelete('CASCADE');
    t.string('report_type').notNullable();
    t.string('status').defaultTo('Draft');
    t.uuid('submitted_by').references('id').inTable('users').nullable();
    t.uuid('reviewed_by').references('id').inTable('users').nullable();
    t.text('review_notes').nullable();
    t.timestamp('submitted_at', { useTz: true }).nullable();
    t.timestamp('reviewed_at', { useTz: true }).nullable();
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  await knex.schema.createTableIfNotExists('report_data', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('report_id').references('id').inTable('reports').onDelete('CASCADE').unique();
    t.jsonb('fields').notNullable().defaultTo('{}');
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  await knex.schema.createTableIfNotExists('evidence_items', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('report_id').references('id').inTable('reports').onDelete('CASCADE');
    t.string('item_number').nullable();
    t.text('description').nullable();
    t.integer('quantity').defaultTo(1);
    t.string('category').nullable();
    t.string('condition').nullable();
    t.uuid('collected_by').references('id').inTable('users').nullable();
    t.string('storage_loc').nullable();
    t.timestamp('collected_at', { useTz: true }).nullable();
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  await knex.schema.createTableIfNotExists('evidence_files', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('report_id').references('id').inTable('reports').onDelete('CASCADE');
    t.string('filename').notNullable();
    t.string('original_name').nullable();
    t.string('mime_type').nullable();
    t.bigInteger('file_size').nullable();
    t.string('s3_key').notNullable();
    t.string('s3_url').nullable();
    t.uuid('uploaded_by').references('id').inTable('users').nullable();
    t.timestamp('uploaded_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  await knex.schema.createTableIfNotExists('custody_log', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('evidence_id').references('id').inTable('evidence_items');
    t.string('action');
    t.string('from_person');
    t.string('to_person');
    t.string('location');
    t.text('notes');
    t.uuid('performed_by').references('id').inTable('users').nullable();
    t.timestamp('performed_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  await knex.schema.createTableIfNotExists('audit_log', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').references('id').inTable('users').nullable();
    t.string('action').notNullable();
    t.string('resource').nullable();
    t.uuid('resource_id').nullable();
    t.specificType('ip_address', 'inet').nullable();
    t.jsonb('details').nullable();
    t.timestamp('occurred_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  await knex.raw(`SET search_path = public`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP SCHEMA IF EXISTS default_agency CASCADE`);
  await knex.schema.withSchema('public').dropTableIfExists('agencies');
}
