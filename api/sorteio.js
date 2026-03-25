import { getDb } from './_db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  const sql = getDb()
  const participantes = await sql`
    SELECT p.codigo_sorteio, p.codigo AS pedido_codigo, f.nome, f.setor, f.matricula
    FROM pedidos p
    JOIN funcionarios f ON f.id = p.funcionario_id
    WHERE p.codigo_sorteio IS NOT NULL
    ORDER BY p.codigo_sorteio
  `
  return res.status(200).json({ participantes })
}
