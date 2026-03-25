import { useState, useEffect, useRef } from 'react'
import { QrCode, Search, CheckCircle2, XCircle, AlertTriangle, Loader } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'

export default function CheckIn() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState([])
  const [stats, setStats] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
    inputRef.current?.focus()
  }, [])

  async function handleScan() {
    const trimmed = code.trim()
    if (!trimmed || loading) return
    setLoading(true)
    setResult(null)
    setCode('')
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: trimmed }),
      })
      const data = await res.json()
      const ing = data.ingresso || {}
      const entry = {
        codigo: trimmed,
        nome: ing.nome || '—',
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        resultado: data.resultado,
      }
      setResult({ ...data, entry })
      setRecent(r => [entry, ...r].slice(0, 10))
      if (data.resultado === 'valido') {
        setStats(s => s ? { ...s, checkins: (s.checkins || 0) + 1 } : s)
      }
    } catch {
      setResult({ resultado: 'erro' })
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const ing = result?.ingresso || {}

  return (
    <div>
      <AdminHeader title="Check-in" subtitle="Leitura de QR Code na entrada do evento" />

      <div className="p-6 space-y-5 max-w-2xl">
        <div className="card text-center">
          <div className="mx-auto w-48 h-48 bg-surface border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center mb-5">
            <QrCode size={48} className="text-border mb-2" />
            <p className="text-xs text-muted">Aponte o leitor aqui</p>
          </div>

          <p className="text-sm text-muted mb-2">Ou insira o código manualmente:</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                ref={inputRef}
                className="input pl-9 text-sm"
                placeholder="Código do ingresso (ex: ING-001)"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
              />
            </div>
            <button
              onClick={handleScan}
              disabled={loading || !code.trim()}
              className="btn-primary w-auto px-5 text-sm disabled:opacity-60 flex items-center gap-2"
            >
              {loading && <Loader size={14} className="animate-spin" />}
              Validar
            </button>
          </div>
        </div>

        {result && (
          <div className={`card border-2 transition-all ${
            result.resultado === 'valido'    ? 'border-success bg-green-50' :
            result.resultado === 'duplicado' ? 'border-danger bg-red-50' :
                                               'border-accent bg-red-50'
          }`}>
            {result.resultado === 'valido' && (
              <div className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-success text-lg">VÁLIDO ✓</p>
                  <p className="font-semibold text-slate-800">{ing.nome} — {ing.vinculo}</p>
                  <p className="text-sm text-muted">Pedido {ing.pedido_codigo} · {result.entry?.codigo}</p>
                  <p className="text-xs text-muted mt-1">Entrada registrada às {result.entry?.hora}</p>
                </div>
              </div>
            )}
            {result.resultado === 'duplicado' && (
              <div className="flex items-start gap-3">
                <XCircle size={24} className="text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-danger text-lg">JÁ UTILIZADO ✗</p>
                  <p className="font-semibold text-slate-800">{ing.nome}</p>
                  <p className="text-sm text-muted">
                    Entrada anterior: {ing.usado_em ? new Date(ing.usado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                </div>
              </div>
            )}
            {result.resultado === 'invalido' && (
              <div className="flex items-start gap-3">
                <AlertTriangle size={24} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-accent text-lg">INGRESSO INVÁLIDO ⚠</p>
                  <p className="text-sm text-muted">Código não encontrado no sistema.</p>
                </div>
              </div>
            )}
            {result.resultado === 'erro' && (
              <div className="flex items-start gap-3">
                <AlertTriangle size={24} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-accent text-lg">ERRO DE CONEXÃO</p>
                  <p className="text-sm text-muted">Não foi possível validar o ingresso.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {recent.length > 0 && (
          <div className="card">
            <h3 className="text-slate-800 mb-3">Últimas leituras</h3>
            <div className="space-y-2">
              {recent.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2.5">
                    {r.resultado === 'valido'
                      ? <CheckCircle2 size={14} className="text-success" />
                      : <XCircle size={14} className="text-danger" />
                    }
                    <div>
                      <p className="text-sm font-medium text-slate-800">{r.nome}</p>
                      <p className="text-xs text-muted font-mono">{r.codigo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={r.resultado === 'valido' ? 'badge-green' : 'badge-red'}>
                      {r.resultado === 'valido' ? 'OK' : 'Duplicado'}
                    </span>
                    <span className="text-xs text-muted">{r.hora}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <div className="card flex-1 text-center">
            <p className="text-2xl font-bold text-success">{(stats?.checkins || 0).toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted">Entradas validadas</p>
          </div>
          <div className="card flex-1 text-center">
            <p className="text-2xl font-bold text-primary">{(stats?.total_ingressos || 0).toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted">Total de ingressos</p>
          </div>
          <div className="card flex-1 text-center">
            <p className="text-2xl font-bold text-slate-700">
              {stats ? (stats.total_ingressos - stats.checkins).toLocaleString('pt-BR') : '—'}
            </p>
            <p className="text-xs text-muted">Aguardando entrada</p>
          </div>
        </div>
      </div>
    </div>
  )
}
