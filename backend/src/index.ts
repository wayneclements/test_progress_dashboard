import express from 'express'
import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
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

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`)
})
