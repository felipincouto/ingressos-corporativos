import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, QrCode, Trophy, Bus, ChevronDown, ChevronUp, Loader } from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import { useApp } from '../../context/AppContext'

function QRPlaceholder({ code }) {
  return (
    <div className="w-16 h-16 bg-slate-100 rounded-lg border border-border flex flex-col items-center justify-center shrink-0">
      <QrCode size={24} className="text-slate-400" />
      <span className="text-[9px] text-muted mt-0.5 font-mono text-center leading-tight px-1">{code}</span>
    </div>
  )
}

function OrderCard({ pedido }) {
  const [expanded, setExpanded] = useState(true)
  const participantes = pedido.participantes?.filter(p => p && p.nome) || []
  const titular = participantes.find(p => p.vinculo === 'Titular') || participantes[0]

  const statusLabel = { emitido: 'Emitido', impresso: 'Impresso', retirado: 'Retirado' }
  const statusBadge = { emitido: 'badge-blue', impresso: 'badge-purple', retirado: 'badge-amber' }

  const dataFormatada = new Date(pedido.criado_em).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="card mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-muted mb-0.5">Número do pedido</p>
          <p className="font-bold text-primary text-lg">{pedido.codigo}</p>
          <p className="text-sm text-muted">COPERNIC 2025 · {dataFormatada}</p>
        </div>
        <div className="text-right space-y-1">
          <span className={`${statusBadge[pedido.status] || 'badge-gray'} block`}>
            ● {statusLabel[pedido.status] || pedido.status}
          </span>
        </div>
      </div>

      <div className={`flex items-center gap-2 py-2.5 px-3 rounded-lg mb-4 ${pedido.transporte ? 'bg-green-50' : 'bg-slate-50'}`}>
        <Bus size={14} className={pedido.transporte ? 'text-success' : 'text-muted'} />
        <p className={`text-sm font-medium ${pedido.transporte ? 'text-success' : 'text-muted'}`}>
          {pedido.transporte ? 'Ônibus corporativo: confirmado' : 'Sem ônibus corporativo'}
        </p>
      </div>

      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center justify-between w-full py-2 border-t border-border"
      >
        <div className="flex items-center gap-2">
          <Ticket size={15} className="text-muted" />
          <span className="text-sm font-medium text-slate-700">
            {participantes.length} ingresso{participantes.length !== 1 ? 's' : ''} gerado{participantes.length !== 1 ? 's' : ''}
          </span>
        </div>
        {expanded ? <ChevronUp size={15} className="text-muted" /> : <ChevronDown size={15} className="text-muted" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {participantes.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border">
              <QRPlaceholder code={p.ingresso_codigo || `ING-${i+1}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm truncate">{p.nome}</p>
                <span className={`badge ${i === 0 ? 'badge-blue' : 'badge-gray'} mt-0.5`}>
                  {p.vinculo}
                </span>
              </div>
              <span className="text-xs text-muted font-mono shrink-0">{p.ingresso_codigo}</span>
            </div>
          ))}
        </div>
      )}

      {/* Raffle coupon for titular */}
      {titular && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="card border-2 border-dashed border-accent/40 bg-accent-light">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} className="text-accent" />
              <h3 className="text-amber-700">Cupom de Sorteio — Titular</h3>
            </div>
            <div className="flex items-center gap-4">
              <QRPlaceholder code="SORT" />
              <div>
                <p className="font-bold text-slate-800">{titular.nome}</p>
                <p className="text-sm text-muted">Pedido: {pedido.codigo}</p>
                <p className="text-xs text-muted mt-1">Retire fisicamente no RH para depositar na urna</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MyOrders() {
  const navigate = useNavigate()
  const { user } = useApp()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    fetch(`/api/pedidos?funcionario_id=${user.id}`)
      .then(r => r.json())
      .then(data => { setPedidos(data.pedidos || []); setLoading(false) })
      .catch(() => { setError('Erro ao carregar pedidos.'); setLoading(false) })
  }, [user?.id])

  return (
    <EmployeeLayout showSteps={false}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-muted text-sm">Meus pedidos</p>
          <h1 className="text-primary">Ingressos gerados</h1>
        </div>
        {pedidos.length === 0 && !loading && (
          <button
            onClick={() => navigate('/emitir/quantidade')}
            className="text-sm font-medium text-accent hover:underline"
          >
            + Emitir ingressos
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-muted">
          <Loader size={20} className="animate-spin" />
          <span className="text-sm">Carregando seus ingressos...</span>
        </div>
      )}

      {!loading && error && (
        <div className="card text-center py-10">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && pedidos.length === 0 && (
        <div className="card text-center py-12">
          <Ticket size={32} className="text-muted mx-auto mb-3" />
          <p className="text-slate-700 font-medium mb-1">Nenhum ingresso emitido ainda</p>
          <p className="text-muted text-sm mb-5">Você ainda não gerou ingressos para este evento.</p>
          <button
            onClick={() => navigate('/emitir/quantidade')}
            className="btn-primary w-auto mx-auto px-6"
          >
            Emitir meus ingressos
          </button>
        </div>
      )}

      {!loading && pedidos.map(p => (
        <OrderCard key={p.id} pedido={p} />
      ))}
    </EmployeeLayout>
  )
}
