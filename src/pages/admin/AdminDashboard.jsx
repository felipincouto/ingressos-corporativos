import { useState, useEffect } from 'react'
import { Users, Ticket, Bus, TrendingUp, Clock, ChevronRight, Loader } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentPedidos, setRecentPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/pedidos?page=1').then(r => r.json()),
    ]).then(([s, p]) => {
      setStats(s)
      setRecentPedidos((p.pedidos || []).slice(0, 5))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const total = stats?.total_funcionarios || 0
  const emitiram = stats?.emitiram || 0
  const progress = total > 0 ? Math.round((emitiram / total) * 100) : 0

  const STATUS_BADGE = {
    emitido: 'badge-blue',
    impresso: 'badge-purple',
    retirado: 'badge-amber',
  }

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        subtitle="COPERNIC 2025 · 15 de Março de 2025"
        action={<span className="badge-green text-sm px-3 py-1">● Emissões abertas</span>}
      />

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted">
            <Loader size={20} className="animate-spin" />
            <span className="text-sm">Carregando dados...</span>
          </div>
        ) : (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Funcionários elegíveis', value: total.toLocaleString('pt-BR'), icon: Users, color: 'text-primary', bg: 'bg-primary-light' },
                { label: 'Já emitiram', value: emitiram.toLocaleString('pt-BR'), icon: TrendingUp, color: 'text-success', bg: 'bg-green-50' },
                { label: 'Ingressos gerados', value: (stats?.total_ingressos || 0).toLocaleString('pt-BR'), icon: Ticket, color: 'text-primary-medium', bg: 'bg-blue-50' },
                { label: 'Optaram por ônibus', value: (stats?.onibus || 0).toLocaleString('pt-BR'), icon: Bus, color: 'text-accent', bg: 'bg-accent-light' },
              ].map(m => (
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
              <p className="text-xs text-muted">{emitiram} de {total} funcionários realizaram a emissão</p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <Clock size={14} className="text-accent" />
                <p className="text-sm text-amber-700 font-medium">
                  Prazo de emissão encerra em <strong>5 dias</strong> (10/03/2025)
                </p>
              </div>
            </div>

            {/* Setores */}
            {stats?.setores?.length > 0 && (
              <div className="card">
                <h3 className="text-slate-800 mb-4">Emissão por setor</h3>
                <div className="space-y-3">
                  {stats.setores.map(s => {
                    const pct = s.total > 0 ? Math.round((Number(s.emitiram) / Number(s.total)) * 100) : 0
                    return (
                      <div key={s.setor}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700">{s.setor}</span>
                          <span className="text-muted">{s.emitiram}/{s.total} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

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
              {recentPedidos.length === 0 ? (
                <p className="text-muted text-sm text-center py-6">Nenhum pedido ainda.</p>
              ) : (
                <div className="space-y-2">
                  {recentPedidos.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                          <span className="text-primary font-bold text-xs">{r.funcionario?.[0] || '?'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{r.funcionario}</p>
                          <p className="text-xs text-muted">
                            {r.total_ingressos} ingresso{r.total_ingressos !== 1 ? 's' : ''} · {r.setor}
                          </p>
                        </div>
                      </div>
                      <span className={STATUS_BADGE[r.status] || 'badge-gray'}>{r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
