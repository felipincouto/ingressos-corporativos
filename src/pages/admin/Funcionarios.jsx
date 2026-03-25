import { useState, useEffect, useCallback } from 'react'
import { Search, Pencil, X, Save, Loader, UserCheck, UserX, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'

const STATUS_COLORS = {
  emitido:  { bg: '#DBEAFE', text: '#1D4ED8', label: 'Emitido' },
  impresso: { bg: '#F3E8FF', text: '#7E22CE', label: 'Impresso' },
  retirado: { bg: '#FEF3C7', text: '#B45309', label: 'Retirado' },
  checkin:  { bg: '#D1FAE5', text: '#065F46', label: 'Check-in' },
}

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([])
  const [total, setTotal] = useState(0)
  const [setores, setSetores] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [busca, setBusca] = useState('')
  const [filtroSetor, setFiltroSetor] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const PER_PAGE = 30

  const load = useCallback(async (pg = page, b = busca, s = filtroSetor) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: pg, per_page: PER_PAGE })
      if (b.trim()) params.set('busca', b.trim())
      if (s) params.set('setor', s)
      const data = await fetch(`/api/admin/funcionarios?${params}`).then(r => r.json())
      setFuncionarios(data.funcionarios || [])
      setTotal(data.total || 0)
      if (data.setores?.length) setSetores(data.setores)
    } catch {
      setFuncionarios([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(1, '', '') }, [])

  function handleSearch(e) {
    e.preventDefault()
    setPage(1)
    load(1, busca, filtroSetor)
  }

  function changePage(pg) {
    setPage(pg)
    load(pg, busca, filtroSetor)
  }

  function openEdit(f) {
    setEditing(f.id)
    setEditForm({ nome: f.nome, setor: f.setor || '', matricula: f.matricula || '', max_ingressos: f.max_ingressos || 4 })
    setSaveError('')
  }

  function closeEdit() { setEditing(null); setSaveError('') }

  async function handleSave(id) {
    setSaving(true); setSaveError('')
    try {
      const res = await fetch('/api/admin/funcionarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar')
      setFuncionarios(prev => prev.map(f => f.id === id ? { ...f, ...data.funcionario } : f))
      closeEdit()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div>
      <AdminHeader
        title="Funcionários"
        subtitle={`${total.toLocaleString('pt-BR')} colaboradores cadastrados`}
      />

      <div className="p-6">
        {/* Search/filter bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-5 flex-wrap">
          <div className="relative flex-1" style={{ minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              className="input pl-9"
              placeholder="Buscar por nome, e-mail ou matrícula..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
          {setores.length > 0 && (
            <select
              className="input"
              style={{ width: 180 }}
              value={filtroSetor}
              onChange={e => { setFiltroSetor(e.target.value); setPage(1); load(1, busca, e.target.value) }}
            >
              <option value="">Todos os setores</option>
              {setores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 1.25rem' }}>
            Buscar
          </button>
        </form>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Funcionário', 'Setor', 'Matrícula', 'Limite', 'Situação', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', letterSpacing: '0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Loader size={16} className="animate-spin" /> Carregando...
                    </div>
                  </td></tr>
                ) : funcionarios.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                    <Users size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                    Nenhum funcionário encontrado.
                  </td></tr>
                ) : (
                  funcionarios.map(f => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #F1F5F9', background: editing === f.id ? '#FAFCFF' : 'transparent' }}>
                      {editing === f.id ? (
                        // ── Edit row ──────────────────────────────────────────
                        <>
                          <td style={{ padding: '8px 16px' }}>
                            <input className="input" style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
                              value={editForm.nome} onChange={e => setEditForm(p => ({ ...p, nome: e.target.value }))} />
                          </td>
                          <td style={{ padding: '8px 16px' }}>
                            <input className="input" style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
                              value={editForm.setor} onChange={e => setEditForm(p => ({ ...p, setor: e.target.value }))}
                              placeholder="Setor" list="setores-list" />
                            <datalist id="setores-list">
                              {setores.map(s => <option key={s} value={s} />)}
                            </datalist>
                          </td>
                          <td style={{ padding: '8px 16px' }}>
                            <input className="input" style={{ fontSize: '0.8125rem', padding: '6px 10px', width: 100 }}
                              value={editForm.matricula} onChange={e => setEditForm(p => ({ ...p, matricula: e.target.value }))}
                              placeholder="Matrícula" />
                          </td>
                          <td style={{ padding: '8px 16px' }}>
                            <input type="number" min="1" max="20" className="input" style={{ fontSize: '0.8125rem', padding: '6px 10px', width: 70 }}
                              value={editForm.max_ingressos} onChange={e => setEditForm(p => ({ ...p, max_ingressos: Number(e.target.value) }))} />
                          </td>
                          <td colSpan={2} style={{ padding: '8px 16px' }}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <button onClick={() => handleSave(f.id)} disabled={saving}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 7, background: '#DC0032', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}>
                                {saving ? <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Save size={13} />}
                                Salvar
                              </button>
                              <button onClick={closeEdit}
                                style={{ display: 'flex', alignItems: 'center', padding: 6, borderRadius: 7, background: '#F1F5F9', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                                <X size={14} />
                              </button>
                              {saveError && <span style={{ color: '#EF4444', fontSize: '0.75rem' }}>{saveError}</span>}
                            </div>
                          </td>
                        </>
                      ) : (
                        // ── View row ──────────────────────────────────────────
                        <>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem' }}>{f.nome}</div>
                            <div style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: 2 }}>{f.email}</div>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.875rem' }}>{f.setor || '—'}</td>
                          <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.875rem', fontFamily: 'monospace' }}>{f.matricula || '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: '0.8125rem' }}>
                              {f.max_ingressos}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {f.emitiu > 0 ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, background: STATUS_COLORS[f.ultimo_status]?.bg || '#D1FAE5', color: STATUS_COLORS[f.ultimo_status]?.text || '#065F46' }}>
                                <UserCheck size={11} />
                                {STATUS_COLORS[f.ultimo_status]?.label || 'Emitido'}
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, background: '#F1F5F9', color: '#94A3B8' }}>
                                <UserX size={11} />
                                Pendente
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <button onClick={() => openEdit(f)}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}>
                              <Pencil size={12} /> Editar
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, total)} de {total.toLocaleString('pt-BR')}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => changePage(page - 1)} disabled={page <= 1}
                  style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: 7, background: page <= 1 ? '#F1F5F9' : '#fff', border: '1px solid #E2E8F0', color: page <= 1 ? '#CBD5E1' : '#475569', cursor: page <= 1 ? 'default' : 'pointer' }}>
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                  return (
                    <button key={pg} onClick={() => changePage(pg)}
                      style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid ' + (pg === page ? '#DC0032' : '#E2E8F0'), background: pg === page ? '#DC0032' : '#fff', color: pg === page ? '#fff' : '#475569', fontWeight: pg === page ? 700 : 400, fontSize: '0.8125rem', cursor: 'pointer', minWidth: 32 }}>
                      {pg}
                    </button>
                  )
                })}
                <button onClick={() => changePage(page + 1)} disabled={page >= totalPages}
                  style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: 7, background: page >= totalPages ? '#F1F5F9' : '#fff', border: '1px solid #E2E8F0', color: page >= totalPages ? '#CBD5E1' : '#475569', cursor: page >= totalPages ? 'default' : 'pointer' }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
