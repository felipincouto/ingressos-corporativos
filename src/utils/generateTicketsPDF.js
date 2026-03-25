import jsPDF from 'jspdf'
import { createRoot } from 'react-dom/client'
import { QRCodeCanvas } from 'qrcode.react'
import { createElement } from 'react'

/**
 * Renders a QRCodeCanvas into an offscreen div and returns a PNG data URL.
 */
function qrToDataUrl(value, size = 300) {
  return new Promise(resolve => {
    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:'+size+'px;height:'+size+'px'
    document.body.appendChild(container)

    const root = createRoot(container)
    root.render(
      createElement(QRCodeCanvas, {
        value,
        size,
        marginSize: 1,
        fgColor: '#1E293B',
        bgColor: '#FFFFFF',
      })
    )

    // Give React a tick to render, then grab the canvas
    setTimeout(() => {
      const canvas = container.querySelector('canvas')
      const dataUrl = canvas ? canvas.toDataURL('image/png') : null
      root.unmount()
      document.body.removeChild(container)
      resolve(dataUrl)
    }, 80)
  })
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

export default async function generateTicketsPDF(pedido, participantes, evento) {
  const eventoNome = evento?.nome || 'COPERNIC'
  const eventoData = evento?.data
    ? new Date(evento.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  const eventoDataShort = evento?.data
    ? new Date(evento.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''
  const eventoLocal = evento?.local || ''
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const W = 210
  const H = 297

  for (let idx = 0; idx < participantes.length; idx++) {
    const p = participantes[idx]
    const isTitular = idx === 0

    if (idx > 0) doc.addPage()

    // ── Page background ──────────────────────────────────────────────────
    doc.setFillColor(248, 250, 252)
    doc.rect(0, 0, W, H, 'F')

    // ── Header bar ───────────────────────────────────────────────────────
    doc.setFillColor(...hexToRgb('#1E3A5F'))
    doc.rect(0, 0, W, 52, 'F')
    doc.setFillColor(...hexToRgb('#1D4ED8'))
    doc.rect(0, 40, W, 12, 'F')

    // Amber logo block
    doc.setFillColor(...hexToRgb('#F59E0B'))
    doc.roundedRect(14, 9, 26, 26, 4, 4, 'F')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('IC', 27, 26, { align: 'center' })

    // Event title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(eventoNome, 46, 21)

    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(160, 195, 230)
    doc.text(`${eventoData}${eventoLocal ? '  ·  ' + eventoLocal : ''}  ·  Ingresso Corporativo`, 46, 29)

    // Order code (top right)
    doc.setFontSize(8)
    doc.setTextColor(120, 160, 200)
    doc.text(`Pedido: ${pedido.codigo}`, W - 14, 13, { align: 'right' })

    // ── White ticket card ────────────────────────────────────────────────
    const cX = 18
    const cY = 64
    const cW = W - 36
    const cH = H - 80

    doc.setFillColor(255, 255, 255)
    doc.roundedRect(cX, cY, cW, cH, 6, 6, 'F')

    // Notch circles on sides
    doc.setFillColor(248, 250, 252)
    doc.circle(cX, cY + cH * 0.55, 5, 'F')
    doc.circle(cX + cW, cY + cH * 0.55, 5, 'F')

    // ── Card content ─────────────────────────────────────────────────────
    const bX = cX + 14
    let y = cY + 16

    // Ticket badge
    const badgeLabel = `Ingresso ${idx + 1} de ${participantes.length}`
    doc.setFillColor(...hexToRgb('#EFF6FF'))
    doc.roundedRect(bX, y - 5, 44, 10, 2, 2, 'F')
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...hexToRgb('#1D4ED8'))
    doc.text(badgeLabel, bX + 22, y + 2, { align: 'center' })
    y += 12

    // Participant label
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...hexToRgb('#94A3B8'))
    doc.text('PARTICIPANTE', bX, y)
    y += 6

    // Name
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...hexToRgb('#1E293B'))
    doc.text(p.nome || '—', bX, y)
    y += 7

    // Vínculo chip
    const vinculo = p.vinculo || 'Titular'
    const chipBg = isTitular ? '#EFF6FF' : '#F8FAFC'
    const chipFg = isTitular ? '#1D4ED8' : '#64748B'
    const chipBd = isTitular ? '#BFDBFE' : '#E2E8F0'
    doc.setFillColor(...hexToRgb(chipBg))
    doc.setDrawColor(...hexToRgb(chipBd))
    doc.setLineWidth(0.3)
    doc.roundedRect(bX, y, 32, 8, 2, 2, 'FD')
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...hexToRgb(chipFg))
    doc.text(vinculo, bX + 16, y + 5.5, { align: 'center' })
    y += 14

    // Dashed divider
    doc.setLineDashPattern([2, 2], 0)
    doc.setDrawColor(...hexToRgb('#E2E8F0'))
    doc.setLineWidth(0.4)
    doc.line(cX + 6, y, cX + cW - 6, y)
    doc.setLineDashPattern([], 0)
    y += 10

    // ── QR Code ───────────────────────────────────────────────────────────
    const qrValue = p.ingresso_codigo ||
      `ING-${String(pedido.id).padStart(3, '0')}-${String(idx + 1).padStart(3, '0')}`

    const qrSize = 48
    const qrX = W / 2 - qrSize / 2

    try {
      const dataUrl = await qrToDataUrl(qrValue, 300)
      if (dataUrl) {
        // Box around QR
        doc.setFillColor(...hexToRgb('#F8FAFC'))
        doc.setDrawColor(...hexToRgb('#E2E8F0'))
        doc.setLineWidth(0.3)
        doc.roundedRect(qrX - 5, y - 2, qrSize + 10, qrSize + 10, 3, 3, 'FD')
        doc.addImage(dataUrl, 'PNG', qrX, y + 2, qrSize, qrSize)
        y += qrSize + 16
      }
    } catch {
      y += 6
    }

    // Ingresso code
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...hexToRgb('#475569'))
    doc.text(qrValue, W / 2, y, { align: 'center' })
    y += 14

    // ── Raffle code (titular only) ────────────────────────────────────────
    if (isTitular && pedido.codigo_sorteio) {
      doc.setFillColor(...hexToRgb('#FFFBEB'))
      doc.setDrawColor(...hexToRgb('#F59E0B'))
      doc.setLineWidth(0.6)
      doc.setLineDashPattern([2.5, 1.5], 0)
      doc.roundedRect(cX + 8, y, cW - 16, 24, 4, 4, 'FD')
      doc.setLineDashPattern([], 0)

      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...hexToRgb('#92400E'))
      doc.text('CÓDIGO DO SORTEIO', W / 2, y + 8, { align: 'center' })
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...hexToRgb('#B45309'))
      doc.text(String(pedido.codigo_sorteio), W / 2, y + 19, { align: 'center' })
      y += 32
    }

    // ── Event info strip ──────────────────────────────────────────────────
    const stripY = Math.max(y + 6, cY + cH - 46)
    doc.setLineDashPattern([2, 2], 0)
    doc.setDrawColor(...hexToRgb('#E2E8F0'))
    doc.setLineWidth(0.4)
    doc.line(cX + 6, stripY, cX + cW - 6, stripY)
    doc.setLineDashPattern([], 0)

    const col1 = bX
    const col2 = W / 2 - 10
    const col3 = W - 32

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...hexToRgb('#94A3B8'))
    doc.text('DATA', col1, stripY + 7)
    doc.text('LOCAL', col2, stripY + 7)
    doc.text('TRANSPORTE', col3, stripY + 7, { align: 'right' })

    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...hexToRgb('#334155'))
    doc.text(eventoDataShort || eventoData || '—', col1, stripY + 14)
    doc.text(eventoLocal || '—', col2, stripY + 14)
    doc.text(pedido.transporte ? 'Ônibus incluso' : 'Particular', col3, stripY + 14, { align: 'right' })

    // Terms note
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...hexToRgb('#CBD5E1'))
    doc.text(
      `Termos e condições aceitos pelo titular. Ingresso válido exclusivamente para o evento ${eventoNome}.`,
      W / 2, stripY + 26, { align: 'center', maxWidth: cW - 16 }
    )

    // ── Page footer ───────────────────────────────────────────────────────
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...hexToRgb('#94A3B8'))
    doc.text('Ingressos Corporativos · Uso interno', W / 2, H - 7, { align: 'center' })
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, H - 7)
    doc.text(`Pág. ${idx + 1}/${participantes.length}`, W - 14, H - 7, { align: 'right' })
  }

  doc.save(`ingressos-${pedido.codigo}.pdf`)
}
