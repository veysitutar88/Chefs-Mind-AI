import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function main() {
    try {
        console.log('Clearing mismatched migrations...');
        await sql`DELETE FROM drizzle.__drizzle_migrations`;

        console.log('Inserting journal migrations...');
        const migrations = [
            { when: 1761494410501, tag: '0000_special_anthem' },
            { when: 1731411600000, tag: '0001_update_calendar_links' },
            { when: 1731500000000, tag: '0002_create_suppliers' },
            { when: 1731600000000, tag: '0003_create_orders' },
            { when: 1731700000000, tag: '0004_create_media_assets' }
        ];

        for (const m of migrations) {
            await sql`
        INSERT INTO drizzle.__drizzle_migrations (created_at, hash)
        VALUES (${m.when}, 'manual_sync_placeholder')
      `;
            console.log(`Inserted ${m.tag}`);
        }

        console.log('Done. Now run npm run db:migrate');
    } catch (e) {
        console.error('Error fixing migrations:', e);
    } finally {
        await sql.end();
    }
}

main();
