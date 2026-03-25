import { getDb } from '../_db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const sql = getDb()

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    // ?all=1 → full list for admin management
    if (req.query?.all) {
      const eventos = await sql`SELECT * FROM eventos ORDER BY ativo DESC, id DESC`
      return res.status(200).json({ eventos })
    }
    // default → return the active event (for AppContext)
    const [evento] = await sql`SELECT * FROM eventos WHERE ativo = true ORDER BY id DESC LIMIT 1`
    return res.status(200).json({ evento: evento || null })
  }

  // ── POST (create) ─────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { nome, data, local, descricao, prazo_emissao, max_ingressos_padrao, tornar_ativo } = req.body || {}
    if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório' })

    // If tornar_ativo, unset all others first
    if (tornar_ativo) {
      await sql`UPDATE eventos SET ativo = false`
    }

    const [novo] = await sql`
      INSERT INTO eventos (nome, data, local, descricao, prazo_emissao, max_ingressos_padrao, status, ativo)
      VALUES (
        ${nome.trim()},
        ${data || null},
        ${local || null},
        ${descricao || null},
        ${prazo_emissao || null},
        ${max_ingressos_padrao || 4},
        'ativo',
        ${tornar_ativo ? true : false}
      )
      RETURNING *
    `
    return res.status(201).json({ evento: novo })
  }

  // ── PATCH (update / set-active) ──────────────────────────────────────────
  if (req.method === 'PATCH') {
    const { id, nome, data, local, descricao, prazo_emissao, max_ingressos_padrao, setAtivo } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID obrigatório' })

    // set-active only
    if (setAtivo) {
      await sql`UPDATE eventos SET ativo = false`
      const [ev] = await sql`UPDATE eventos SET ativo = true WHERE id = ${id} RETURNING *`
      return res.status(200).json({ evento: ev })
    }

    // full update
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

  // ── DELETE ────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const id = req.query?.id || req.body?.id
    if (!id) return res.status(400).json({ error: 'ID obrigatório' })

    // Don't allow deleting the active event
    const [ev] = await sql`SELECT ativo FROM eventos WHERE id = ${id}`
    if (!ev) return res.status(404).json({ error: 'Evento não encontrado' })
    if (ev.ativo) return res.status(400).json({ error: 'Não é possível excluir o evento ativo. Ative outro evento primeiro.' })

    await sql`DELETE FROM eventos WHERE id = ${id}`
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
