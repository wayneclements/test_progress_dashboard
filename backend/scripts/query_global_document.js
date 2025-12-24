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
  const documentId = process.argv[2] || 'Test Plan'
  const client = createClient()
  try {
    await client.connect()
    const sql = `
      SELECT id, title, document_id, document_description, created_at, content
      FROM global_documents
      WHERE document_id = $1
      ORDER BY id DESC
      LIMIT 10
    `
    const result = await client.query(sql, [documentId])
    if (result.rows.length === 0) {
      console.log(`No rows found with document_id = ${documentId}`)
    } else {
      console.table(result.rows)
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
