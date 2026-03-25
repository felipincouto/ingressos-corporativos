import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Trophy } from 'lucide-react'
import QRCode from 'qrcode.react'
import { useApp } from '../../context/AppContext'
import generateTicketsPDF from '../../utils/generateTicketsPDF'

export default function TicketViewer() {
  const { pedidoId } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()

  const [pedido, setPedido] = useState(null)
  const [participantes, setParticipantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/pedidos?funcionario_id=${user.id}`)
      .then(r => r.json())
      .then(data => {
        const found = (data.pedidos || []).find(p => String(p.codigo) === String(pedidoId))
        if (!found) {
          setError('Pedido não encontrado.')
        } else {
          setPedido(found)
          setParticipantes((found.participantes || []).filter(p => p && p.nome))
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Erro ao carregar ingressos.')
        setLoading(false)
      })
  }, [user?.id, pedidoId])

  function handleScroll() {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const index = Math.round(el.scrollLeft / el.clientWidth)
    setCurrentIndex(index)
  }

  function scrollToCard(index) {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ left: index * scrollRef.current.clientWidth, behavior: 'smooth' })
    setCurrentIndex(index)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#94A3B8', fontSize: 16 }}>Carregando ingressos...</div>
      </div>
    )
  }

  if (error || !pedido) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ color: '#EF4444', fontSize: 16 }}>{error || 'Pedido não encontrado.'}</div>
        <button onClick={() => navigate('/meus-pedidos')} style={{ color: '#60A5FA', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
          ← Voltar para meus pedidos
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => navigate('/meus-pedidos')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
        >
          <ArrowLeft size={18} />
          Voltar
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 14 }}>COPERNIC 2025</div>
          <div style={{ color: '#64748B', fontSize: 12 }}>{pedidoId}</div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Ticket count */}
      <div style={{ textAlign: 'center', padding: '12px 0 4px', color: '#64748B', fontSize: 13 }}>
        {currentIndex + 1} de {participantes.length} ingresso{participantes.length !== 1 ? 's' : ''}
      </div>

      {/* Swipeable cards */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          padding: '16px 0',
        }}
      >
        {participantes.map((p, i) => {
          const isTitular = i === 0
          return (
            <div
              key={i}
              style={{
                flex: '0 0 100%',
                scrollSnapAlign: 'center',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: '0 20px',
              }}
            >
              {/* Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 20,
                width: '100%',
                maxWidth: 360,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}>
                {/* Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
                  padding: '24px 24px 20px',
                  position: 'relative',
                }}>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
                    Ingresso Corporativo
                  </div>
                  <div style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>
                    COPERNIC 2025
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>
                    15 de Março de 2025 · Expo SP
                  </div>
                  {/* Decorative circles */}
                  <div style={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ position: 'absolute', right: 10, bottom: -30, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                </div>

                {/* Ticket notch */}
                <div style={{ position: 'relative', height: 0 }}>
                  <div style={{ position: 'absolute', left: -16, top: -16, width: 32, height: 32, borderRadius: '50%', background: '#0F172A' }} />
                  <div style={{ position: 'absolute', right: -16, top: -16, width: 32, height: 32, borderRadius: '50%', background: '#0F172A' }} />
                </div>

                {/* Body */}
                <div style={{ padding: '28px 24px 24px' }}>
                  {/* Participant info */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                      Participante
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', lineHeight: 1.2, marginBottom: 8 }}>
                      {p.nome}
                    </div>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      background: isTitular ? '#EFF6FF' : '#F8FAFC',
                      color: isTitular ? '#1D4ED8' : '#64748B',
                      border: `1px solid ${isTitular ? '#BFDBFE' : '#E2E8F0'}`,
                    }}>
                      {p.vinculo || 'Titular'}
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: '1.5px dashed #E2E8F0', margin: '0 -8px 20px' }} />

                  {/* QR Code */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ padding: 12, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 10 }}>
                      <QRCode value={p.ingresso_codigo || `ING-${i + 1}`} size={160} />
                    </div>
                    <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#475569', letterSpacing: 1, fontWeight: 600 }}>
                      {p.ingresso_codigo || `ING-${String(pedido.id).padStart(3, '0')}-${String(i + 1).padStart(3, '0')}`}
                    </div>
                  </div>

                  {/* Raffle code — titular only */}
                  {isTitular && pedido.codigo_sorteio && (
                    <div style={{
                      marginTop: 16,
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '2px dashed #F59E0B',
                      background: '#FFFBEB',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}>
                      <Trophy size={18} color="#F59E0B" />
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: 1 }}>
                          Código do Sorteio
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#B45309', fontFamily: 'monospace', letterSpacing: 2 }}>
                          {pedido.codigo_sorteio}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation dots */}
      {participantes.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '8px 0 16px' }}>
          {participantes.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              style={{
                width: i === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === currentIndex ? '#2563EB' : '#334155',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Bottom action */}
      <div style={{ padding: '0 20px 32px' }}>
        <button
          onClick={() => generateTicketsPDF(pedido, participantes)}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #1E3A5F, #2563EB)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 15,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Download size={18} />
          Baixar todos como PDF
        </button>
      </div>
    </div>
  )
}
