const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:its@localhost:5432/test_process'
});

pool.query('SELECT * FROM project_tags LIMIT 5', (err, res) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Top 5 rows from project_tags:');
  console.table(res.rows);
  pool.end();
});
