import { useState } from 'react'
import { QrCode, Search, CheckCircle2, XCircle, AlertTriangle, Ticket } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'

const RESULTS = {
  valid:    { type: 'valid',    ing: 'ING-001', nome: 'João Silva',  vinculo: 'Titular',  evento: 'COPERNIC 2025', hora: '18:42' },
  used:     { type: 'used',    ing: 'ING-002', nome: 'Maria Silva', vinculo: 'Cônjuge',  evento: 'COPERNIC 2025', hora: '17:30' },
  invalid:  { type: 'invalid' },
}

export default function CheckIn() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)

  const recent = [
    { nome: 'João Silva',    ing: 'ING-001', hora: '18:42', ok: true },
    { nome: 'Maria Silva',   ing: 'ING-002', hora: '18:38', ok: false },
    { nome: 'Pedro Silva',   ing: 'ING-003', hora: '18:35', ok: true },
    { nome: 'Carlos Lima',   ing: 'ING-010', hora: '18:30', ok: true },
  ]

  function handleScan() {
    if (!code) return
    const r = code === 'ING-002' ? RESULTS.used : code.startsWith('ING') ? RESULTS.valid : RESULTS.invalid
    setResult(r)
    setCode('')
  }

  return (
    <div>
      <AdminHeader title="Check-in" subtitle="Leitura de QR Code na entrada do evento" />

      <div className="p-6 space-y-5 max-w-2xl">
        {/* Scanner area */}
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
                className="input pl-9 text-sm"
                placeholder="Código do ingresso (ex: ING-001)"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
              />
            </div>
            <button onClick={handleScan} className="btn-primary w-auto px-5 text-sm">
              Validar
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`card border-2 transition-all ${
            result.type === 'valid'   ? 'border-success bg-green-50' :
            result.type === 'used'    ? 'border-danger bg-red-50' :
                                        'border-accent bg-amber-50'
          }`}>
            {result.type === 'valid' && (
              <div className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-success text-lg">VÁLIDO ✓</p>
                  <p className="font-semibold text-slate-800">{result.nome} — {result.vinculo}</p>
                  <p className="text-sm text-muted">{result.evento} · {result.ing}</p>
                  <p className="text-xs text-muted mt-1">Entrada registrada às {result.hora}</p>
                </div>
              </div>
            )}
            {result.type === 'used' && (
              <div className="flex items-start gap-3">
                <XCircle size={24} className="text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-danger text-lg">JÁ UTILIZADO ✗</p>
                  <p className="font-semibold text-slate-800">{result.nome}</p>
                  <p className="text-sm text-muted">Entrada registrada às {result.hora}</p>
                </div>
              </div>
            )}
            {result.type === 'invalid' && (
              <div className="flex items-start gap-3">
                <AlertTriangle size={24} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-700 text-lg">INGRESSO INVÁLIDO ⚠</p>
                  <p className="text-sm text-muted">Código não encontrado no sistema.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent */}
        <div className="card">
          <h3 className="text-slate-800 mb-3">Últimas leituras</h3>
          <div className="space-y-2">
            {recent.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2.5">
                  {r.ok
                    ? <CheckCircle2 size={14} className="text-success" />
                    : <XCircle size={14} className="text-danger" />
                  }
                  <div>
                    <p className="text-sm font-medium text-slate-800">{r.nome}</p>
                    <p className="text-xs text-muted font-mono">{r.ing}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={r.ok ? 'badge-green' : 'badge-red'}>{r.ok ? 'OK' : 'Duplicado'}</span>
                  <span className="text-xs text-muted">{r.hora}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="card flex-1 text-center">
            <p className="text-2xl font-bold text-success">393</p>
            <p className="text-xs text-muted">Entradas validadas</p>
          </div>
          <div className="card flex-1 text-center">
            <p className="text-2xl font-bold text-danger">4</p>
            <p className="text-xs text-muted">Tentativas inválidas</p>
          </div>
          <div className="card flex-1 text-center">
            <p className="text-2xl font-bold text-primary">4.497</p>
            <p className="text-xs text-muted">Aguardando entrada</p>
          </div>
        </div>
      </div>
    </div>
  )
}
