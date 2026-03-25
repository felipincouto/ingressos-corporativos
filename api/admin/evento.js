import { getDb } from '../_db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const sql = getDb()

  if (req.method === 'GET') {
    const [evento] = await sql`SELECT * FROM eventos ORDER BY id DESC LIMIT 1`
    return res.status(200).json({ evento: evento || null })
  }

  if (req.method === 'PATCH') {
    const { id, nome, data, local, descricao, prazo_emissao, max_ingressos_padrao } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID obrigatório' })
    const [updated] = await sql`
      UPDATE eventos SET
        nome = ${nome || null},
        data = ${data || null},
        local = ${local || null},
        descricao = ${descricao || null},
        prazo_emissao = ${prazo_emissao || null},
        max_ingressos_padrao = ${max_ingressos_padrao || 4},
        atualizado_em = NOW()
      WHERE id = ${id} RETURNING *
    `
    return res.status(200).json({ evento: updated })
  }

  return res.status(405).end()
}
