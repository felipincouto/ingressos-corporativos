import { useState } from 'react'
import { Printer, QrCode, Trophy, Package } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'

const ORDERS = [
  { id: 'CPR-00847', nome: 'João Silva',     ingressos: 3, setor: 'TI',         status: 'Emitido' },
  { id: 'CPR-00848', nome: 'Ana Costa',      ingressos: 2, setor: 'RH',         status: 'Emitido' },
  { id: 'CPR-00849', nome: 'Carlos Lima',    ingressos: 5, setor: 'TI',         status: 'Emitido' },
  { id: 'CPR-00852', nome: 'Fernanda Souza', ingressos: 2, setor: 'RH',         status: 'Emitido' },
  { id: 'CPR-00853', nome: 'Paulo Teixeira', ingressos: 1, setor: 'Financeiro', status: 'Emitido' },
]

const MODES = [
  { id: 'kit',    label: 'Kit completo por funcionário',  desc: 'Capa + ingressos + cupom de sorteio',  icon: Package },
  { id: 'sorteio',label: 'Somente cupons de sorteio',     desc: 'Apenas o cupom para a urna',           icon: Trophy },
  { id: 'ingrss', label: 'Somente ingressos',             desc: 'Sem capa e sem cupom',                 icon: QrCode },
]

export default function PrintCenter() {
  const [mode, setMode] = useState('kit')
  const [selected, setSelected] = useState(new Set())

  function toggleAll() {
    if (selected.size === ORDERS.length) setSelected(new Set())
    else setSelected(new Set(ORDERS.map(o => o.id)))
  }

  function toggle(id) {
    setSelected(s => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      <AdminHeader
        title="Central de Impressão"
        subtitle="Imprima kits por funcionário ou somente cupons de sorteio"
      />

      <div className="p-6 space-y-5 max-w-4xl">
        {/* Mode */}
        <div className="card">
          <h3 className="text-slate-800 mb-3">Modo de impressão</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-150
                  ${mode === m.id
                    ? 'border-primary bg-primary-light'
                    : 'border-border hover:border-primary-medium'
                  }`}
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

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select className="input w-auto text-sm text-muted">
            <option>Todos os setores</option>
            <option>TI</option>
            <option>RH</option>
            <option>Financeiro</option>
          </select>
          <select className="input w-auto text-sm text-muted">
            <option>Ordenar: A-Z</option>
            <option>Ordenar: Z-A</option>
            <option>Por setor</option>
          </select>
        </div>

        {/* List */}
        <div className="card p-0 overflow-hidden">
          {/* Table header */}
          <div className="flex items-center px-4 py-3 border-b border-border bg-surface gap-3">
            <input
              type="checkbox"
              checked={selected.size === ORDERS.length}
              onChange={toggleAll}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-xs font-medium text-muted uppercase tracking-wide flex-1">
              Funcionário
            </span>
            <span className="text-xs font-medium text-muted">Ingressos</span>
            <span className="text-xs font-medium text-muted w-20 text-right">Setor</span>
          </div>

          {ORDERS.map(o => (
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
                  {o.nome[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{o.nome}</p>
                  <p className="text-xs text-muted font-mono">{o.id}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-slate-700">{o.ingressos} ingrss.</span>
              <span className="text-xs text-muted w-20 text-right">{o.setor}</span>
            </div>
          ))}
        </div>

        {/* Action bar */}
        {selected.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-white rounded-2xl shadow-card-md px-5 py-3 flex items-center gap-4">
            <span className="text-sm font-medium">{selected.size} selecionados</span>
            <button className="bg-accent hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors">
              <Printer size={15} />
              Imprimir lote
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
