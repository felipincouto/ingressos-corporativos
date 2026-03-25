import { useState } from 'react'
import { Search, Filter, Eye } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'

const STATUS_BADGE = {
  'Emitido':  'badge-blue',
  'Impresso': 'badge-purple',
  'Retirado': 'badge-amber',
  'Check-in': 'badge-green',
}

const ORDERS = [
  { id: 'CPR-00847', nome: 'João Silva',     ingressos: 3, onibus: true,  status: 'Emitido',  setor: 'TI' },
  { id: 'CPR-00848', nome: 'Ana Costa',      ingressos: 2, onibus: false, status: 'Impresso', setor: 'RH' },
  { id: 'CPR-00849', nome: 'Carlos Lima',    ingressos: 5, onibus: true,  status: 'Retirado', setor: 'TI' },
  { id: 'CPR-00850', nome: 'Luana Martins',  ingressos: 1, onibus: true,  status: 'Check-in', setor: 'Financeiro' },
  { id: 'CPR-00851', nome: 'Roberto Alves',  ingressos: 4, onibus: false, status: 'Emitido',  setor: 'Comercial' },
  { id: 'CPR-00852', nome: 'Fernanda Souza', ingressos: 2, onibus: true,  status: 'Impresso', setor: 'RH' },
]

export default function OrdersList() {
  const [search, setSearch] = useState('')

  const filtered = ORDERS.filter(o =>
    o.nome.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <AdminHeader
        title="Pedidos"
        subtitle={`${ORDERS.length} pedidos encontrados`}
        action={
          <button className="btn-primary w-auto px-4 py-2 text-sm">
            Exportar CSV
          </button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-9 text-sm"
              placeholder="Buscar por nome ou número do pedido..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input w-auto text-sm text-muted">
            <option>Todos os status</option>
            <option>Emitido</option>
            <option>Impresso</option>
            <option>Retirado</option>
            <option>Check-in</option>
          </select>
          <select className="input w-auto text-sm text-muted">
            <option>Todos os setores</option>
            <option>TI</option>
            <option>RH</option>
            <option>Financeiro</option>
            <option>Comercial</option>
          </select>
        </div>

        {/* Table */}
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
              {filtered.map((o, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{o.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-xs font-bold text-primary">
                        {o.nome[0]}
                      </div>
                      <span className="font-medium text-slate-800">{o.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{o.setor}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800">{o.ingressos}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={o.onibus ? 'badge-green' : 'badge-gray'}>
                      {o.onibus ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_BADGE[o.status]}>{o.status}</span>
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

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface">
            <p className="text-xs text-muted">Mostrando {filtered.length} de {ORDERS.length} pedidos</p>
            <div className="flex gap-1">
              <button className="px-3 py-1 rounded text-xs border border-border bg-white text-muted hover:bg-surface">← Anterior</button>
              <button className="px-3 py-1 rounded text-xs bg-primary text-white">1</button>
              <button className="px-3 py-1 rounded text-xs border border-border bg-white text-muted hover:bg-surface">2</button>
              <button className="px-3 py-1 rounded text-xs border border-border bg-white text-muted hover:bg-surface">Próximo →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
