const { Client } = require('pg')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

function createClient() {
  const conn = process.env.DATABASE_URL
  if (!conn) return new Client()
  try {
    const url = new URL(conn)
    return new Client({
      host: url.hostname,
      port: url.port ? Number(url.port) : 5432,
      database: url.pathname.replace(/^\//, ''),
      user: url.username,
      password: String(url.password || ''),
      ssl: false,
    })
  } catch (_) {
    return new Client({ connectionString: conn, ssl: false })
  }
}

async function main() {
  const client = createClient()
  try {
    await client.connect()
    const sql = `
      SELECT id, document_name, document_description, created_at
      FROM global_documents
      ORDER BY id
    `
    const result = await client.query(sql)
    if (result.rows.length === 0) {
      console.log('No rows found in global_documents table.')
    } else {
      console.log(`\nFound ${result.rows.length} row(s) in global_documents table:\n`)
      result.rows.forEach((row, idx) => {
        console.log(`Row ${idx + 1}:`)
        console.log(`  id: ${row.id}`)
        console.log(`  document_name: ${row.document_name}`)
        console.log(`  document_description: ${row.document_description}`)
        console.log(`  created_at: ${row.created_at}`)
        console.log()
      })
    }
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('Query failed:', err.message || err)
    try { await client.end() } catch (_) {}
    process.exit(1)
  }
}

main()
