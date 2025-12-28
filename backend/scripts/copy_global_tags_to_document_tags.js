const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    
    // Copy all records from global_tags to document_tags
    const result = await client.query(`
      INSERT INTO document_tags (tag_name)
      SELECT name FROM global_tags
    `)
    
    console.log(`✓ Copied ${result.rowCount} record(s) from global_tags to document_tags`)
    
    // Show the inserted records
    const checkResult = await client.query('SELECT * FROM document_tags ORDER BY id')
    console.log(`\nDocument_tags table now has ${checkResult.rows.length} row(s):\n`)
    checkResult.rows.forEach((row, idx) => {
      console.log(`Row ${idx + 1}:`)
      console.log(`  id: ${row.id}`)
      console.log(`  tag_name: ${row.tag_name}`)
      console.log(`  document_name: ${row.document_name}`)
      console.log(`  created_at: ${row.created_at}`)
      console.log()
    })
    
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message || err)
    process.exit(1)
  }
}

main()
