import jsPDF from 'jspdf'
import QRCode from 'qrcode'

async function qrDataUrl(text) {
  return await QRCode.toDataURL(text, {
    width: 300,
    margin: 1,
    color: { dark: '#1E293B', light: '#FFFFFF' },
  })
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

export default async function generateTicketsPDF(pedido, participantes) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const W = 210
  const H = 297

  for (let idx = 0; idx < participantes.length; idx++) {
    const p = participantes[idx]
    const isTitular = idx === 0

    if (idx > 0) doc.addPage()

    // ── Background ──────────────────────────────────────────────────────────
    doc.setFillColor(248, 250, 252)
    doc.rect(0, 0, W, H, 'F')

    // ── Header gradient simulation (two rects) ────────────────────────────
    doc.setFillColor(...hexToRgb('#1E3A5F'))
    doc.rect(0, 0, W, 58, 'F')
    doc.setFillColor(...hexToRgb('#1D4ED8'))
    doc.rect(0, 44, W, 14, 'F')

    // Header decorative circles
    doc.setFillColor(255, 255, 255)
    doc.setGState(doc.GState({ opacity: 0.04 }))
    doc.circle(W - 10, -10, 35, 'F')
    doc.circle(W + 5, 55, 28, 'F')
    doc.setGState(doc.GState({ opacity: 1 }))

    // Logo area — ticket icon placeholder
    doc.setFillColor(...hexToRgb('#F59E0B'))
    doc.roundedRect(14, 10, 28, 28, 4, 4, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('🎟', 18, 28)

    // Event name
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('COPERNIC 2025', 48, 22)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(180, 200, 230)
    doc.text('15 de Março de 2025  ·  Expo SP  ·  Ingresso Corporativo', 48, 30)

    // Order code in header top right
    doc.setFontSize(8)
    doc.setTextColor(150, 180, 210)
    doc.text(`Pedido: ${pedido.codigo}`, W - 14, 14, { align: 'right' })

    // ── Ticket card (white rounded rect) ─────────────────────────────────
    const cardX = 20
    const cardY = 68
    const cardW = W - 40
    const cardH = H - 88

    doc.setFillColor(255, 255, 255)
    doc.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'F')

    // Card top notch simulation
    doc.setFillColor(...hexToRgb('#F8FAFC'))
    doc.rect(0, 56, W, 16, 'F')

    // ── Participant section ───────────────────────────────────────────────
    const bodyX = cardX + 14
    let y = cardY + 16

    // Ticket number badge
    doc.setFillColor(...hexToRgb('#EFF6FF'))
    doc.roundedRect(bodyX, y - 6, 36, 12, 3, 3, 'F')
    doc.setTextColor(...hexToRgb('#1D4ED8'))
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(`Ingresso ${idx + 1} de ${participantes.length}`, bodyX + 18, y + 2, { align: 'center' })

    y += 14

    // Participant label
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...hexToRgb('#94A3B8'))
    doc.text('PARTICIPANTE', bodyX, y)
    y += 7

    // Participant name
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...hexToRgb('#1E293B'))
    doc.text(p.nome || '—', bodyX, y)
    y += 8

    // Vínculo badge
    const vinculo = p.vinculo || 'Titular'
    const badgeBg = isTitular ? '#EFF6FF' : '#F8FAFC'
    const badgeFg = isTitular ? '#1D4ED8' : '#64748B'
    const badgeBorder = isTitular ? '#BFDBFE' : '#E2E8F0'
    doc.setFillColor(...hexToRgb(badgeBg))
    doc.setDrawColor(...hexToRgb(badgeBorder))
    doc.setLineWidth(0.3)
    doc.roundedRect(bodyX, y, 30, 9, 2, 2, 'FD')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...hexToRgb(badgeFg))
    doc.text(vinculo, bodyX + 15, y + 6, { align: 'center' })
    y += 16

    // ── Dashed divider ────────────────────────────────────────────────────
    doc.setLineDashPattern([2, 2], 0)
    doc.setDrawColor(...hexToRgb('#E2E8F0'))
    doc.setLineWidth(0.5)
    doc.line(cardX + 8, y, cardX + cardW - 8, y)
    doc.setLineDashPattern([], 0)
    y += 12

    // ── QR Code ───────────────────────────────────────────────────────────
    const qrValue = p.ingresso_codigo || `ING-${String(pedido.id).padStart(3, '0')}-${String(idx + 1).padStart(3, '0')}`
    let qrY = y
    try {
      const qrUrl = await qrDataUrl(qrValue)
      const qrSize = 50
      const qrX = W / 2 - qrSize / 2
      // QR background box
      doc.setFillColor(...hexToRgb('#F8FAFC'))
      doc.setDrawColor(...hexToRgb('#E2E8F0'))
      doc.setLineWidth(0.4)
      doc.roundedRect(qrX - 6, qrY - 2, qrSize + 12, qrSize + 12, 4, 4, 'FD')
      doc.addImage(qrUrl, 'PNG', qrX, qrY + 2, qrSize, qrSize)
      y = qrY + qrSize + 18

      // Ingresso code below QR
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...hexToRgb('#475569'))
      doc.text(qrValue, W / 2, y - 4, { align: 'center' })
    } catch {
      y += 10
      doc.setFontSize(9)
      doc.setTextColor(...hexToRgb('#94A3B8'))
      doc.text(qrValue, W / 2, y, { align: 'center' })
      y += 14
    }

    // ── Raffle code (titular only) ────────────────────────────────────────
    if (isTitular && pedido.codigo_sorteio) {
      y += 4
      doc.setFillColor(...hexToRgb('#FFFBEB'))
      doc.setDrawColor(...hexToRgb('#F59E0B'))
      doc.setLineWidth(0.6)
      doc.setLineDashPattern([2.5, 1.5], 0)
      doc.roundedRect(cardX + 10, y, cardW - 20, 26, 4, 4, 'FD')
      doc.setLineDashPattern([], 0)

      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...hexToRgb('#92400E'))
      doc.text('🏆  CÓDIGO DO SORTEIO', W / 2, y + 8, { align: 'center' })

      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...hexToRgb('#B45309'))
      doc.text(String(pedido.codigo_sorteio), W / 2, y + 20, { align: 'center' })
      y += 34
    }

    // ── Event info strip ──────────────────────────────────────────────────
    y = Math.max(y + 8, cardY + cardH - 54)
    doc.setLineDashPattern([2, 2], 0)
    doc.setDrawColor(...hexToRgb('#E2E8F0'))
    doc.setLineWidth(0.4)
    doc.line(cardX + 8, y, cardX + cardW - 8, y)
    doc.setLineDashPattern([], 0)
    y += 8

    const col1 = bodyX
    const col2 = W / 2
    const col3 = W / 2 + (cardW / 2 - 20)

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...hexToRgb('#94A3B8'))
    doc.text('DATA', col1, y)
    doc.text('LOCAL', col2, y)
    doc.text('TRANSPORTE', col3, y)

    y += 5
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...hexToRgb('#334155'))
    doc.text('15 Mar 2025', col1, y)
    doc.text('Expo SP', col2, y)
    doc.text(pedido.transporte ? 'Ônibus incluso' : 'Particular', col3, y)

    // ── Terms acceptance note ─────────────────────────────────────────────
    y += 16
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...hexToRgb('#CBD5E1'))
    const termsText = '✓ Termos e condições aceitos pelo titular. Ingresso válido exclusivamente para o evento COPERNIC 2025.'
    doc.text(termsText, W / 2, y, { align: 'center', maxWidth: cardW - 20 })

    // ── Footer outside card ───────────────────────────────────────────────
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...hexToRgb('#94A3B8'))
    doc.text('Ingressos Corporativos · Uso interno', W / 2, H - 8, { align: 'center' })
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, H - 8)
    doc.text(`Pág. ${idx + 1}/${participantes.length}`, W - 14, H - 8, { align: 'right' })
  }

  doc.save(`ingressos-${pedido.codigo}.pdf`)
}
