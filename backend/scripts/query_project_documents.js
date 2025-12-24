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
    const result = await client.query('SELECT COUNT(*) as count FROM project_documents')
    console.log(`Total rows in project_documents: ${result.rows[0].count}`)
    
    const detailResult = await client.query(`
      SELECT project_name, COUNT(*) as document_count
      FROM project_documents
      GROUP BY project_name
      ORDER BY project_name
    `)
    console.log('\nDocuments per project:')
    console.table(detailResult.rows)
    
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('Query failed:', err.message || err)
    try { await client.end() } catch (_) {}
    process.exit(1)
  }
}

main()
