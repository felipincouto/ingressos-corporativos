import { getDb } from './_db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, data_nascimento } = req.body
  if (!email || !data_nascimento) return res.status(400).json({ error: 'Email e data de nascimento obrigatórios' })

  try {
    const sql = getDb()
    const rows = await sql`
      SELECT id, nome, email, setor, matricula, max_ingressos
      FROM funcionarios
      WHERE LOWER(email) = LOWER(${email})
        AND data_nascimento = ${data_nascimento}::date
    `
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas' })

    const funcionario = rows[0]
    return res.status(200).json({ success: true, funcionario })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
