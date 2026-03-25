import { getDb } from '../_db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { registros } = req.body
  if (!Array.isArray(registros) || registros.length === 0) {
    return res.status(400).json({ error: 'Registros inválidos' })
  }

  const sql = getDb()
  let inserted = 0
  let updated = 0
  const errors = []

  for (const r of registros) {
    try {
      const existing = await sql`SELECT id FROM funcionarios WHERE email = ${r.email.toLowerCase()}`
      if (existing.length > 0) {
        await sql`
          UPDATE funcionarios
          SET nome = ${r.nome}, data_nascimento = ${r.nascimento},
              max_ingressos = ${r.max_ingressos}, matricula = ${r.matricula || null}, setor = ${r.setor || null}
          WHERE email = ${r.email.toLowerCase()}
        `
        updated++
      } else {
        await sql`
          INSERT INTO funcionarios (nome, email, data_nascimento, max_ingressos, matricula, setor)
          VALUES (${r.nome}, ${r.email.toLowerCase()}, ${r.nascimento}, ${r.max_ingressos}, ${r.matricula || null}, ${r.setor || null})
        `
        inserted++
      }
    } catch (e) {
      errors.push({ linha: r._linha, erro: e.message })
    }
  }

  return res.status(200).json({ inserted, updated, errors })
}
