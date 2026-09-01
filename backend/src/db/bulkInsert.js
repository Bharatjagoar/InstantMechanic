// Builds a single multi-row INSERT statement (chunked) instead of one query per row —
// far fewer round-trips to Neon for a 500+ row seed.
export async function bulkInsert(client, table, columns, rows, { chunkSize = 200, returning = 'id' } = {}) {
  const insertedIds = []

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const values = []
    const placeholders = chunk.map((row, rowIndex) => {
      const base = rowIndex * columns.length
      const rowPlaceholders = columns.map((_, colIndex) => `$${base + colIndex + 1}`)
      values.push(...row)
      return `(${rowPlaceholders.join(', ')})`
    })

    const text = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES ${placeholders.join(', ')}
      RETURNING ${returning}
    `
    const result = await client.query(text, values)
    insertedIds.push(...result.rows.map((r) => r[returning]))
  }

  return insertedIds
}
