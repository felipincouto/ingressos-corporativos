import { getDb } from '../_db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const sql = getDb()

  // ── GET: list with search + pagination + pedido status ───────────────────
  if (req.method === 'GET') {
    const { busca, setor, page = '1', per_page = '30' } = req.query || {}
    const offset = (Number(page) - 1) * Number(per_page)

    const rows = await sql`
      SELECT
        f.id, f.nome, f.email, f.setor, f.matricula,
        f.max_ingressos, f.data_nascimento, f.criado_em,
        COUNT(p.id)::int AS total_pedidos,
        SUM(CASE WHEN p.id IS NOT NULL THEN 1 ELSE 0 END)::int AS emitiu,
        MAX(p.status) AS ultimo_status,
        MAX(p.codigo) AS ultimo_pedido
      FROM funcionarios f
      LEFT JOIN pedidos p ON p.funcionario_id = f.id
      WHERE (
        ${busca || null} IS NULL OR
        f.nome ILIKE ${'%' + (busca || '') + '%'} OR
        f.email ILIKE ${'%' + (busca || '') + '%'} OR
        f.matricula ILIKE ${'%' + (busca || '') + '%'}
      )
      AND (${setor || null} IS NULL OR f.setor = ${setor || null})
      GROUP BY f.id
      ORDER BY f.nome ASC
      LIMIT ${Number(per_page)} OFFSET ${offset}
    `

    const [{ total }] = await sql`
      SELECT COUNT(*)::int AS total FROM funcionarios f
      WHERE (
        ${busca || null} IS NULL OR
        f.nome ILIKE ${'%' + (busca || '') + '%'} OR
        f.email ILIKE ${'%' + (busca || '') + '%'} OR
        f.matricula ILIKE ${'%' + (busca || '') + '%'}
      )
      AND (${setor || null} IS NULL OR f.setor = ${setor || null})
    `

    // Get setor list for filters
    const setores = await sql`SELECT DISTINCT setor FROM funcionarios WHERE setor IS NOT NULL ORDER BY setor`

    return res.status(200).json({
      funcionarios: rows,
      total,
      page: Number(page),
      per_page: Number(per_page),
      setores: setores.map(s => s.setor),
    })
  }

  // ── PATCH: update employee fields ────────────────────────────────────────
  if (req.method === 'PATCH') {
    const { id, max_ingressos, setor, matricula, nome } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID obrigatório' })

    const [updated] = await sql`
      UPDATE funcionarios SET
        max_ingressos = COALESCE(${max_ingressos ?? null}, max_ingressos),
        setor = COALESCE(${setor ?? null}, setor),
        matricula = COALESCE(${matricula ?? null}, matricula),
        nome = COALESCE(${nome ?? null}, nome)
      WHERE id = ${id}
      RETURNING id, nome, email, setor, matricula, max_ingressos
    `
    return res.status(200).json({ funcionario: updated })
  }

  return res.status(405).end()
}
