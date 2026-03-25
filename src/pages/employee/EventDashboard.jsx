import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Ticket, ChevronRight, ClipboardList } from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import { useApp } from '../../context/AppContext'

export default function EventDashboard() {
  const navigate = useNavigate()
  const { user, evento } = useApp()

  // Proteção de rota
  useEffect(() => {
    if (!user) navigate('/', { replace: true })
  }, [user])

  if (!user) return null

  return (
    <EmployeeLayout showSteps={false}>
      <div className="mb-4">
        <p className="text-muted text-sm">Bem-vindo,</p>
        <h1 className="text-primary">{user.nome}</h1>
        <p className="text-xs text-muted mt-0.5">{user.setor} · Matrícula {user.matricula || '—'}</p>
      </div>

      <div className="rounded-card overflow-hidden shadow-card-md mb-5">
        <div className="bg-gradient-to-r from-primary to-primary-medium p-6 pb-8 relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-1">Evento</p>
          <h2 className="text-white text-2xl font-bold">{evento?.nome || 'Carregando...'}</h2>
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-white/70 text-sm">
              <Calendar size={13} /> {evento?.data ? new Date(evento.data + 'T12:00:00').toLocaleDateString('pt-BR', {day:'numeric',month:'long',year:'numeric'}) : ''}
            </span>
            <span className="flex items-center gap-1.5 text-white/70 text-sm">
              <MapPin size={13} /> {evento?.local || ''}
            </span>
          </div>
        </div>

        <div className="bg-white px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-muted text-sm mb-0.5">Seus ingressos disponíveis</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-primary leading-none">{user.max_ingressos}</span>
              <span className="text-muted text-sm mb-1">ingressos</span>
            </div>
          </div>
          <div className="bg-primary-light rounded-xl p-3">
            <Ticket size={28} className="text-primary" />
          </div>
        </div>

        <div className="bg-accent-light border-t border-red-200 px-6 py-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <p className="text-accent text-sm font-medium">
            Prazo para emissão: até <strong>{evento?.prazo_emissao ? new Date(evento.prazo_emissao + 'T12:00:00').toLocaleDateString('pt-BR', {day:'numeric',month:'long',year:'numeric'}) : ''}</strong>
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/emitir/quantidade')}
        className="btn-primary flex items-center justify-center gap-2 mb-3"
      >
        <Ticket size={17} />
        Gerar meus ingressos
        <ChevronRight size={16} />
      </button>

      <button
        onClick={() => navigate('/meus-pedidos')}
        className="btn-secondary flex items-center justify-center gap-2"
      >
        <ClipboardList size={17} />
        Ver meus pedidos
      </button>

      <div className="mt-6 bg-primary-light rounded-card p-4">
        <p className="text-primary text-sm font-semibold mb-1">Como funciona?</p>
        <ul className="text-sm text-primary/70 space-y-1 list-disc list-inside">
          <li>Escolha quantos ingressos deseja emitir (até o seu limite)</li>
          <li>Preencha os dados de cada participante</li>
          <li>Aceite os termos e informe sobre o transporte</li>
          <li>Retire seu kit impresso no RH antes do evento</li>
        </ul>
      </div>
    </EmployeeLayout>
  )
}
