import { useState, useRef } from 'react'
import { Upload, CheckCircle2, AlertTriangle, XCircle, FileSpreadsheet, Loader } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return { records: [], errors: [] }

  const headers = lines[0].split(/[,;]/).map(h => h.trim().toLowerCase().replace(/[^a-z_]/g, ''))
  const records = []
  const errors = []

  const COL = {
    nome:         headers.findIndex(h => h === 'nome'),
    email:        headers.findIndex(h => h === 'email'),
    nascimento:   headers.findIndex(h => ['nascimento', 'data_nascimento'].includes(h)),
    max_ingressos:headers.findIndex(h => ['max_ingressos', 'max', 'ingressos'].includes(h)),
    matricula:    headers.findIndex(h => h === 'matricula'),
    setor:        headers.findIndex(h => h === 'setor'),
  }

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(/[,;]/).map(c => c.trim().replace(/^"|"$/g, ''))
    const row = {
      _linha: i + 1,
      nome:          COL.nome >= 0         ? cols[COL.nome] : '',
      email:         COL.email >= 0        ? cols[COL.email] : '',
      nascimento:    COL.nascimento >= 0   ? cols[COL.nascimento] : '',
      max_ingressos: COL.max_ingressos >= 0 ? Number(cols[COL.max_ingressos]) : 0,
      matricula:     COL.matricula >= 0    ? cols[COL.matricula] : '',
      setor:         COL.setor >= 0        ? cols[COL.setor] : '',
    }

    if (!row.nome) { errors.push({ linha: row._linha, msg: 'Nome ausente' }); continue }
    if (!row.email || !row.email.includes('@')) { errors.push({ linha: row._linha, msg: `E-mail inválido (${row.nome})` }); continue }
    if (!row.nascimento) { errors.push({ linha: row._linha, msg: `Data de nascimento ausente (${row.nome})` }); continue }
    if (!row.max_ingressos || row.max_ingressos <= 0) { errors.push({ linha: row._linha, msg: `Máx. ingressos inválido (${row.nome})` }); continue }

    records.push(row)
  }

  return { records, errors }
}

export default function ImportPage() {
  const [dragging, setDragging] = useState(false)
  const [parsed, setParsed] = useState(null)   // { records, errors, fileName }
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileRef = useRef(null)

  function processFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      const { records, errors } = parseCSV(e.target.result)
      setParsed({ records, errors, fileName: file.name })
      setImportResult(null)
    }
    reader.readAsText(file, 'UTF-8')
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  async function handleConfirm() {
    if (!parsed?.records.length || importing) return
    setImporting(true)
    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registros: parsed.records }),
      })
      const data = await res.json()
      setImportResult(data)
      setParsed(null)
    } catch {
      setImportResult({ error: 'Erro ao conectar com o servidor.' })
    } finally {
      setImporting(false)
    }
  }

  function reset() {
    setParsed(null)
    setImportResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      <AdminHeader title="Importar Base" subtitle="Carregue a planilha de funcionários autorizados" />

      <div className="p-6 space-y-5 max-w-3xl">
        {!parsed && !importResult && (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-card p-10 text-center cursor-pointer transition-all duration-150
                ${dragging ? 'border-primary bg-primary-light' : 'border-border hover:border-primary-medium hover:bg-surface'}`}
            >
              <FileSpreadsheet size={36} className={`mx-auto mb-3 ${dragging ? 'text-primary' : 'text-muted'}`} />
              <p className="font-semibold text-slate-700 mb-1">Arraste o arquivo ou clique para enviar</p>
              <p className="text-sm text-muted">.csv · separado por vírgula ou ponto-e-vírgula</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={e => processFile(e.target.files[0])}
              />
            </div>

            <div className="card">
              <h3 className="text-slate-800 mb-3">Colunas esperadas na planilha</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { col: 'nome', required: true },
                  { col: 'email', required: true },
                  { col: 'nascimento', required: true },
                  { col: 'max_ingressos', required: true },
                  { col: 'matricula', required: false },
                  { col: 'setor', required: false },
                ].map(c => (
                  <div key={c.col} className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2">
                    {c.required
                      ? <CheckCircle2 size={13} className="text-success shrink-0" />
                      : <div className="w-3 h-3 rounded-full border-2 border-border shrink-0" />
                    }
                    <span className="text-sm font-mono text-slate-700">{c.col}</span>
                    {!c.required && <span className="text-xs text-muted">(opcional)</span>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {parsed && (
          <div className="card">
            <h3 className="text-slate-800 mb-3">Resultado da leitura — {parsed.fileName}</h3>
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2.5 bg-green-50 rounded-lg px-3 py-2.5">
                <CheckCircle2 size={15} className="text-success" />
                <span className="text-sm text-slate-700"><strong>{parsed.records.length}</strong> registros válidos</span>
              </div>
              {parsed.errors.length > 0 && (
                <div className="flex items-start gap-2.5 bg-red-50 rounded-lg px-3 py-2.5">
                  <XCircle size={15} className="text-danger shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-700">
                    <strong>{parsed.errors.length}</strong> registros com erro:
                    <ul className="mt-1 space-y-0.5">
                      {parsed.errors.slice(0, 5).map((e, i) => (
                        <li key={i} className="text-xs text-muted">Linha {e.linha}: {e.msg}</li>
                      ))}
                      {parsed.errors.length > 5 && (
                        <li className="text-xs text-muted">...e mais {parsed.errors.length - 5}</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {parsed.records.length > 0 && (
              <>
                <p className="text-xs text-muted uppercase tracking-wide font-medium mb-2">Prévia dos dados</p>
                <div className="overflow-x-auto rounded-lg border border-border mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-surface">
                      <tr>
                        {['Nome', 'E-mail', 'Nascimento', 'Máx. Ingressos'].map(h => (
                          <th key={h} className="text-left text-xs font-medium text-muted px-3 py-2 border-b border-border">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.records.slice(0, 5).map((r, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-surface">
                          <td className="px-3 py-2 font-medium text-slate-800">{r.nome}</td>
                          <td className="px-3 py-2 text-muted">{r.email}</td>
                          <td className="px-3 py-2 text-muted">{r.nascimento}</td>
                          <td className="px-3 py-2"><span className="badge-blue">{r.max_ingressos} ingressos</span></td>
                        </tr>
                      ))}
                      {parsed.records.length > 5 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-2 text-xs text-muted text-center">
                            ...e mais {parsed.records.length - 5} registros
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button onClick={reset} className="btn-secondary w-auto px-5">Cancelar</button>
              <button
                onClick={handleConfirm}
                disabled={importing || parsed.records.length === 0}
                className="btn-primary flex items-center gap-2 disabled:opacity-60"
              >
                {importing
                  ? <Loader size={15} className="animate-spin" />
                  : <Upload size={15} />
                }
                {importing ? 'Importando...' : `Confirmar importação (${parsed.records.length} registros)`}
              </button>
            </div>
          </div>
        )}

        {importResult && (
          <div className="card">
            {importResult.error ? (
              <div className="flex items-center gap-2.5 bg-red-50 rounded-lg px-3 py-2.5">
                <XCircle size={15} className="text-danger" />
                <span className="text-sm text-slate-700">{importResult.error}</span>
              </div>
            ) : (
              <>
                <h3 className="text-slate-800 mb-3">Importação concluída</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2.5 bg-green-50 rounded-lg px-3 py-2.5">
                    <CheckCircle2 size={15} className="text-success" />
                    <span className="text-sm text-slate-700"><strong>{importResult.inserted}</strong> novos registros inseridos</span>
                  </div>
                  {importResult.updated > 0 && (
                    <div className="flex items-center gap-2.5 bg-blue-50 rounded-lg px-3 py-2.5">
                      <AlertTriangle size={15} className="text-primary" />
                      <span className="text-sm text-slate-700"><strong>{importResult.updated}</strong> registros atualizados</span>
                    </div>
                  )}
                  {importResult.errors?.length > 0 && (
                    <div className="flex items-center gap-2.5 bg-red-50 rounded-lg px-3 py-2.5">
                      <XCircle size={15} className="text-danger" />
                      <span className="text-sm text-slate-700"><strong>{importResult.errors.length}</strong> registros com falha</span>
                    </div>
                  )}
                </div>
              </>
            )}
            <button onClick={reset} className="btn-secondary w-auto px-5">Nova importação</button>
          </div>
        )}
      </div>
    </div>
  )
}
