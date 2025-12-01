import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function main() {
    try {
        const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'followup_tasks'
    `;

        if (result.length > 0) {
            console.log('✅ Success: Table followup_tasks exists!');

            // Check columns
            const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'followup_tasks'
      `;
            console.log('Columns:', columns.map(c => `${c.column_name} (${c.data_type})`).join(', '));
        } else {
            console.error('❌ Error: Table followup_tasks does NOT exist.');
        }
    } catch (e) {
        console.error('Error verifying table:', e);
    } finally {
        await sql.end();
    }
}

main();
