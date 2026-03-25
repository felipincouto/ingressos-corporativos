import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Ticket, Bus, Users, AlertTriangle, ClipboardList } from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import { useApp } from '../../context/AppContext'

export default function OrderConfirmation() {
  const navigate = useNavigate()
  const { user, orderDraft, setOrderDraft } = useApp()
  const { quantity, participants, transport } = orderDraft
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funcionario_id: user.id,
          transporte: transport,
          participantes: participants.map((p, i) => ({
            nome: p.name,
            dob: p.dob || null,
            cpf: p.cpf || null,
            vinculo: i === 0 ? 'Titular' : p.vinculo,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar pedido')
      // Limpar rascunho e ir para meus pedidos
      setOrderDraft({ quantity: null, participants: [], transport: null })
      navigate('/meus-pedidos')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!quantity || !participants?.length) {
    return (
      <EmployeeLayout step={4}>
        <div className="card text-center py-10">
          <p className="text-muted mb-4">Nenhum pedido em andamento.</p>
          <button onClick={() => navigate('/emitir/quantidade')} className="btn-primary w-auto mx-auto px-6">
            Iniciar emissão
          </button>
        </div>
      </EmployeeLayout>
    )
  }

  return (
    <EmployeeLayout step={4}>
      <h2 className="text-primary mb-1">Revise seu pedido</h2>
      <p className="text-muted text-sm mb-5">Verifique os dados antes de confirmar. Esta ação não poderá ser desfeita.</p>

      <div className="card mb-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide mb-0.5">Evento</p>
            <p className="font-semibold text-slate-800">COPERNIC 2025</p>
            <p className="text-sm text-muted">15 de Março de 2025 · Expo SP</p>
          </div>
          <span className="badge-blue">{quantity} ingresso{quantity > 1 ? 's' : ''}</span>
        </div>

        <div className="border-t border-border" />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-muted" />
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Participantes</p>
          </div>
          <div className="space-y-1.5">
            {participants.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="text-sm text-slate-700">{p.name}</p>
                <span className={`badge ${i === 0 ? 'badge-blue' : 'badge-gray'}`}>
                  {i === 0 ? 'Titular' : p.vinculo}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus size={14} className="text-muted" />
            <p className="text-sm text-slate-700">Transporte corporativo</p>
          </div>
          {transport
            ? <span className="badge-green">Sim, ônibus</span>
            : <span className="badge-gray">Não utilizarei</span>
          }
        </div>

        <div className="border-t border-border" />

        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} className="text-success" />
          <p className="text-sm text-slate-700">Termos aceitos</p>
        </div>
      </div>

      <div className="flex gap-2.5 bg-red-50 border border-red-200 rounded-card p-4 mb-5">
        <AlertTriangle size={16} className="text-accent shrink-0 mt-0.5" />
        <p className="text-sm text-accent">
          Após confirmar, <strong>não será possível alterar</strong> os dados do pedido.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <div className="flex gap-3 mb-3">
        <button onClick={() => navigate('/emitir/termos')} className="btn-secondary w-auto px-5">
          ← Voltar
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 bg-success text-white font-semibold py-3 rounded-card hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
        >
          {loading
            ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <Ticket size={17} />
          }
          {loading ? 'Gerando ingressos...' : 'Confirmar e gerar ingressos'}
        </button>
      </div>

      <button
        onClick={() => navigate('/meus-pedidos')}
        className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
      >
        <ClipboardList size={14} />
        Ver meus pedidos existentes
      </button>
    </EmployeeLayout>
  )
}
