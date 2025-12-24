import express from 'express'
import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    res.json({ status: 'ok' })
  } catch (err) {
    res.status(500).json({ status: 'error', error: String(err) })
  }
})

app.get('/api/projects', async (req, res) => {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT * FROM projects ORDER BY id')
    client.release()
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.get('/api/project-documents', async (req, res) => {
  try {
    const projectName = req.query.projectName as string
    const client = await pool.connect()
    let result
    if (projectName) {
      result = await client.query(
        'SELECT id, project_name, document_id, document_description FROM project_documents WHERE project_name = $1 ORDER BY id ASC',
        [projectName]
      )
    } else {
      result = await client.query(
        'SELECT id, project_name, document_id, document_description FROM project_documents ORDER BY id ASC'
      )
    }
    client.release()
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`)
})
