import { useState, useEffect, useRef } from 'react'
import { Trophy, Search, ChevronRight, RotateCcw, Users, Zap } from 'lucide-react'

// --- Slot Machine digit roller ---
function DigitSlot({ digit, revealed, spinning }) {
  const digits = ['0','1','2','3','4','5','6','7','8','9']
  const [displayDigit, setDisplayDigit] = useState('?')
  const intervalRef = useRef(null)

  useEffect(() => {
    if (spinning && !revealed) {
      intervalRef.current = setInterval(() => {
        setDisplayDigit(digits[Math.floor(Math.random() * 10)])
      }, 60)
    } else if (revealed && digit !== null) {
      clearInterval(intervalRef.current)
      setDisplayDigit(digit)
    } else {
      clearInterval(intervalRef.current)
      setDisplayDigit('?')
    }
    return () => clearInterval(intervalRef.current)
  }, [spinning, revealed, digit])

  return (
    <div style={{
      width: 110,
      height: 140,
      borderRadius: 16,
      background: revealed
        ? 'linear-gradient(160deg, #F59E0B, #D97706)'
        : spinning
          ? 'linear-gradient(160deg, #334155, #1E293B)'
          : 'linear-gradient(160deg, #1E293B, #0F172A)',
      border: `3px solid ${revealed ? '#F59E0B' : spinning ? '#475569' : '#334155'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: revealed
        ? '0 0 40px rgba(245,158,11,0.5), 0 8px 32px rgba(0,0,0,0.6)'
        : '0 8px 32px rgba(0,0,0,0.6)',
      transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      transform: revealed ? 'scale(1.06)' : 'scale(1)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Shine overlay when revealed */}
      {revealed && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(255,255,255,0.2) 0%, transparent 60%)',
          borderRadius: 14,
        }} />
      )}
      <span style={{
        fontSize: 80,
        fontWeight: 900,
        fontFamily: 'monospace',
        color: revealed ? '#FFFFFF' : spinning ? '#64748B' : '#334155',
        lineHeight: 1,
        transition: 'color 0.3s',
        textShadow: revealed ? '0 2px 12px rgba(0,0,0,0.3)' : 'none',
        letterSpacing: -2,
      }}>
        {displayDigit}
      </span>
    </div>
  )
}

// --- Participant card in the filtered list ---
function ParticipantCard({ p, highlightDigits }) {
  const code = String(p.codigo_sorteio)
  return (
    <div style={{
      background: '#1E293B',
      borderRadius: 12,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      border: '1px solid #334155',
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 10,
        background: 'linear-gradient(135deg, #1E3A5F, #2563EB)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 800, fontFamily: 'monospace' }}>
          {code[0]}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.nome}
        </div>
        <div style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
          {p.setor} · Matrícula {p.matricula}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {code.split('').map((d, i) => (
            <span key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 30,
              borderRadius: 6,
              background: i < highlightDigits ? 'rgba(245,158,11,0.2)' : '#0F172A',
              border: `1.5px solid ${i < highlightDigits ? '#F59E0B' : '#1E293B'}`,
              color: i < highlightDigits ? '#F59E0B' : '#334155',
              fontWeight: 800,
              fontFamily: 'monospace',
              fontSize: 14,
              transition: 'all 0.3s',
            }}>
              {i < highlightDigits ? d : '?'}
            </span>
          ))}
        </div>
        <div style={{ color: '#475569', fontSize: 10, marginTop: 4 }}>
          {p.pedido_codigo}
        </div>
      </div>
    </div>
  )
}

// --- Main Sorteio page ---
export default function Sorteio() {
  const [participantes, setParticipantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // step: 0 = not started, 1 = first digit revealed, 2 = two digits, 3 = all three
  const [step, setStep] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [revealedCode, setRevealedCode] = useState(null) // the winning 3-digit code
  const [search, setSearch] = useState('')
  const [winner, setWinner] = useState(null)
  const [celebrating, setCelebrating] = useState(false)

  // Load participants
  useEffect(() => {
    fetch('/api/sorteio')
      .then(r => {
        if (!r.ok) throw new Error('status ' + r.status)
        return r.json()
      })
      .then(data => {
        setParticipantes(data.participantes || [])
        setError('')
        setLoading(false)
      })
      .catch(() => {
        setError('Erro ao carregar participantes.')
        setLoading(false)
      })
  }, [])

  // Pick a random winning code from the pool
  function startSorteio() {
    if (participantes.length === 0) return
    const random = participantes[Math.floor(Math.random() * participantes.length)]
    setRevealedCode(String(random.codigo_sorteio))
    setStep(0)
    setWinner(null)
    setCelebrating(false)
    setSearch('')
  }

  function revealNext() {
    if (!revealedCode) {
      // Start — pick random winner
      startSorteio()
      setSpinning(true)
      return
    }
    if (step >= 3) return

    setSpinning(true)
    setTimeout(() => {
      const nextStep = step + 1
      setStep(nextStep)
      setSpinning(false)

      if (nextStep === 3) {
        // Find winner in participantes
        const w = participantes.find(p => String(p.codigo_sorteio) === revealedCode)
        setWinner(w || null)
        setCelebrating(true)
        setTimeout(() => setCelebrating(false), 3000)
      }
    }, 1800)
  }

  function reset() {
    setStep(0)
    setSpinning(false)
    setRevealedCode(null)
    setWinner(null)
    setCelebrating(false)
    setSearch('')
  }

  // Filter participantes by revealed digits
  const filteredByStep = participantes.filter(p => {
    const code = String(p.codigo_sorteio)
    if (!revealedCode || step === 0) return true
    for (let i = 0; i < step; i++) {
      if (code[i] !== revealedCode[i]) return false
    }
    return true
  })

  // Further filter by search
  const filtered = filteredByStep.filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.nome.toLowerCase().includes(q) ||
      String(p.codigo_sorteio).includes(q) ||
      (p.matricula && String(p.matricula).toLowerCase().includes(q))
    )
  })

  const digits = revealedCode ? revealedCode.split('') : ['?', '?', '?']

  const buttonLabel = !revealedCode
    ? 'Iniciar Sorteio'
    : step === 0
      ? 'Revelar 1º Dígito'
      : step === 1
        ? 'Revelar 2º Dígito'
        : step === 2
          ? 'Revelar 3º Dígito'
          : '🏆 Sorteio Concluído'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trophy size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#F1F5F9', fontWeight: 800, fontSize: 18 }}>Sorteio COPERNIC 2025</div>
            <div style={{ color: '#64748B', fontSize: 13 }}>
              {participantes.length} participantes · Código de 3 dígitos
            </div>
          </div>
        </div>
        {revealedCode && (
          <button
            onClick={reset}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#1E293B', border: '1px solid #334155',
              borderRadius: 8, padding: '8px 14px', color: '#94A3B8',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}
          >
            <RotateCcw size={14} />
            Novo Sorteio
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 16 }}>
          Carregando participantes...
        </div>
      ) : error ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontSize: 16 }}>
          {error}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left: Slot machine */}
          <div style={{
            flex: '0 0 380px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 24px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            gap: 32,
          }}>
            {/* Celebration pulse */}
            {celebrating && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, rgba(245,158,11,0.08) 0%, transparent 70%)',
                animation: 'pulse 0.6s ease-in-out',
                pointerEvents: 'none',
              }} />
            )}

            {/* Digit slots */}
            <div>
              <div style={{ color: '#475569', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', textAlign: 'center', marginBottom: 16 }}>
                Código do Sorteio
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[0, 1, 2].map(i => (
                  <DigitSlot
                    key={i}
                    digit={revealedCode ? digits[i] : null}
                    revealed={step > i}
                    spinning={spinning || (revealedCode !== null && step <= i && step > 0)}
                  />
                ))}
              </div>
              {/* Step indicators */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: step > i ? 28 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: step > i ? '#F59E0B' : '#334155',
                    transition: 'all 0.3s',
                  }} />
                ))}
              </div>
            </div>

            {/* Winner reveal */}
            {step === 3 && winner && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))',
                border: '2px solid #F59E0B',
                borderRadius: 16,
                padding: '20px 24px',
                textAlign: 'center',
                width: '100%',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🏆</div>
                <div style={{ color: '#FCD34D', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
                  Ganhador
                </div>
                <div style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>
                  {winner.nome}
                </div>
                <div style={{ color: '#94A3B8', fontSize: 13 }}>
                  {winner.setor} · Matrícula {winner.matricula}
                </div>
                <div style={{
                  marginTop: 12,
                  padding: '6px 16px',
                  borderRadius: 99,
                  background: '#F59E0B',
                  color: '#78350F',
                  fontWeight: 900,
                  fontSize: 22,
                  fontFamily: 'monospace',
                  letterSpacing: 4,
                  display: 'inline-block',
                }}>
                  {revealedCode}
                </div>
              </div>
            )}

            {step === 3 && !winner && revealedCode && (
              <div style={{
                color: '#EF4444', fontSize: 13, textAlign: 'center',
                background: '#1E293B', borderRadius: 12, padding: '12px 20px',
                border: '1px solid #334155',
              }}>
                Código {revealedCode} não encontrado na lista.<br />
                <span style={{ color: '#64748B', fontSize: 11 }}>Verifique o banco de dados.</span>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={revealNext}
              disabled={spinning || step >= 3}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 14,
                background: step >= 3
                  ? '#1E293B'
                  : spinning
                    ? '#334155'
                    : 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: step >= 3 ? '#64748B' : '#FFFFFF',
                border: 'none',
                cursor: step >= 3 || spinning ? 'not-allowed' : 'pointer',
                fontSize: 16,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: step >= 3 ? 'none' : '0 4px 20px rgba(245,158,11,0.35)',
                transition: 'all 0.2s',
                letterSpacing: 0.5,
              }}
            >
              {spinning ? (
                <>
                  <span style={{
                    display: 'inline-block', width: 18, height: 18,
                    border: '2.5px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Sorteando...
                </>
              ) : (
                <>
                  {step < 3 && <Zap size={18} />}
                  {buttonLabel}
                </>
              )}
            </button>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 16, width: '100%' }}>
              <div style={{
                flex: 1, background: '#1E293B', borderRadius: 10, padding: '10px 14px',
                border: '1px solid #334155', textAlign: 'center',
              }}>
                <div style={{ color: '#F59E0B', fontSize: 20, fontWeight: 800 }}>{participantes.length}</div>
                <div style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>Participantes</div>
              </div>
              <div style={{
                flex: 1, background: '#1E293B', borderRadius: 10, padding: '10px 14px',
                border: '1px solid #334155', textAlign: 'center',
              }}>
                <div style={{ color: '#60A5FA', fontSize: 20, fontWeight: 800 }}>{filteredByStep.length}</div>
                <div style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>Nesta rodada</div>
              </div>
            </div>
          </div>

          {/* Right: Participant list */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Search bar */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nome, matrícula ou código..."
                  style={{
                    width: '100%',
                    background: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: 10,
                    padding: '10px 12px 10px 36px',
                    color: '#F1F5F9',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ color: '#475569', fontSize: 12, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={12} />
                {filtered.length} participante{filtered.length !== 1 ? 's' : ''} exibido{filtered.length !== 1 ? 's' : ''}
                {step > 0 && step < 3 && (
                  <span style={{ color: '#F59E0B', marginLeft: 4 }}>
                    · filtrado por {step} dígito{step > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#475569', fontSize: 14, marginTop: 40 }}>
                  Nenhum participante encontrado.
                </div>
              ) : (
                filtered.map((p, i) => (
                  <ParticipantCard key={i} p={p} highlightDigits={step} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
