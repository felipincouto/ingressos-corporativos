import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { adminLogin } = useApp()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.senha) {
      setError('Preencha todos os campos.')
      return
    }
    setLoading(true)
    try {
      await adminLogin(form.email, form.senha)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Credenciais inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 55%, #F8FAFC 55%)' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary rounded-2xl p-3 mb-3 shadow-card-md border border-white/10">
            <Shield size={28} className="text-accent" />
          </div>
          <h1 className="text-white text-xl font-bold tracking-tight">Painel Administrativo</h1>
          <p className="text-white/60 text-sm mt-1">Acesso restrito</p>
        </div>

        <div className="card shadow-card-md">
          <h2 className="text-lg font-bold text-primary mb-1">Entrar no painel</h2>
          <p className="text-muted text-sm mb-6">Use suas credenciais de administrador.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  placeholder="admin@empresa.com"
                  className="input pl-9"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input pl-9"
                  value={form.senha}
                  onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle size={15} className="text-danger shrink-0" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary mt-2 flex items-center justify-center gap-2">
              {loading && <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {loading ? 'Verificando...' : 'Entrar no painel'}
            </button>
          </form>
        </div>

        <p className="text-center mt-4">
          <button onClick={() => navigate('/')} className="text-white/50 hover:text-white text-xs transition-colors">
            ← Acesso de colaboradores
          </button>
        </p>
      </div>
    </div>
  )
}
