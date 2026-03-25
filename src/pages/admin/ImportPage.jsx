import { useState } from 'react'
import { Upload, CheckCircle2, AlertTriangle, XCircle, FileSpreadsheet } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'

const PREVIEW = [
  { nome: 'João Silva', email: 'joao@empresa.com', nascimento: '10/05/1985', max: 5 },
  { nome: 'Ana Costa', email: 'ana@empresa.com', nascimento: '22/08/1990', max: 3 },
  { nome: 'Carlos Lima', email: 'carlos@empresa.com', nascimento: '01/01/1982', max: 4 },
]

export default function ImportPage() {
  const [dragging, setDragging] = useState(false)
  const [imported, setImported] = useState(false)

  return (
    <div>
      <AdminHeader title="Importar Base" subtitle="Carregue a planilha de funcionários autorizados" />

      <div className="p-6 space-y-5 max-w-3xl">
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); setImported(true) }}
          onClick={() => setImported(true)}
          className={`border-2 border-dashed rounded-card p-10 text-center cursor-pointer transition-all duration-150
            ${dragging ? 'border-primary bg-primary-light' : 'border-border hover:border-primary-medium hover:bg-surface'}
          `}
        >
          <FileSpreadsheet size={36} className={`mx-auto mb-3 ${dragging ? 'text-primary' : 'text-muted'}`} />
          <p className="font-semibold text-slate-700 mb-1">Arraste o arquivo ou clique para enviar</p>
          <p className="text-sm text-muted">.xlsx ou .csv · Até 10 MB</p>
        </div>

        {/* Columns guide */}
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

        {/* Result */}
        {imported && (
          <div className="card">
            <h3 className="text-slate-800 mb-3">Resultado da importação</h3>
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2.5 bg-green-50 rounded-lg px-3 py-2.5">
                <CheckCircle2 size={15} className="text-success" />
                <span className="text-sm text-slate-700"><strong>1.487</strong> registros válidos</span>
              </div>
              <div className="flex items-center gap-2.5 bg-amber-50 rounded-lg px-3 py-2.5">
                <AlertTriangle size={15} className="text-accent" />
                <span className="text-sm text-slate-700"><strong>3</strong> registros com e-mail inválido</span>
              </div>
              <div className="flex items-center gap-2.5 bg-red-50 rounded-lg px-3 py-2.5">
                <XCircle size={15} className="text-danger" />
                <span className="text-sm text-slate-700"><strong>1</strong> registro sem nome</span>
              </div>
            </div>

            {/* Preview table */}
            <p className="text-xs text-muted uppercase tracking-wide font-medium mb-2">Prévia dos dados</p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface">
                  <tr>
                    {['Nome', 'E-mail', 'Nascimento', 'Máx. Ingressos'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted px-3 py-2 border-b border-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PREVIEW.map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-surface">
                      <td className="px-3 py-2 font-medium text-slate-800">{r.nome}</td>
                      <td className="px-3 py-2 text-muted">{r.email}</td>
                      <td className="px-3 py-2 text-muted">{r.nascimento}</td>
                      <td className="px-3 py-2">
                        <span className="badge-blue">{r.max} ingressos</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 mt-4">
              <button className="btn-secondary w-auto px-5">Cancelar</button>
              <button className="btn-primary">
                <Upload size={15} className="inline mr-2" />
                Confirmar importação (1.487 registros)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
