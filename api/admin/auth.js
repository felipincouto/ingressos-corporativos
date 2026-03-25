import { createHash, createHmac } from 'crypto'
import { getDb } from '../_db.js'

const SECRET = process.env.ADMIN_SECRET || 'bizideia_denso_secret_v1'

export function hashPassword(senha) {
  return createHash('sha256').update(senha + 'bizideia_salt_2026').digest('hex')
}

export function generateToken(email) {
  const period = Math.floor(Date.now() / (86400000 * 30))
  return createHmac('sha256', SECRET).update(`${email}:${period}`).digest('hex')
}

export function verifyToken(email, token) {
  return token === generateToken(email)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { email, senha } = req.body || {}
  if (!email || !senha) return res.status(400).json({ error: 'Dados incompletos' })

  const sql = getDb()
  const [admin] = await sql`
    SELECT id, email, nome, senha FROM admins
    WHERE email = ${email.toLowerCase().trim()} AND ativo = true
  `

  if (!admin) return res.status(401).json({ error: 'Credenciais inválidas' })

  const hash = hashPassword(senha)
  if (hash !== admin.senha) return res.status(401).json({ error: 'Credenciais inválidas' })

  const token = generateToken(admin.email)
  return res.status(200).json({ admin: { id: admin.id, email: admin.email, nome: admin.nome }, token })
}
