import { useState, useEffect } from 'react'
import { Search, CheckCircle2, Clock, Package, Loader } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'

export default function PickupControl() {
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetch('/api/admin/pedidos?page=1&status=impresso')
      .then(r => r.json())
      .then(d => setOrders(d.pedidos || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function markRetirado(id) {
    setUpdating(id)
    await fetch('/api/admin/pedidos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'retirado' }),
    })
    setOrders(o => o.map(item =>
      item.id === id
        ? { ...item, status: 'retirado', retirado_em: new Date().toISOString() }
        : item
    ))
    setUpdating(null)
  }

  const filtered = orders.filter(o =>
    o.funcionario?.toLowerCase().includes(search.toLowerCase()) ||
    o.codigo?.toLowerCase().includes(search.toLowerCase())
  )

  const pendentes = orders.filter(o => o.status !== 'retirado').length
  const retirados = orders.filter(o => o.status === 'retirado').length

  return (
    <div>
      <AdminHeader title="Controle de Retirada" subtitle="Gerencie a entrega física dos kits no RH" />

      <div className="p-6 space-y-5 max-w-3xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="card flex items-center gap-3">
            <div className="bg-amber-50 rounded-xl p-2.5">
              <Clock size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{pendentes}</p>
              <p className="text-xs text-muted">Aguardando retirada</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="bg-green-50 rounded-xl p-2.5">
              <CheckCircle2 size={18} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{retirados}</p>
              <p className="text-xs text-muted">Já retirados</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9 text-sm"
            placeholder="Buscar funcionário ou número do pedido..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="card flex items-center justify-center gap-3 py-10 text-muted">
            <Loader size={20} className="animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-10 text-sm text-muted">
            Nenhum pedido encontrado.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(o => {
              const retirado = o.status === 'retirado'
              return (
                <div key={o.id} className={`card transition-all ${retirado ? 'opacity-70' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-xl p-2 mt-0.5 ${retirado ? 'bg-green-50' : 'bg-amber-50'}`}>
                        <Package size={16} className={retirado ? 'text-success' : 'text-accent'} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{o.funcionario}</p>
                        <p className="text-xs text-muted font-mono">{o.codigo} · {o.total_ingressos} ingressos</p>
                        {retirado && o.retirado_em && (
                          <p className="text-xs text-muted mt-1">
                            ✓ Retirado em {new Date(o.retirado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        )}
                      </div>
                    </div>

                    {retirado ? (
                      <span className="badge-green shrink-0">✓ Retirado</span>
                    ) : (
                      <button
                        onClick={() => markRetirado(o.id)}
                        disabled={updating === o.id}
                        className="shrink-0 bg-success text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                      >
                        {updating === o.id
                          ? <Loader size={13} className="animate-spin" />
                          : <CheckCircle2 size={13} />
                        }
                        Marcar retirado
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
