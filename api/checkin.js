import { getDb } from './_db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { codigo } = req.body
  if (!codigo) return res.status(400).json({ error: 'Código obrigatório' })

  const sql = getDb()
  const rows = await sql`
    SELECT i.id, i.codigo, i.status, i.usado_em,
           part.nome, part.vinculo,
           p.codigo AS pedido_codigo, f.nome AS funcionario
    FROM ingressos i
    JOIN participantes part ON part.id = i.participante_id
    JOIN pedidos p ON p.id = i.pedido_id
    JOIN funcionarios f ON f.id = p.funcionario_id
    WHERE i.codigo = ${codigo}
  `

  if (rows.length === 0) return res.status(404).json({ resultado: 'invalido', mensagem: 'Ingresso não encontrado' })

  const ingresso = rows[0]
  if (ingresso.status === 'usado') {
    return res.status(200).json({ resultado: 'duplicado', mensagem: 'Ingresso já utilizado', ingresso })
  }

  await sql`UPDATE ingressos SET status = 'usado', usado_em = NOW() WHERE id = ${ingresso.id}`
  return res.status(200).json({ resultado: 'valido', mensagem: 'Check-in realizado com sucesso', ingresso })
}
