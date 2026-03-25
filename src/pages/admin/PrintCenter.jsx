import { useState, useEffect } from 'react'
import { Printer, QrCode, Trophy, Package, Loader } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'

const MODES = [
  { id: 'kit',     label: 'Kit completo por funcionário', desc: 'Capa + ingressos + cupom de sorteio', icon: Package },
  { id: 'sorteio', label: 'Somente cupons de sorteio',    desc: 'Apenas o cupom para a urna',          icon: Trophy },
  { id: 'ingrss',  label: 'Somente ingressos',            desc: 'Sem capa e sem cupom',                icon: QrCode },
]

export default function PrintCenter() {
  const [mode, setMode] = useState('kit')
  const [selected, setSelected] = useState(new Set())
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    fetch('/api/admin/pedidos?status=emitido&page=1')
      .then(r => r.json())
      .then(d => setOrders(d.pedidos || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function toggleAll() {
    setSelected(selected.size === orders.length ? new Set() : new Set(orders.map(o => o.id)))
  }

  function toggle(id) {
    setSelected(s => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handlePrint() {
    if (selected.size === 0 || printing) return
    setPrinting(true)
    const ids = [...selected]
    await Promise.all(ids.map(id =>
      fetch('/api/admin/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'impresso' }),
      })
    ))
    setOrders(o => o.filter(item => !selected.has(item.id)))
    setSelected(new Set())
    setPrinting(false)
  }

  return (
    <div>
      <AdminHeader
        title="Central de Impressão"
        subtitle="Imprima kits por funcionário ou somente cupons de sorteio"
      />

      <div className="p-6 space-y-5 max-w-4xl">
        <div className="card">
          <h3 className="text-slate-800 mb-3">Modo de impressão</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-150
                  ${mode === m.id ? 'border-primary bg-primary-light' : 'border-border hover:border-primary-medium'}`}
              >
                <m.icon size={18} className={mode === m.id ? 'text-primary mb-2' : 'text-muted mb-2'} />
                <p className={`text-sm font-semibold ${mode === m.id ? 'text-primary' : 'text-slate-700'}`}>
                  {m.label}
                </p>
                <p className="text-xs text-muted mt-0.5">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="flex items-center px-4 py-3 border-b border-border bg-surface gap-3">
            <input
              type="checkbox"
              checked={orders.length > 0 && selected.size === orders.length}
              onChange={toggleAll}
              className="w-4 h-4 accent-primary"
              disabled={loading || orders.length === 0}
            />
            <span className="text-xs font-medium text-muted uppercase tracking-wide flex-1">
              Funcionário {!loading && `(${orders.length} aguardando impressão)`}
            </span>
            <span className="text-xs font-medium text-muted">Ingressos</span>
            <span className="text-xs font-medium text-muted w-20 text-right">Setor</span>
          </div>

          {loading ? (
            <div className="px-4 py-10 text-center text-muted">
              <Loader size={20} className="animate-spin mx-auto mb-2" />
              <p className="text-sm">Carregando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted">
              Nenhum pedido aguardando impressão.
            </div>
          ) : orders.map(o => (
            <div
              key={o.id}
              onClick={() => toggle(o.id)}
              className={`flex items-center px-4 py-3.5 border-b border-border last:border-0 gap-3 cursor-pointer transition-colors
                ${selected.has(o.id) ? 'bg-primary-light' : 'hover:bg-surface'}`}
            >
              <input
                type="checkbox"
                checked={selected.has(o.id)}
                onChange={() => toggle(o.id)}
                onClick={e => e.stopPropagation()}
                className="w-4 h-4 accent-primary"
              />
              <div className="flex items-center gap-2.5 flex-1">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                  {o.funcionario?.[0] || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{o.funcionario}</p>
                  <p className="text-xs text-muted font-mono">{o.codigo}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-slate-700">{o.total_ingressos} ingrss.</span>
              <span className="text-xs text-muted w-20 text-right">{o.setor}</span>
            </div>
          ))}
        </div>

        {selected.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-white rounded-2xl shadow-card-md px-5 py-3 flex items-center gap-4">
            <span className="text-sm font-medium">{selected.size} selecionados</span>
            <button
              onClick={handlePrint}
              disabled={printing}
              className="bg-accent text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-60"
            >
              {printing ? <Loader size={15} className="animate-spin" /> : <Printer size={15} />}
              {printing ? 'Processando...' : 'Imprimir lote'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
