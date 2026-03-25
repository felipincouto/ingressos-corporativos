import { Users, Ticket, Bus, TrendingUp, Clock, ChevronRight } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'
import { useNavigate } from 'react-router-dom'

const METRICS = [
  { label: 'Funcionários elegíveis', value: '2.000', icon: Users, color: 'text-primary', bg: 'bg-primary-light' },
  { label: 'Já emitiram', value: '1.240', icon: TrendingUp, color: 'text-success', bg: 'bg-green-50' },
  { label: 'Ingressos gerados', value: '4.890', icon: Ticket, color: 'text-primary-medium', bg: 'bg-blue-50' },
  { label: 'Optaram por ônibus', value: '847', icon: Bus, color: 'text-accent', bg: 'bg-accent-light' },
]

const RECENT = [
  { nome: 'João Silva', ingressos: 3, status: 'Emitido', hora: '14:32' },
  { nome: 'Ana Costa', ingressos: 2, status: 'Impresso', hora: '14:28' },
  { nome: 'Carlos Lima', ingressos: 5, status: 'Retirado', hora: '14:15' },
  { nome: 'Luana Martins', ingressos: 1, status: 'Emitido', hora: '14:01' },
  { nome: 'Roberto Alves', ingressos: 4, status: 'Impresso', hora: '13:55' },
]

const STATUS_BADGE = {
  'Emitido':  'badge-blue',
  'Impresso': 'badge-purple',
  'Retirado': 'badge-amber',
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const progress = Math.round((1240 / 2000) * 100)

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        subtitle="COPERNIC 2025 · 15 de Março de 2025"
        action={
          <span className="badge-green text-sm px-3 py-1">● Emissões abertas</span>
        }
      />

      <div className="p-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {METRICS.map(m => (
            <div key={m.label} className="card flex items-start gap-3">
              <div className={`${m.bg} rounded-xl p-2.5 shrink-0`}>
                <m.icon size={18} className={m.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{m.value}</p>
                <p className="text-xs text-muted leading-tight mt-0.5">{m.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-800">Progresso de emissão</h3>
            <span className="text-sm font-semibold text-primary">{progress}%</span>
          </div>
          <div className="h-2.5 bg-border rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-medium rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted">1.240 de 2.000 funcionários realizaram a emissão</p>

          {/* Deadline */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            <Clock size={14} className="text-accent" />
            <p className="text-sm text-amber-700 font-medium">
              Prazo de emissão encerra em <strong>5 dias</strong> (10/03/2025)
            </p>
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800">Atividade recente</h3>
            <button
              onClick={() => navigate('/admin/pedidos')}
              className="text-sm text-primary-medium hover:underline flex items-center gap-1"
            >
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {RECENT.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                    <span className="text-primary font-bold text-xs">{r.nome[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{r.nome}</p>
                    <p className="text-xs text-muted">{r.ingressos} ingresso{r.ingressos > 1 ? 's' : ''} · {r.hora}</p>
                  </div>
                </div>
                <span className={STATUS_BADGE[r.status]}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
