import { getDb } from '../_db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const sql = getDb()

  if (req.method === 'GET') {
    const { busca, status, setor, page = 1 } = req.query
    const limit = 20
    const offset = (page - 1) * limit

    const [rows, [countRow]] = await Promise.all([
      sql`
        SELECT p.id, p.codigo, p.status, p.transporte, p.criado_em,
               f.nome AS funcionario, f.setor, f.matricula,
               COUNT(i.id) AS total_ingressos
        FROM pedidos p
        JOIN funcionarios f ON f.id = p.funcionario_id
        LEFT JOIN ingressos i ON i.pedido_id = p.id
        WHERE (${busca || null} IS NULL OR f.nome ILIKE ${'%' + (busca||'') + '%'} OR p.codigo ILIKE ${'%' + (busca||'') + '%'})
          AND (${status || null} IS NULL OR p.status = ${status})
          AND (${setor || null} IS NULL OR f.setor = ${setor})
        GROUP BY p.id, f.nome, f.setor, f.matricula
        ORDER BY p.criado_em DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql`
        SELECT COUNT(*) AS total
        FROM pedidos p
        JOIN funcionarios f ON f.id = p.funcionario_id
        WHERE (${busca || null} IS NULL OR f.nome ILIKE ${'%' + (busca||'') + '%'} OR p.codigo ILIKE ${'%' + (busca||'') + '%'})
          AND (${status || null} IS NULL OR p.status = ${status})
          AND (${setor || null} IS NULL OR f.setor = ${setor})
      `,
    ])
    return res.status(200).json({ pedidos: rows, total: Number(countRow.total) })
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body
    await sql`UPDATE pedidos SET status = ${status} WHERE id = ${id}`
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
