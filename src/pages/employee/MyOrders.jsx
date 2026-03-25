import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, QrCode, Trophy, Bus, ChevronDown, ChevronUp, Download } from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout'

const ORDER = {
  id: 'CPR-2025-00847',
  evento: 'COPERNIC 2025',
  data: '05/03/2025 · 14:32',
  status: 'Emitido',
  retirada: 'Pendente',
  transporte: true,
  ingressos: [
    { id: 'ING-001', nome: 'João Silva', vinculo: 'Titular' },
    { id: 'ING-002', nome: 'Maria Silva', vinculo: 'Cônjuge' },
    { id: 'ING-003', nome: 'Pedro Silva', vinculo: 'Filho/a' },
  ],
}

function QRPlaceholder({ code }) {
  return (
    <div className="w-16 h-16 bg-slate-100 rounded-lg border border-border flex flex-col items-center justify-center shrink-0">
      <QrCode size={24} className="text-slate-400" />
      <span className="text-[9px] text-muted mt-0.5">{code}</span>
    </div>
  )
}

export default function MyOrders() {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(true)

  return (
    <EmployeeLayout showSteps={false}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-muted text-sm">Meus pedidos</p>
          <h1 className="text-primary">Ingressos gerados</h1>
        </div>
        <button
          onClick={() => navigate('/emitir/quantidade')}
          className="text-sm font-medium text-accent hover:underline"
        >
          + Novo pedido
        </button>
      </div>

      {/* Order card */}
      <div className="card mb-4">
        {/* Order header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted mb-0.5">Número do pedido</p>
            <p className="font-bold text-primary text-lg">{ORDER.id}</p>
            <p className="text-sm text-muted">{ORDER.evento} · {ORDER.data}</p>
          </div>
          <div className="text-right space-y-1">
            <span className="badge-blue block">● {ORDER.status}</span>
            <span className="badge-amber block">Retirada {ORDER.retirada}</span>
          </div>
        </div>

        {/* Transport */}
        <div className="flex items-center gap-2 py-2.5 px-3 bg-green-50 rounded-lg mb-4">
          <Bus size={14} className="text-success" />
          <p className="text-sm text-success font-medium">Ônibus corporativo: confirmado</p>
        </div>

        {/* Tickets toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center justify-between w-full py-2 border-t border-border"
        >
          <div className="flex items-center gap-2">
            <Ticket size={15} className="text-muted" />
            <span className="text-sm font-medium text-slate-700">
              {ORDER.ingressos.length} ingressos gerados
            </span>
          </div>
          {expanded ? <ChevronUp size={15} className="text-muted" /> : <ChevronDown size={15} className="text-muted" />}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2">
            {ORDER.ingressos.map((ing, i) => (
              <div key={ing.id} className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border">
                <QRPlaceholder code={ing.id} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{ing.nome}</p>
                  <span className={`badge ${i === 0 ? 'badge-blue' : 'badge-gray'} mt-0.5`}>
                    {ing.vinculo}
                  </span>
                </div>
                <span className="text-xs text-muted font-mono">{ing.id}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raffle coupon */}
      <div className="card border-2 border-dashed border-accent/40 bg-accent-light">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-accent" />
          <h3 className="text-amber-700">Cupom de Sorteio — Titular</h3>
        </div>
        <div className="flex items-center gap-4">
          <QRPlaceholder code="SORT" />
          <div>
            <p className="font-bold text-slate-800">{ORDER.ingressos[0].nome}</p>
            <p className="text-sm text-muted">Pedido: {ORDER.id}</p>
            <p className="text-xs text-muted mt-1">Retire fisicamente no RH para depositar na urna</p>
          </div>
        </div>
      </div>

      {/* Download */}
      <button className="btn-secondary flex items-center justify-center gap-2 mt-4">
        <Download size={16} />
        Salvar / Imprimir ingressos
      </button>
    </EmployeeLayout>
  )
}
