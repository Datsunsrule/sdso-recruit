import Knex from 'knex';
import path from 'path';

export const db = Knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: path.join(__dirname, '../../migrations'),
    extension: 'ts',
  },
  seeds: {
    directory: path.join(__dirname, '../../seeds'),
  },
  pool: { min: 2, max: 10 },
});

export async function setTenantSchema(schema: string) {
  await db.raw(`SET search_path = ?`, [schema]);
}

export async function withTenant<T>(schema: string, fn: () => Promise<T>): Promise<T> {
  await db.raw(`SET search_path = ??`, [schema]);
  try {
    return await fn();
  } finally {
    await db.raw(`SET search_path = public`);
  }
}
