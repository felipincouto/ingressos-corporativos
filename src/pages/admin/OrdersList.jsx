import { useState, useEffect } from 'react'
import { Search, Loader, Eye, Download } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'

const STATUS_BADGE = {
  emitido:  'badge-blue',
  impresso: 'badge-purple',
  retirado: 'badge-amber',
  checkin:  'badge-green',
}

const STATUS_LABEL = {
  emitido:  'Emitido',
  impresso: 'Impresso',
  retirado: 'Retirado',
  checkin:  'Check-in',
}

const PAGE_SIZE = 20

export default function OrdersList() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSetor, setFilterSetor] = useState('')
  const [page, setPage] = useState(1)
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [setores, setSetores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page })
    if (search) params.set('busca', search)
    if (filterStatus) params.set('status', filterStatus)
    if (filterSetor) params.set('setor', filterSetor)
    fetch(`/api/admin/pedidos?${params}`)
      .then(r => r.json())
      .then(d => { setOrders(d.pedidos || []); setTotal(d.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, filterStatus, filterSetor, page])

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setSetores((d.setores || []).map(s => s.setor).filter(Boolean)))
      .catch(() => {})
  }, [])

  function exportCSV() {
    const rows = [['Pedido', 'Funcionário', 'Setor', 'Ingressos', 'Ônibus', 'Status', 'Data']]
    orders.forEach(o => rows.push([
      o.codigo, o.funcionario, o.setor, o.total_ingressos,
      o.transporte ? 'Sim' : 'Não', STATUS_LABEL[o.status] || o.status,
      new Date(o.criado_em).toLocaleDateString('pt-BR'),
    ]))
    const csv = rows.map(r => r.join(';')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
    a.download = 'pedidos.csv'
    a.click()
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <AdminHeader
        title="Pedidos"
        subtitle={loading ? 'Carregando...' : `${total.toLocaleString('pt-BR')} pedidos encontrados`}
        action={
          <button onClick={exportCSV} className="btn-primary w-auto px-4 py-2 text-sm flex items-center gap-1.5">
            <Download size={14} /> Exportar CSV
          </button>
        }
      />

      <div className="p-6 space-y-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-9 text-sm"
              placeholder="Buscar por nome ou número do pedido..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>
          <select
            className="input w-auto text-sm text-muted"
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          >
            <option value="">Todos os status</option>
            <option value="emitido">Emitido</option>
            <option value="impresso">Impresso</option>
            <option value="retirado">Retirado</option>
            <option value="checkin">Check-in</option>
          </select>
          <select
            className="input w-auto text-sm text-muted"
            value={filterSetor}
            onChange={e => { setFilterSetor(e.target.value); setPage(1) }}
          >
            <option value="">Todos os setores</option>
            {setores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                {['Pedido', 'Funcionário', 'Setor', 'Ingressos', 'Ônibus', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    <Loader size={20} className="animate-spin mx-auto mb-2" />
                    <p className="text-sm">Carregando pedidos...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : orders.map((o, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{o.codigo}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-xs font-bold text-primary">
                        {o.funcionario?.[0] || '?'}
                      </div>
                      <span className="font-medium text-slate-800">{o.funcionario}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{o.setor}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800">{o.total_ingressos}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={o.transporte ? 'badge-green' : 'badge-gray'}>
                      {o.transporte ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_BADGE[o.status] || 'badge-gray'}>
                      {STATUS_LABEL[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="btn-ghost py-1 px-2 flex items-center gap-1 text-xs">
                      <Eye size={13} /> Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface">
            <p className="text-xs text-muted">
              Mostrando {orders.length} de {total.toLocaleString('pt-BR')} pedidos
            </p>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded text-xs border border-border bg-white text-muted hover:bg-surface disabled:opacity-40"
              >← Anterior</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                if (p < 1 || p > totalPages) return null
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded text-xs ${p === page ? 'bg-primary text-white' : 'border border-border bg-white text-muted hover:bg-surface'}`}
                  >{p}</button>
                )
              })}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded text-xs border border-border bg-white text-muted hover:bg-surface disabled:opacity-40"
              >Próximo →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
