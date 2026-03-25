import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Ticket, Bus, Users, AlertTriangle, ClipboardList } from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout'

const PARTICIPANTS = [
  { nome: 'João Silva', vinculo: 'Titular' },
  { nome: 'Maria Silva', vinculo: 'Cônjuge' },
  { nome: 'Pedro Silva', vinculo: 'Filho/a' },
]

export default function OrderConfirmation() {
  const navigate = useNavigate()

  return (
    <EmployeeLayout step={4}>
      <h2 className="text-primary mb-1">Revise seu pedido</h2>
      <p className="text-muted text-sm mb-5">Verifique os dados antes de confirmar. Esta ação não poderá ser desfeita.</p>

      {/* Summary card */}
      <div className="card mb-4 space-y-4">
        {/* Event */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide mb-0.5">Evento</p>
            <p className="font-semibold text-slate-800">COPERNIC 2025</p>
            <p className="text-sm text-muted">15 de Março de 2025 · Expo SP</p>
          </div>
          <span className="badge-blue">3 ingressos</span>
        </div>

        <div className="border-t border-border" />

        {/* Participants */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-muted" />
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Participantes</p>
          </div>
          <div className="space-y-1.5">
            {PARTICIPANTS.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="text-sm text-slate-700">{p.nome}</p>
                <span className={`badge ${i === 0 ? 'badge-blue' : 'badge-gray'}`}>{p.vinculo}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Transport */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus size={14} className="text-muted" />
            <p className="text-sm text-slate-700">Transporte corporativo</p>
          </div>
          <span className="badge-green">Sim, ônibus</span>
        </div>

        <div className="border-t border-border" />

        {/* Terms */}
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} className="text-success" />
          <p className="text-sm text-slate-700">Termos aceitos em 05/03/2025 às 14:32</p>
        </div>
      </div>

      {/* Warning */}
      <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-card p-4 mb-5">
        <AlertTriangle size={16} className="text-accent shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          Após confirmar, <strong>não será possível alterar</strong> os dados do pedido.
          Certifique-se de que as informações estão corretas.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-3">
        <button onClick={() => navigate('/emitir/termos')} className="btn-secondary w-auto px-5">
          ← Voltar
        </button>
        <button
          onClick={() => navigate('/meus-pedidos')}
          className="flex-1 bg-success text-white font-semibold py-3 rounded-card hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
        >
          <Ticket size={17} />
          Confirmar e gerar ingressos
        </button>
      </div>

      <button
        onClick={() => navigate('/meus-pedidos')}
        className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
      >
        <ClipboardList size={14} />
        Ver meus pedidos existentes
      </button>
    </EmployeeLayout>
  )
}
