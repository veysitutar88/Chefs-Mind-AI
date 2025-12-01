import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const sql = postgres(process.env.DATABASE_URL);

async function main() {
    try {
        const migrationFile = 'drizzle/migrations/0005_create_followup_tasks.sql';
        console.log(`Reading ${migrationFile}...`);
        const content = fs.readFileSync(migrationFile, 'utf-8');

        console.log('Executing SQL...');
        // Split by statement if needed, but postgres.js might handle multiple statements
        // simple() is better for multiple statements
        await sql.unsafe(content);

        console.log('Table created. Updating migration history...');
        // Insert record for 0005
        // Timestamp from journal: 1733011200000
        await sql`
      INSERT INTO drizzle.__drizzle_migrations (created_at, hash)
      VALUES (1733011200000, 'manual_apply_0005')
    `;

        console.log('✅ Migration 0005 applied successfully.');
    } catch (e) {
        console.error('❌ Error applying migration:', e);
    } finally {
        await sql.end();
    }
}

main();
