const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    
    // Update document_name for all rows where tag_name starts with "project"
    const result = await client.query(`
      UPDATE document_tags 
      SET document_name = 'Test Plan'
      WHERE tag_name LIKE 'project%'
    `)
    
    console.log(`✓ Updated ${result.rowCount} row(s) in document_tags table`)
    
    // Show the updated records
    const checkResult = await client.query(`
      SELECT * FROM document_tags 
      WHERE tag_name LIKE 'project%'
      ORDER BY id
    `)
    
    console.log(`\nUpdated rows where tag_name starts with "project":\n`)
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
