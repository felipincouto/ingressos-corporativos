import { useState, useEffect } from 'react'
import { Download, Users, Ticket, Bus, CheckCircle2, TrendingUp, BarChart2, Loader } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'

export default function Reports() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const total = stats?.total_funcionarios || 0
  const emitiram = stats?.emitiram || 0
  const pctEmissao = total > 0 ? Math.round((emitiram / total) * 100) : 0

  const metrics = stats ? [
    { label: 'Elegíveis',  value: total.toLocaleString('pt-BR'),                icon: Users,        color: 'text-primary',        bg: 'bg-primary-light' },
    { label: 'Emitiram',   value: emitiram.toLocaleString('pt-BR'), sub: `${pctEmissao}%`, icon: TrendingUp, color: 'text-success', bg: 'bg-green-50' },
    { label: 'Ingressos',  value: stats.total_ingressos.toLocaleString('pt-BR'), icon: Ticket,      color: 'text-primary-medium', bg: 'bg-blue-50' },
    { label: 'Presentes',  value: stats.checkins.toLocaleString('pt-BR'), sub: 'check-in', icon: CheckCircle2, color: 'text-success', bg: 'bg-green-50' },
    { label: 'Ônibus',     value: stats.onibus.toLocaleString('pt-BR'), sub: 'optaram',   icon: Bus,         color: 'text-accent',   bg: 'bg-accent-light' },
    { label: 'Retiradas',  value: stats.retiradas.toLocaleString('pt-BR'),       icon: BarChart2,   color: 'text-primary',        bg: 'bg-primary-light' },
  ] : []

  function exportCSV() {
    if (!stats?.setores) return
    const rows = [['Setor', 'Total', 'Emitiram', '% Adesão']]
    stats.setores.forEach(s => {
      const pct = s.total > 0 ? Math.round((Number(s.emitiram) / Number(s.total)) * 100) : 0
      rows.push([s.setor, s.total, s.emitiram, `${pct}%`])
    })
    const csv = rows.map(r => r.join(';')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
    a.download = 'relatorio-setores.csv'
    a.click()
  }

  function exportBase() {
    fetch('/api/admin/pedidos?page=1&status=emitido')
      .then(r => r.json())
      .then(d => {
        const rows = [['Pedido', 'Funcionário', 'Setor', 'Ingressos']]
        ;(d.pedidos || []).forEach(p => rows.push([p.codigo, p.funcionario, p.setor, p.total_ingressos]))
        const csv = rows.map(r => r.join(';')).join('\n')
        const a = document.createElement('a')
        a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
        a.download = 'base-sorteio.csv'
        a.click()
      })
  }

  return (
    <div>
      <AdminHeader
        title="Relatórios"
        subtitle="COPERNIC 2025 · Dados em tempo real"
        action={
          <div className="flex gap-2">
            <button onClick={exportCSV} className="btn-secondary w-auto px-4 py-2 text-sm flex items-center gap-1.5">
              <Download size={14} /> CSV
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-muted">
            <Loader size={20} className="animate-spin" />
            <span className="text-sm">Carregando relatórios...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map(m => (
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

            {stats?.setores?.length > 0 && (
              <div className="card">
                <h3 className="text-slate-800 mb-4">Emissão por setor</h3>
                <div className="space-y-4">
                  {stats.setores.map(s => {
                    const pct = s.total > 0 ? Math.round((Number(s.emitiram) / Number(s.total)) * 100) : 0
                    return (
                      <div key={s.setor}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-slate-700">{s.setor}</span>
                          <span className="text-sm text-muted">{s.emitiram} / {s.total}</span>
                        </div>
                        <div className="h-2 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: pct >= 75 ? '#10B981' : pct >= 50 ? '#2D6A9F' : '#F59E0B',
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted mt-1">{pct}% de adesão</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="card border-2 border-dashed border-accent/40 bg-accent-light">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-amber-700 mb-1">Base para sorteio</h3>
                  <p className="text-sm text-amber-600/80">
                    {emitiram.toLocaleString('pt-BR')} cupons de titulares elegíveis para o sorteio.
                    Exporte a lista completa para conduzir o sorteio físico ou digital.
                  </p>
                </div>
                <button
                  onClick={exportBase}
                  className="btn-primary w-auto px-4 py-2 text-sm shrink-0 ml-4 flex items-center gap-1.5"
                >
                  <Download size={14} /> Exportar base
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
