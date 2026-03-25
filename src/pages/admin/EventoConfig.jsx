import { useState, useEffect } from 'react'
import { Calendar, MapPin, FileText, Save, Loader, Plus, Pencil, Trash2, Star, X, AlertTriangle } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'
import { useApp } from '../../context/AppContext'

const EMPTY_FORM = { nome: '', data: '', local: '', descricao: '', prazo_emissao: '', max_ingressos_padrao: 4, tornar_ativo: false }

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function EventoConfig() {
  const { setEvento } = useApp()
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [activating, setActivating] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [globalError, setGlobalError] = useState('')

  async function loadEventos() {
    const data = await fetch('/api/admin/evento?all=1').then(r => r.json())
    setEventos(data.eventos || [])
    return data.eventos || []
  }

  useEffect(() => { loadEventos().finally(() => setLoading(false)) }, [])

  function openNew() {
    setForm(EMPTY_FORM); setEditingId(null); setFormError(''); setModal('new')
  }

  function openEdit(ev) {
    setForm({
      nome: ev.nome || '',
      data: ev.data ? ev.data.slice(0, 10) : '',
      local: ev.local || '',
      descricao: ev.descricao || '',
      prazo_emissao: ev.prazo_emissao ? ev.prazo_emissao.slice(0, 10) : '',
      max_ingressos_padrao: ev.max_ingressos_padrao || 4,
      tornar_ativo: false,
    })
    setEditingId(ev.id); setFormError(''); setModal('edit')
  }

  function closeModal() { setModal(null); setEditingId(null); setFormError('') }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.nome.trim()) { setFormError('Nome do evento é obrigatório.'); return }
    setSaving(true); setFormError('')
    try {
      const res = await fetch('/api/admin/evento', {
        method: modal === 'new' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modal === 'new' ? form : { id: editingId, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar')
      const list = await loadEventos()
      const activeEv = list.find(e => e.ativo)
      if (activeEv) setEvento(activeEv)
      closeModal()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSetAtivo(id) {
    setActivating(id); setGlobalError('')
    try {
      const res = await fetch('/api/admin/evento', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, setAtivo: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao ativar')
      setEvento(data.evento)
      await loadEventos()
    } catch (err) {
      setGlobalError(err.message)
    } finally {
      setActivating(null)
    }
  }

  async function handleDelete(id) {
    setDeleting(id); setGlobalError('')
    try {
      const res = await fetch('/api/admin/evento?id=' + id, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir')
      await loadEventos()
    } catch (err) {
      setGlobalError(err.message)
    } finally {
      setDeleting(null); setConfirmDelete(null)
    }
  }

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 50, padding: '1rem',
  }

  return (
    <div>
      <AdminHeader
        title="Eventos"
        subtitle="Gerencie os eventos e defina qual está ativo para os colaboradores"
        action={
          <button onClick={openNew} className="btn-primary flex items-center gap-2"
            style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
            <Plus size={16} /> Novo Evento
          </button>
        }
      />

      <div className="p-6 max-w-3xl space-y-4">
        {globalError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-danger">
            <AlertTriangle size={15} className="shrink-0" /> {globalError}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 py-20 justify-center text-muted">
            <Loader size={20} className="animate-spin" />
            <span className="text-sm">Carregando eventos...</span>
          </div>
        ) : eventos.length === 0 ? (
          <div className="card text-center py-16">
            <Calendar size={32} className="mx-auto mb-3 text-muted" style={{ opacity: 0.4 }} />
            <p className="text-muted text-sm">Nenhum evento cadastrado.</p>
            <button onClick={openNew} className="btn-primary mt-4"
              style={{ width: 'auto', padding: '0.5rem 1.5rem', margin: '1rem auto 0', fontSize: '0.875rem' }}>
              Criar primeiro evento
            </button>
          </div>
        ) : (
          eventos.map(ev => (
            <div key={ev.id} className="card"
              style={{ borderLeft: '4px solid ' + (ev.ativo ? '#DC0032' : '#E2E8F0'), padding: '1.25rem 1.25rem 1.25rem 1.5rem' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1E293B' }}>{ev.nome}</h3>
                    {ev.ativo && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 99, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.05em', background: '#FFF0F2', color: '#DC0032', border: '1px solid #FECDD6' }}>
                        ATIVO
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted mt-1.5">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {fmt(ev.data)}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {ev.local || '—'}</span>
                    {ev.prazo_emissao && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#D97706' }}>
                        <FileText size={11} /> Prazo: {fmt(ev.prazo_emissao)}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: '#94A3B8' }}>Máx. {ev.max_ingressos_padrao} ingressos</span>
                  </div>
                  {ev.descricao && (
                    <p className="text-xs text-muted mt-2 leading-relaxed" style={{ maxWidth: 480 }}>{ev.descricao}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!ev.ativo && (
                    <button onClick={() => handleSetAtivo(ev.id)} disabled={!!activating} title="Definir como ativo"
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, background: '#FFF0F2', color: '#DC0032', border: '1px solid #FECDD6', cursor: 'pointer' }}>
                      {activating === ev.id
                        ? <span style={{ display: 'inline-block', width: 11, height: 11, border: '2px solid rgba(220,0,50,0.3)', borderTopColor: '#DC0032', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        : <Star size={12} />}
                      Ativar
                    </button>
                  )}
                  <button onClick={() => openEdit(ev)} title="Editar"
                    style={{ display: 'flex', alignItems: 'center', padding: 7, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B', cursor: 'pointer' }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => { if (!ev.ativo) setConfirmDelete(ev) }} disabled={ev.ativo}
                    title={ev.ativo ? 'Ative outro evento antes de excluir' : 'Excluir'}
                    style={{ display: 'flex', alignItems: 'center', padding: 7, borderRadius: 8, background: ev.ativo ? '#F8FAFC' : '#FEF2F2', border: '1px solid ' + (ev.ativo ? '#E2E8F0' : '#FECACA'), color: ev.ativo ? '#CBD5E1' : '#EF4444', cursor: ev.ativo ? 'not-allowed' : 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div style={overlay} onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B' }}>
                {modal === 'new' ? 'Novo Evento' : 'Editar Evento'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4, display: 'flex' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Nome do evento *</label>
                <input className="input" placeholder="Ex: COPERNIC 2026"
                  value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Data do evento</label>
                  <input type="date" className="input" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Prazo de emissão</label>
                  <input type="date" className="input" value={form.prazo_emissao} onChange={e => setForm(f => ({ ...f, prazo_emissao: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Local</label>
                <input className="input" placeholder="Ex: Expo SP — Pavilhão 5"
                  value={form.local} onChange={e => setForm(f => ({ ...f, local: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Descrição (opcional)</label>
                <textarea className="input" style={{ resize: 'none', height: 72 }} placeholder="Detalhes adicionais..."
                  value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Máx. ingressos por funcionário (padrão)</label>
                <input type="number" min="1" max="20" className="input" style={{ width: 100 }}
                  value={form.max_ingressos_padrao}
                  onChange={e => setForm(f => ({ ...f, max_ingressos_padrao: Number(e.target.value) }))} />
              </div>
              {modal === 'new' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', color: '#475569' }}>
                  <input type="checkbox" checked={form.tornar_ativo}
                    onChange={e => setForm(f => ({ ...f, tornar_ativo: e.target.checked }))}
                    style={{ accentColor: '#DC0032', width: 16, height: 16 }} />
                  Definir como evento ativo imediatamente
                </label>
              )}
              {formError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: '0.875rem', color: '#B91C1C' }}>
                  <AlertTriangle size={14} /> {formError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: 4 }}>
                <button type="button" onClick={closeModal}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1.5rem', borderRadius: 8, border: 'none', background: '#DC0032', color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.8 : 1 }}>
                  {saving
                    ? <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Salvando...</>
                    : <><Save size={14} /> {modal === 'new' ? 'Criar evento' : 'Salvar alterações'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div style={overlay} onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null) }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400, padding: '2rem 1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Trash2 size={22} color="#EF4444" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1E293B', marginBottom: 8 }}>Excluir evento?</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem' }}>
              <strong>{confirmDelete.nome}</strong> será excluído permanentemente. Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{ flex: 1, padding: '0.625rem', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete.id)} disabled={!!deleting}
                style={{ flex: 1, padding: '0.625rem', borderRadius: 10, border: 'none', background: '#EF4444', color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', opacity: deleting ? 0.7 : 1 }}>
                {deleting === confirmDelete.id ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
