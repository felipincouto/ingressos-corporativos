import { Download, Users, Ticket, Bus, CheckCircle2, TrendingUp, BarChart2 } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'

const METRICS = [
  { label: 'Elegíveis', value: '2.000', icon: Users, color: 'text-primary', bg: 'bg-primary-light' },
  { label: 'Emitiram', value: '1.240', sub: '62%', icon: TrendingUp, color: 'text-success', bg: 'bg-green-50' },
  { label: 'Ingressos', value: '4.890', icon: Ticket, color: 'text-primary-medium', bg: 'bg-blue-50' },
  { label: 'Presentes', value: '393', sub: 'até agora', icon: CheckCircle2, color: 'text-success', bg: 'bg-green-50' },
  { label: 'Ônibus', value: '847', sub: 'optaram', icon: Bus, color: 'text-accent', bg: 'bg-accent-light' },
  { label: 'Retiradas', value: '980', icon: BarChart2, color: 'text-primary', bg: 'bg-primary-light' },
]

const BY_SECTOR = [
  { setor: 'Tecnologia',  total: 420, emitiu: 374, pct: 89 },
  { setor: 'RH',          total: 180, emitiu: 130, pct: 72 },
  { setor: 'Financeiro',  total: 310, emitiu: 190, pct: 61 },
  { setor: 'Comercial',   total: 560, emitiu: 310, pct: 55 },
  { setor: 'Operações',   total: 530, emitiu: 236, pct: 45 },
]

export default function Reports() {
  return (
    <div>
      <AdminHeader
        title="Relatórios"
        subtitle="COPERNIC 2025 · Dados em tempo real"
        action={
          <div className="flex gap-2">
            <button className="btn-secondary w-auto px-4 py-2 text-sm flex items-center gap-1.5">
              <Download size={14} /> CSV
            </button>
            <button className="btn-primary w-auto px-4 py-2 text-sm flex items-center gap-1.5">
              <Download size={14} /> Excel
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Metrics grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {METRICS.map(m => (
            <div key={m.label} className="card flex items-start gap-3">
              <div className={`${m.bg} rounded-xl p-2.5 shrink-0`}>
                <m.icon size={18} className={m.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{m.value}</p>
                <p className="text-xs text-muted">{m.label}</p>
                {m.sub && <p className="text-xs font-medium text-primary mt-0.5">{m.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* By sector */}
        <div className="card">
          <h3 className="text-slate-800 mb-4">Emissão por setor</h3>
          <div className="space-y-4">
            {BY_SECTOR.map(s => (
              <div key={s.setor}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">{s.setor}</span>
                  <span className="text-sm text-muted">{s.emitiu} / {s.total}</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${s.pct}%`,
                      background: s.pct >= 75 ? '#10B981' : s.pct >= 50 ? '#2D6A9F' : '#F59E0B'
                    }}
                  />
                </div>
                <p className="text-xs text-muted mt-1">{s.pct}% de adesão</p>
              </div>
            ))}
          </div>
        </div>

        {/* Raffle base */}
        <div className="card border-2 border-dashed border-accent/40 bg-accent-light">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-amber-700 mb-1">Base para sorteio</h3>
              <p className="text-sm text-amber-600/80">
                1.240 cupons de titulares elegíveis para o sorteio.
                Exporte a lista completa para conduzir o sorteio físico ou digital.
              </p>
            </div>
            <button className="btn-primary w-auto px-4 py-2 text-sm shrink-0 ml-4 flex items-center gap-1.5">
              <Download size={14} /> Exportar base
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
