import { getDb } from './_db.js'

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const sql = getDb()

  // GET /api/pedidos?funcionario_id=1
  if (req.method === 'GET') {
    const { funcionario_id } = req.query
    if (!funcionario_id) return res.status(400).json({ error: 'funcionario_id obrigatório' })

    const pedidos = await sql`
      SELECT p.id, p.codigo, p.funcionario_id, p.transporte, p.status, p.criado_em, p.codigo_sorteio,
        json_agg(
          json_build_object(
            'id', part.id, 'nome', part.nome, 'vinculo', part.vinculo,
            'ingresso_codigo', i.codigo, 'ingresso_status', i.status
          )
        ) AS participantes
      FROM pedidos p
      LEFT JOIN participantes part ON part.pedido_id = p.id
      LEFT JOIN ingressos i ON i.participante_id = part.id
      WHERE p.funcionario_id = ${funcionario_id}
      GROUP BY p.id
      ORDER BY p.criado_em DESC
    `
    return res.status(200).json({ pedidos })
  }

  // POST /api/pedidos — criar novo pedido
  if (req.method === 'POST') {
    const { funcionario_id, transporte, participantes } = req.body
    if (!funcionario_id || !participantes?.length) {
      return res.status(400).json({ error: 'Dados incompletos' })
    }

    // Verificar se já tem pedido
    const existing = await sql`SELECT id FROM pedidos WHERE funcionario_id = ${funcionario_id}`
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Funcionário já emitiu ingressos para este evento' })
    }

    // Verificar limite
    const func = await sql`SELECT max_ingressos FROM funcionarios WHERE id = ${funcionario_id}`
    if (!func.length || participantes.length > func[0].max_ingressos) {
      return res.status(400).json({ error: 'Quantidade excede o limite permitido' })
    }

    const codigo = 'CPR-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-5)

    const [pedido] = await sql`
      INSERT INTO pedidos (codigo, funcionario_id, transporte, status)
      VALUES (${codigo}, ${funcionario_id}, ${transporte}, 'emitido')
      RETURNING *
    `

    const ingressos = []
    for (let i = 0; i < participantes.length; i++) {
      const p = participantes[i]
      const [part] = await sql`
        INSERT INTO participantes (pedido_id, nome, data_nascimento, cpf, vinculo)
        VALUES (${pedido.id}, ${p.nome}, ${p.dob || null}, ${p.cpf || null}, ${p.vinculo || 'Titular'})
        RETURNING id
      `
      const codIngresso = `ING-${String(pedido.id).padStart(3,'0')}-${String(i+1).padStart(3,'0')}`
      const [ing] = await sql`
        INSERT INTO ingressos (pedido_id, participante_id, codigo, status)
        VALUES (${pedido.id}, ${part.id}, ${codIngresso}, 'valido')
        RETURNING codigo
      `
      ingressos.push(ing.codigo)
    }

    // Generate raffle code for the pedido
    const [pedidoWithCode] = await sql`
      UPDATE pedidos SET codigo_sorteio = gerar_codigo_sorteio() WHERE id = ${pedido.id} RETURNING codigo_sorteio
    `
    const codigo_sorteio = pedidoWithCode?.codigo_sorteio || null

    return res.status(201).json({ pedido: { ...pedido, codigo_sorteio }, ingressos })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
