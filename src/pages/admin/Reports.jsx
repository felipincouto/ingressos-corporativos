import { useState, useEffect } from 'react'
import { Download, Users, Ticket, Bus, CheckCircle2, TrendingUp, BarChart2, Loader } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'
import { useApp } from '../../context/AppContext'

export default function Reports() {
  const { evento } = useApp()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState('')

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
    { label: 'Elegíveis',  value: total.toLocaleString('pt-BR'),                      icon: Users,        color: 'text-primary',        bg: 'bg-primary-light' },
    { label: 'Emitiram',   value: emitiram.toLocaleString('pt-BR'), sub: `${pctEmissao}%`, icon: TrendingUp, color: 'text-success',     bg: 'bg-green-50' },
    { label: 'Ingressos',  value: (stats.total_ingressos || 0).toLocaleString('pt-BR'), icon: Ticket,     color: 'text-primary-medium', bg: 'bg-blue-50' },
    { label: 'Presentes',  value: (stats.checkins || 0).toLocaleString('pt-BR'), sub: 'check-in', icon: CheckCircle2, color: 'text-success', bg: 'bg-green-50' },
    { label: 'Ônibus',     value: (stats.onibus || 0).toLocaleString('pt-BR'), sub: 'optaram', icon: Bus, color: 'text-accent',          bg: 'bg-accent-light' },
    { label: 'Retiradas',  value: (stats.retiradas || 0).toLocaleString('pt-BR'),      icon: BarChart2,   color: 'text-primary',        bg: 'bg-primary-light' },
  ] : []

  function downloadCSV(rows, filename) {
    const csv = rows.map(r => r.join(';')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
    a.download = filename
    a.click()
  }

  function exportSetores() {
    if (!stats?.setores) return
    const rows = [['Setor', 'Total', 'Emitiram', '% Adesão']]
    stats.setores.forEach(s => {
      const pct = s.total > 0 ? Math.round((Number(s.emitiram) / Number(s.total)) * 100) : 0
      rows.push([s.setor || '—', s.total, s.emitiram, `${pct}%`])
    })
    downloadCSV(rows, 'relatorio-setores.csv')
  }

  async function exportBase() {
    setExporting('sorteio')
    try {
      const data = await fetch('/api/admin/export?type=sorteio').then(r => r.json())
      const rows = [['Pedido', 'Funcionário', 'Setor', 'Matrícula', 'Código Sorteio', 'Ônibus', 'Status']]
      ;(data.rows || []).forEach(p => rows.push([
        p.pedido, p.nome, p.setor || '—', p.matricula || '—',
        p.codigo_sorteio, p.transporte ? 'Sim' : 'Não', p.status,
      ]))
      downloadCSV(rows, 'base-sorteio.csv')
    } catch {
      alert('Erro ao exportar. Tente novamente.')
    } finally {
      setExporting('')
    }
  }

  async function exportCompleto() {
    setExporting('completo')
    try {
      const data = await fetch('/api/admin/export?type=completo').then(r => r.json())
      const rows = [['Pedido', 'Titular', 'Email', 'Setor', 'Matrícula', 'Participante', 'Vínculo', 'Código Ingresso', 'Status Ingresso', 'Ônibus', 'Código Sorteio', 'Status Pedido']]
      ;(data.rows || []).forEach(p => rows.push([
        p.pedido, p.titular, p.email, p.setor || '—', p.matricula || '—',
        p.participante, p.vinculo, p.ingresso, p.status_ingresso,
        p.transporte ? 'Sim' : 'Não', p.codigo_sorteio || '—', p.status_pedido,
      ]))
      downloadCSV(rows, 'base-completa.csv')
    } catch {
      alert('Erro ao exportar. Tente novamente.')
    } finally {
      setExporting('')
    }
  }

  return (
    <div>
      <AdminHeader
        title="Relatórios"
        subtitle={`${evento?.nome || 'Evento'} · Dados em tempo real`}
        action={
          <div className="flex gap-2">
            <button onClick={exportSetores} className="btn-secondary w-auto px-4 py-2 text-sm flex items-center gap-1.5">
              <Download size={14} /> Setores CSV
            </button>
            <button onClick={exportCompleto} disabled={!!exporting} className="btn-secondary w-auto px-4 py-2 text-sm flex items-center gap-1.5">
              {exporting === 'completo'
                ? <span className="inline-block w-3 h-3 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                : <Download size={14} />}
              Base completa
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-800">Emissão por setor</h3>
                  <button onClick={exportSetores} className="btn-secondary w-auto px-3 py-1.5 text-xs flex items-center gap-1">
                    <Download size={12} /> CSV
                  </button>
                </div>
                <div className="space-y-4">
                  {stats.setores.map(s => {
                    const pct = s.total > 0 ? Math.round((Number(s.emitiram) / Number(s.total)) * 100) : 0
                    const barColor = pct >= 75 ? '#10B981' : pct >= 50 ? '#2D6A9F' : '#DC0032'
                    return (
                      <div key={s.setor}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-slate-700">{s.setor || '—'}</span>
                          <span className="text-sm text-muted">{s.emitiram} / {s.total} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-border rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Raffle base export card */}
            <div className="card" style={{ border: '2px dashed #DC0032', background: '#FFF0F2' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 style={{ color: '#B8002A', marginBottom: 4 }}>Base para sorteio</h3>
                  <p className="text-sm" style={{ color: '#7F1D1D' }}>
                    {emitiram.toLocaleString('pt-BR')} cupons de titulares elegíveis para o sorteio.
                    Exporte a lista completa com os códigos de 4 dígitos para conduzir o sorteio.
                  </p>
                </div>
                <button
                  onClick={exportBase}
                  disabled={!!exporting}
                  className="btn-primary w-auto px-4 py-2 text-sm shrink-0 ml-4 flex items-center gap-1.5"
                >
                  {exporting === 'sorteio'
                    ? <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Download size={14} />}
                  Exportar base
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
