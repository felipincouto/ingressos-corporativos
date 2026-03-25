import { useState, useEffect } from 'react'
import { Calendar, MapPin, FileText, Save, Loader, CheckCircle, Settings } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'
import { useApp } from '../../context/AppContext'

export default function EventoConfig() {
  const { setEvento } = useApp()
  const [form, setForm] = useState({
    id: null, nome: '', data: '', local: '', descricao: '',
    prazo_emissao: '', max_ingressos_padrao: 4,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/evento')
      .then(r => r.json())
      .then(data => {
        if (data.evento) {
          const ev = data.evento
          setForm({
            id: ev.id,
            nome: ev.nome || '',
            data: ev.data ? ev.data.slice(0, 10) : '',
            local: ev.local || '',
            descricao: ev.descricao || '',
            prazo_emissao: ev.prazo_emissao ? ev.prazo_emissao.slice(0, 10) : '',
            max_ingressos_padrao: ev.max_ingressos_padrao || 4,
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    if (!form.nome.trim()) { setError('Nome do evento é obrigatório.'); return }
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/admin/evento', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar')
      setEvento(data.evento)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <AdminHeader title="Configuração do Evento" subtitle="Gerencie os dados do evento atual" />
      <div className="p-6 max-w-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted">
            <Loader size={20} className="animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="card space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Settings size={16} className="text-primary" />
                <h3 className="text-primary">Dados principais</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome do evento *</label>
                <input
                  className="input"
                  placeholder="Ex: COPERNIC 2026"
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1"><Calendar size={13} /> Data do evento</span>
                  </label>
                  <input type="date" className="input"
                    value={form.data}
                    onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1"><Calendar size={13} /> Prazo de emissão</span>
                  </label>
                  <input type="date" className="input"
                    value={form.prazo_emissao}
                    onChange={e => setForm(f => ({ ...f, prazo_emissao: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1"><MapPin size={13} /> Local</span>
                </label>
                <input className="input" placeholder="Ex: Expo SP — Pavilhão 5"
                  value={form.local}
                  onChange={e => setForm(f => ({ ...f, local: e.target.value }))} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1"><FileText size={13} /> Descrição (opcional)</span>
                </label>
                <textarea className="input resize-none h-20"
                  placeholder="Detalhes adicionais sobre o evento..."
                  value={form.descricao}
                  onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
              </div>
            </div>

            <div className="card">
              <h3 className="text-primary mb-4">Configuração de ingressos</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Máximo de ingressos por funcionário (padrão)
                </label>
                <input type="number" min="1" max="10" className="input w-32"
                  value={form.max_ingressos_padrao}
                  onChange={e => setForm(f => ({ ...f, max_ingressos_padrao: Number(e.target.value) }))} />
                <p className="text-xs text-muted mt-1">Cada funcionário pode ter um limite individual diferente cadastrado.</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <button type="submit" disabled={saving}
              className="btn-primary flex items-center gap-2 w-auto px-8">
              {saving
                ? <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Salvando...</>
                : saved
                  ? <><CheckCircle size={16} /> Salvo com sucesso!</>
                  : <><Save size={16} /> Salvar alterações</>
              }
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
