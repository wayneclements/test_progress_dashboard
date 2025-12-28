const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

async function main() {
  const projectName = process.argv[2] || 'Project No. 2'
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    const result = await client.query(
      'SELECT * FROM project_documents WHERE project_name = $1 ORDER BY id',
      [projectName]
    )
    
    if (result.rows.length === 0) {
      console.log(`No rows found for project_name = "${projectName}"`)
    } else {
      console.log(`\nFound ${result.rows.length} row(s) for project_name = "${projectName}":\n`)
      result.rows.forEach((row, idx) => {
        console.log(`Row ${idx + 1}:`)
        console.log(`  id: ${row.id}`)
        console.log(`  project_name: ${row.project_name}`)
        console.log(`  document_name: ${row.document_name}`)
        console.log(`  document_description: ${row.document_description}`)
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
