import 'dotenv/config';
import type { Knex } from 'knex';
import path from 'path';

const config: Knex.Config = {
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgresql://patrolrms:patrolrms_dev@localhost:5432/patrolrms',
  migrations: {
    directory: path.join(__dirname, 'migrations'),
    extension: 'ts',
  },
  seeds: {
    directory: path.join(__dirname, 'seeds'),
  },
};

export default config;
