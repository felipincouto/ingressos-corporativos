import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, Mail, Calendar, AlertCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function AccessPage() {
  const navigate = useNavigate()
  const { login } = useApp()
  const [form, setForm] = useState({ email: '', nascimento: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.nascimento) {
      setError('Preencha todos os campos para continuar.')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.nascimento)
      navigate('/evento')
    } catch (err) {
      setError(err.message || 'E-mail ou data de nascimento incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(160deg, #1E3A5F 0%, #2D6A9F 45%, #F8FAFC 45%)'
    }}>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-accent rounded-2xl p-3 mb-3 shadow-card-md">
              <Ticket size={28} className="text-white" />
            </div>
            <h1 className="text-white text-xl font-bold tracking-tight">Ingressos Corporativos</h1>
            <p className="text-white/60 text-sm mt-1">Portal do Colaborador</p>
          </div>

          <div className="card shadow-card-md">
            <h2 className="text-lg font-bold text-primary mb-1">Acesse sua conta</h2>
            <p className="text-muted text-sm mb-6">
              Use o e-mail e a data de nascimento cadastrados pela empresa.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Seu-mail corporativo 
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    placeholder="seu@empresa.com.br"
                    className="input pl-9"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Data de nascimento
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="date"
                    className="input pl-9"
                    value={form.nascimento}
                    onChange={e => setForm(f => ({ ...f, nascimento: e.target.value }))}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <AlertCircle size={15} className="text-danger shrink-0" />
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-2 flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {loading ? 'Verificando...' : 'Acessar meus ingressos'}
              </button>
            </form>

            <p className="text-center text-xs text-muted mt-5">
              Apenas colaboradores autorizados podem acessar este portal.
            </p>
          </div>

          <p className="text-center mt-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-white/50 hover:text-white text-xs transition-colors"
            >
              Acesso administrativo →
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
