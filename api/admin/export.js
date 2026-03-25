import { getDb } from '../_db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  const sql = getDb()
  const { type = 'sorteio' } = req.query || {}

  // ── type=sorteio: all titulares with raffle codes ─────────────────────────
  if (type === 'sorteio') {
    const rows = await sql`
      SELECT
        p.codigo AS pedido,
        f.nome,
        f.setor,
        f.matricula,
        p.codigo_sorteio,
        p.transporte,
        p.status,
        p.criado_em
      FROM pedidos p
      JOIN funcionarios f ON f.id = p.funcionario_id
      WHERE p.codigo_sorteio IS NOT NULL
      ORDER BY p.codigo_sorteio ASC
    `
    return res.status(200).json({ rows, type: 'sorteio' })
  }

  // ── type=completo: all pedidos with all participants ──────────────────────
  if (type === 'completo') {
    const rows = await sql`
      SELECT
        p.codigo AS pedido,
        f.nome AS titular,
        f.email,
        f.setor,
        f.matricula,
        part.nome AS participante,
        part.vinculo,
        i.codigo AS ingresso,
        i.status AS status_ingresso,
        p.transporte,
        p.codigo_sorteio,
        p.status AS status_pedido,
        p.criado_em
      FROM pedidos p
      JOIN funcionarios f ON f.id = p.funcionario_id
      LEFT JOIN participantes part ON part.pedido_id = p.id
      LEFT JOIN ingressos i ON i.participante_id = part.id
      ORDER BY p.codigo, part.id
    `
    return res.status(200).json({ rows, type: 'completo' })
  }

  // ── type=funcionarios: all employees with emission status ─────────────────
  if (type === 'funcionarios') {
    const rows = await sql`
      SELECT
        f.nome,
        f.email,
        f.setor,
        f.matricula,
        f.max_ingressos,
        COUNT(p.id)::int AS pedidos,
        COALESCE(SUM((SELECT COUNT(*) FROM ingressos i WHERE i.pedido_id = p.id))::int, 0) AS ingressos_emitidos,
        MAX(p.status) AS status
      FROM funcionarios f
      LEFT JOIN pedidos p ON p.funcionario_id = f.id
      GROUP BY f.id
      ORDER BY f.nome
    `
    return res.status(200).json({ rows, type: 'funcionarios' })
  }

  return res.status(400).json({ error: 'type inválido. Use: sorteio | completo | funcionarios' })
}
