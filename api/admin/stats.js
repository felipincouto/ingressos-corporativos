import { getDb } from '../_db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  const sql = getDb()
  const [[total_func], [emitiram], [total_ing], [onibus], [checkins], [retiradas], setores] = await Promise.all([
    sql`SELECT COUNT(*) AS n FROM funcionarios WHERE max_ingressos > 0`,
    sql`SELECT COUNT(DISTINCT funcionario_id) AS n FROM pedidos`,
    sql`SELECT COUNT(*) AS n FROM ingressos`,
    sql`SELECT COUNT(*) AS n FROM pedidos WHERE transporte = true`,
    sql`SELECT COUNT(*) AS n FROM ingressos WHERE status = 'usado'`,
    sql`SELECT COUNT(*) AS n FROM pedidos WHERE status = 'retirado'`,
    sql`
      SELECT f.setor,
             COUNT(DISTINCT p.funcionario_id) AS emitiram,
             COUNT(DISTINCT f.id) AS total
      FROM funcionarios f
      LEFT JOIN pedidos p ON p.funcionario_id = f.id
      WHERE f.max_ingressos > 0
      GROUP BY f.setor
      ORDER BY f.setor
    `,
  ])

  return res.status(200).json({
    total_funcionarios: Number(total_func.n),
    emitiram: Number(emitiram.n),
    total_ingressos: Number(total_ing.n),
    onibus: Number(onibus.n),
    checkins: Number(checkins.n),
    retiradas: Number(retiradas.n),
    setores,
  })
}
