import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info } from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import { useApp } from '../../context/AppContext'

export default function SelectQuantity() {
  const navigate = useNavigate()
  const { user, setOrderDraft } = useApp()
  const max = user?.max_ingressos || 5
  const [selected, setSelected] = useState(null)

  function handleContinue() {
    if (!selected) return
    setOrderDraft({ quantity: selected, participants: [], transport: null })
    navigate('/emitir/participantes')
  }

  return (
    <EmployeeLayout step={1}>
      <h2 className="text-primary mb-1">Quantos ingressos?</h2>
      <p className="text-muted text-sm mb-6">
        Você tem direito a até <strong className="text-primary">{max} ingressos</strong> para este evento.
      </p>

      <div className="card mb-4">
        <p className="text-sm font-medium text-slate-700 mb-3">Selecione a quantidade:</p>
        <div className="flex gap-3 flex-wrap">
          {Array.from({ length: max }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setSelected(n)}
              className={`w-14 h-14 rounded-xl font-bold text-lg transition-all duration-150 border-2
                ${selected === n
                  ? 'bg-primary text-white border-primary shadow-card-md scale-105'
                  : 'bg-white text-slate-700 border-border hover:border-primary hover:text-primary'
                }`}
            >
              {n}
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted">
              Você selecionou <strong className="text-primary">{selected} ingresso{selected > 1 ? 's' : ''}</strong>
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 bg-primary-light rounded-card p-4 mb-6">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-primary/70">
          Você pode emitir menos ingressos que o seu limite, mas não será possível
          aumentar a quantidade após a confirmação.
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/evento')} className="btn-secondary w-auto px-5">
          ← Voltar
        </button>
        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`flex-1 font-semibold py-3 rounded-card transition-all duration-150
            ${selected
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
