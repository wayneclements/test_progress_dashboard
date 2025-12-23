const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    const result = await client.query('SELECT * FROM projects ORDER BY id')
    
    if (result.rows.length === 0) {
      console.log('No rows found in projects table.')
    } else {
      console.log(`\nFound ${result.rows.length} row(s) in projects table:\n`)
      result.rows.forEach((row, idx) => {
        console.log(`Row ${idx + 1}:`)
        console.log(`  id: ${row.id}`)
        console.log(`  name: ${row.name}`)
        console.log(`  description: ${row.description}`)
        console.log(`  created_at: ${row.created_at}`)
        console.log(`  updated_at: ${row.updated_at}`)
        console.log()
      })
    }
    
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('Error querying rows:', err.message || err)
    try { await client.end() } catch (_) {}
    process.exit(1)
  }
}

main()
