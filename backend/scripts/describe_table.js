const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const tableName = process.argv[2] || 'projects'

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName])
    
    if (result.rows.length === 0) {
      console.log(`Table "${tableName}" not found or has no columns.`)
    } else {
      console.log(`\nColumns in table "${tableName}":`)
      console.log('─'.repeat(80))
      result.rows.forEach(row => {
        const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
        const defaultVal = row.column_default ? ` DEFAULT ${row.column_default}` : ''
        console.log(`${row.column_name.padEnd(20)} | ${row.data_type.padEnd(15)} | ${nullable.padEnd(10)}${defaultVal}`)
      })
      console.log('─'.repeat(80))
    }
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message || err)
    try { await client.end() } catch (_) {}
    process.exit(1)
  }
}

main()
