import { useState } from 'react'
import { Search, CheckCircle2, Clock, Package } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'

const ORDERS = [
  { id: 'CPR-00847', nome: 'João Silva',     ingressos: 3, status: 'Impresso',  retirado: false },
  { id: 'CPR-00848', nome: 'Ana Costa',      ingressos: 2, status: 'Retirado',  retirado: true,  quando: '05/03 · 14:22', atendente: 'Maria' },
  { id: 'CPR-00849', nome: 'Carlos Lima',    ingressos: 5, status: 'Impresso',  retirado: false },
  { id: 'CPR-00852', nome: 'Fernanda Souza', ingressos: 2, status: 'Retirado',  retirado: true,  quando: '05/03 · 13:50', atendente: 'Maria' },
  { id: 'CPR-00853', nome: 'Paulo Teixeira', ingressos: 1, status: 'Impresso',  retirado: false },
]

export default function PickupControl() {
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState(ORDERS)

  function markRetirado(id) {
    setOrders(o => o.map(item =>
      item.id === id
        ? { ...item, retirado: true, status: 'Retirado', quando: 'Agora · 15:04', atendente: 'Admin' }
        : item
    ))
  }

  const filtered = orders.filter(o =>
    o.nome.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  )

  const pendentes = orders.filter(o => !o.retirado).length
  const retirados = orders.filter(o => o.retirado).length

  return (
    <div>
      <AdminHeader title="Controle de Retirada" subtitle="Gerencie a entrega física dos kits no RH" />

      <div className="p-6 space-y-5 max-w-3xl">
        {/* Stats */}
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

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9 text-sm"
            placeholder="Buscar funcionário ou número do pedido..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map(o => (
            <div
              key={o.id}
              className={`card transition-all ${o.retirado ? 'opacity-70' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`rounded-xl p-2 mt-0.5 ${o.retirado ? 'bg-green-50' : 'bg-amber-50'}`}>
                    <Package size={16} className={o.retirado ? 'text-success' : 'text-accent'} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{o.nome}</p>
                    <p className="text-xs text-muted font-mono">{o.id} · {o.ingressos} ingressos</p>
                    {o.retirado && (
                      <p className="text-xs text-muted mt-1">
                        ✓ Retirado em {o.quando} · Atendente: {o.atendente}
                      </p>
                    )}
                  </div>
                </div>

                {o.retirado ? (
                  <span className="badge-green shrink-0">✓ Retirado</span>
                ) : (
                  <button
                    onClick={() => markRetirado(o.id)}
                    className="shrink-0 bg-success text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} />
                    Marcar retirado
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
