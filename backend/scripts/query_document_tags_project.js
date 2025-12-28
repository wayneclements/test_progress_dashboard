const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    const result = await client.query(`
      SELECT * FROM document_tags 
      WHERE tag_name LIKE 'project%'
      ORDER BY id
    `)
    
    if (result.rows.length === 0) {
      console.log('No rows found where tag_name starts with "project".')
    } else {
      console.log(`\nFound ${result.rows.length} row(s) where tag_name starts with "project":\n`)
      result.rows.forEach((row, idx) => {
        console.log(`Row ${idx + 1}:`)
        console.log(`  id: ${row.id}`)
        console.log(`  tag_name: ${row.tag_name}`)
        console.log(`  document_name: ${row.document_name}`)
        console.log(`  created_at: ${row.created_at}`)
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
