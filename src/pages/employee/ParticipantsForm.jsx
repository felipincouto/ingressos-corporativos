import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, ChevronDown, ChevronUp } from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout'

const VINCULOS = ['Cônjuge', 'Filho/a', 'Acompanhante']
const COUNT = 3 // demo — should come from route state

function ParticipantCard({ index, data, onChange }) {
  const [open, setOpen] = useState(true)
  const isTitular = index === 0
  const hasName = data.name.trim().length > 0

  return (
    <div className={`card mb-3 overflow-hidden ${!hasName ? 'border border-red-200' : ''}`}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2.5">
          <div className={`rounded-full p-1.5 ${isTitular ? 'bg-primary text-white' : 'bg-surface'}`}>
            <User size={14} className={isTitular ? 'text-white' : 'text-muted'} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">
              {data.name.trim() || `Participante ${index + 1}`}
              {isTitular && (
                <span className="ml-2 badge-blue text-xs">Titular</span>
              )}
            </p>
            <p className="text-xs text-muted">{isTitular ? 'Você (funcionário)' : 'Dependente / Acompanhante'}</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>

      {/* Fields */}
      {open && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nome completo *</label>
            <input
              className="input"
              placeholder="Nome completo"
              value={data.name}
              onChange={e => onChange({ ...data, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data de nascimento</label>
              <input
                type="date"
                className="input"
                value={data.dob}
                onChange={e => onChange({ ...data, dob: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">CPF (opcional)</label>
              <input
                className="input"
                placeholder="000.000.000-00"
                value={data.cpf}
                onChange={e => onChange({ ...data, cpf: e.target.value })}
              />
            </div>
          </div>
          {!isTitular && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Vínculo *</label>
              <div className="flex flex-wrap gap-2">
                {VINCULOS.map(v => (
                  <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name={`vinculo-${index}`}
                      value={v}
                      checked={data.vinculo === v}
                      onChange={() => onChange({ ...data, vinculo: v })}
                      className="accent-primary"
                    />
                    <span className="text-sm text-slate-700">{v}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const emptyParticipant = () => ({ name: '', dob: '', cpf: '', vinculo: '' })

export default function ParticipantsForm() {
  const navigate = useNavigate()
  const [participants, setParticipants] = useState(
    Array.from({ length: COUNT }, emptyParticipant)
  )
  const [touched, setTouched] = useState(false)

  const allNamesFilledAndVinculos = participants.every((p, i) => {
    const nameOk = p.name.trim().length > 0
    const vinculoOk = i === 0 || p.vinculo !== ''
    return nameOk && vinculoOk
  })

  function handleUpdate(index, data) {
    setParticipants(prev => prev.map((p, i) => i === index ? data : p))
  }

  function handleContinue() {
    setTouched(true)
    if (allNamesFilledAndVinculos) navigate('/emitir/termos')
  }

  return (
    <EmployeeLayout step={2}>
      <h2 className="text-primary mb-1">Dados dos participantes</h2>
      <p className="text-muted text-sm mb-5">
        Preencha os dados de cada pessoa que irá ao evento.
      </p>

      {participants.map((p, i) => (
        <ParticipantCard
          key={i}
          index={i}
          data={p}
          onChange={data => handleUpdate(i, data)}
        />
      ))}

      {touched && !allNamesFilledAndVinculos && (
        <p className="text-xs text-danger mb-3">
          Preencha o nome e o vínculo de todos os participantes para continuar.
        </p>
      )}

      <div className="flex gap-3 mt-2">
        <button onClick={() => navigate('/emitir/quantidade')} className="btn-secondary w-auto px-5">
          ← Voltar
        </button>
        <button
          onClick={handleContinue}
          className={`flex-1 font-semibold py-3 rounded-card transition-all duration-150
            ${allNamesFilledAndVinculos
              ? 'bg-accent text-white hover:bg-amber-500'
              : 'bg-border text-muted cursor-not-allowed'
            }`}
        >
          Continuar →
        </button>
      </div>
    </EmployeeLayout>
  )
}
