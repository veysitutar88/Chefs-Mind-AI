import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function main() {
    try {
        const rows = await sql`SELECT * FROM drizzle.__drizzle_migrations`;
        console.log('Existing migrations:', rows);
    } catch (e) {
        console.error('Error reading migrations:', e);
    } finally {
        await sql.end();
    }
}

main();
