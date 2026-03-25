import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bus, Shield, AlertTriangle } from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import { useApp } from '../../context/AppContext'

export default function TermsPage() {
  const navigate = useNavigate()
  const { setOrderDraft } = useApp()
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [transport, setTransport] = useState(null)

  const canContinue = acceptedTerms && transport !== null

  function handleContinue() {
    if (!canContinue) return
    setOrderDraft({ transport })
    navigate('/emitir/confirmacao')
  }

  return (
    <EmployeeLayout step={3}>
      <h2 className="text-primary mb-1">Termos e transporte</h2>
      <p className="text-muted text-sm mb-5">Leia os termos abaixo e informe sua opção de transporte.</p>

      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-primary" />
          <h3 className="text-primary">Termo de Responsabilidade</h3>
        </div>
        <div className="bg-surface rounded-lg p-3 h-28 overflow-y-auto text-sm text-muted leading-relaxed mb-4 border border-border">
          <p>
            Ao aceitar este termo, o colaborador declara estar ciente de que o evento COPERNIC 2025 é de
            caráter corporativo e que qualquer conduta inadequada poderá resultar em medidas disciplinares.
            A empresa não se responsabiliza por incidentes pessoais, perdas materiais ou acidentes ocorridos
            durante o evento. O participante assume a responsabilidade pelo comportamento de seus acompanhantes.
            A utilização dos ingressos implica na aceitação integral das normas do evento. A empresa reserva-se
            o direito de negar a entrada a qualquer participante que descumpra as regras estabelecidas.
          </p>
        </div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={e => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
          />
          <span className="text-sm text-slate-700 group-hover:text-primary transition-colors">
            Li e aceito os termos de responsabilidade do evento
          </span>
        </label>
      </div>

      <div className="card mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Bus size={16} className="text-primary" />
          <h3 className="text-primary">Transporte Corporativo</h3>
        </div>
        <div className="bg-surface rounded-lg p-3 h-24 overflow-y-auto text-sm text-muted leading-relaxed mb-4 border border-border">
          <p>
            A empresa disponibilizará ônibus fretados saindo dos pontos definidos pelo RH. O transporte é
            gratuito e a empresa recomenda fortemente sua utilização. Caso opte por não utilizar o ônibus,
            o colaborador assume total responsabilidade pelo deslocamento ao local do evento.
          </p>
        </div>

        <p className="text-sm font-medium text-slate-700 mb-3">Você utilizará o ônibus corporativo?</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTransport(true)}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all
              ${transport === true
                ? 'border-success bg-green-50 text-success'
                : 'border-border text-muted hover:border-success hover:text-success'
              }`}
          >
            <Bus size={16} />
            Sim, vou de ônibus
          </button>
          <button
            onClick={() => setTransport(false)}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all
              ${transport === false
                ? 'border-danger bg-red-50 text-danger'
                : 'border-border text-muted hover:border-danger hover:text-danger'
              }`}
          >
            Não utilizarei
          </button>
        </div>

        {transport === false && (
          <div className="flex gap-2 mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertTriangle size={15} className="text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Você optou por não utilizar o ônibus. Você será responsável pelo seu deslocamento.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/emitir/participantes')} className="btn-secondary w-auto px-5">
          ← Voltar
        </button>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`flex-1 font-semibold py-3 rounded-card transition-all duration-150
            ${canContinue
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
