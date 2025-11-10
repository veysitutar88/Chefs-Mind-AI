import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const runMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient);
  console.log('Running database migrations...');
  await migrate(db, { migrationsFolder: 'migrations' });
  console.log('Migrations completed.');
  await migrationClient.end();
};

runMigrations().catch(err => {
  console.error(err);
  process.exit(1);
});
