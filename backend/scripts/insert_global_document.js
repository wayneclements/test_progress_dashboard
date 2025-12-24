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
  const documentDescription = process.argv[3] || 'Plan for testing the project'
  const title = process.argv[4] || documentId

  const client = createClient()
  try {
    await client.connect()
    const insertSql = `
      INSERT INTO global_documents (title, document_id, document_description)
      VALUES ($1, $2, $3)
      RETURNING id, title, document_id, document_description, created_at
    `
    const result = await client.query(insertSql, [title, documentId, documentDescription])
    const row = result.rows[0]
    console.log('Inserted row:', row)
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('Insert failed:', err.message || err)
    try { await client.end() } catch (_) {}
    process.exit(1)
  }
}

main()
