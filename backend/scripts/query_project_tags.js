const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    const result = await client.query('SELECT * FROM project_tags ORDER BY id')
    
    if (result.rows.length === 0) {
      console.log('No rows found in project_tags table.')
    } else {
      console.log(`\nFound ${result.rows.length} row(s) in project_tags table:\n`)
      result.rows.forEach((row, idx) => {
        console.log(`Row ${idx + 1}:`)
        console.log(`  id: ${row.id}`)
        console.log(`  project_name: ${row.project_name}`)
        console.log(`  tag_id: ${row.tag_id}`)
        console.log(`  created_at: ${row.created_at}`)
        console.log(`  updated_at: ${row.updated_at}`)
        console.log()
      })
    }
    
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('Error querying rows:', err.message || err)
    process.exit(1)
  }
}

main()
