const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgresql://SamarthX_user:Adarsh@2004@localhost:5432/samarthx'
})

async function main() {
  try {
    const res = await pool.query('SELECT id, email, full_name, is_verified, created_at FROM applicants ORDER BY created_at DESC LIMIT 10')
    console.log('=== Applicants in DB ===')
    console.log(`Total rows found: ${res.rows.length}`)
    res.rows.forEach(r => {
      console.log(`  id=${r.id} email=${r.email} name=${r.full_name} verified=${r.is_verified} created=${r.created_at}`)
    })
  } catch (err) {
    console.error('DB Error:', err.message)
  } finally {
    await pool.end()
  }
}

main()
