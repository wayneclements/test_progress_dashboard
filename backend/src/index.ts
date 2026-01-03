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
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
})

app.use(express.json())

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
        'SELECT id, project_name, document_name, document_description FROM project_documents WHERE project_name = $1 ORDER BY id ASC',
        [projectName]
      )
    } else {
      result = await client.query(
        'SELECT id, project_name, document_name, document_description FROM project_documents ORDER BY id ASC'
      )
    }
    client.release()
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// Return tags for a document by document_name
app.get('/api/document-tags', async (req, res) => {
  try {
    const documentName = req.query.documentName as string
    if (!documentName) {
      return res.status(400).json({ error: 'Missing documentName query param' })
    }
    const client = await pool.connect()
    const result = await client.query(
      'SELECT id, tag_name, document_name, created_at FROM document_tags WHERE document_name = $1 ORDER BY id ASC',
      [documentName]
    )
    client.release()
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// Get all project tags
app.get('/api/project-tags', async (req, res) => {
  try {
    const client = await pool.connect()
    const result = await client.query(
      'SELECT id, tag_name, tag_value, created_at FROM project_tags ORDER BY id ASC'
    )
    client.release()
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// Create a project tag
app.post('/api/project-tags', async (req, res) => {
  try {
    const { tag_name, tag_value } = req.body

    if (!tag_name) {
      return res.status(400).json({ error: 'Missing tag_name in request body' })
    }

    const client = await pool.connect()
    const result = await client.query(
      'INSERT INTO project_tags (tag_name, tag_value) VALUES ($1, $2) RETURNING id, tag_name, tag_value, created_at',
      [tag_name, tag_value || null]
    )
    client.release()
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// Get all global tags
app.get('/api/global-tags', async (req, res) => {
  try {
    const client = await pool.connect()
    const result = await client.query(
      'SELECT id, name, type, created_at FROM global_tags ORDER BY id ASC'
    )
    client.release()
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// Update a project tag value
app.put('/api/project-tags/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { tag_value } = req.body
    
    if (tag_value === undefined) {
      return res.status(400).json({ error: 'Missing tag_value in request body' })
    }
    
    const client = await pool.connect()
    const result = await client.query(
      'UPDATE project_tags SET tag_value = $1 WHERE id = $2 RETURNING *',
      [tag_value, id]
    )
    client.release()
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project tag not found' })
    }
    
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// Delete a project tag
app.delete('/api/project-tags/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const client = await pool.connect()
    const result = await client.query('DELETE FROM project_tags WHERE id = $1 RETURNING id', [id])
    client.release()

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project tag not found' })
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`)
})
