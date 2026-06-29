import jsPDF from 'jspdf'
import 'jspdf-autotable'

function fmt(n) {
  return 'Rp ' + Math.round(n || 0).toLocaleString('id-ID')
}

function fmtDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

function calcItem(item) {
  return item.qty * (item.price || 0) * (1 - (item.disc || 0) / 100)
}

export function generatePDF(quotation) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pw = doc.internal.pageSize.getWidth()
  const { info, items, customer } = quotation

  const tot = items.filter(r => r.t === 'i').reduce((s, r) => s + calcItem(r), 0)
  const dp = info.discount_pct || 0
  const vp = info.vat_pct || 12
  const da = tot * dp / 100
  const sub = tot - da
  const vat = sub * vp / 100
  const grand = sub + vat

  // Header
  doc.setFillColor(0, 32, 96)
  doc.rect(0, 0, pw, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(10)
  doc.text('PT Global Sahabat Otomasi', 14, 9)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8)
  doc.text('"Your Automation Partner"  ·  order@gso.co.id  ·  Rek Mandiri 1200010055494 an PT.Global Sahabat Otomasi', 14, 14)
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('QUOTATION', pw - 14, 14, { align: 'right' })

  // Info
  doc.setTextColor(0)
  doc.setFontSize(8.5)
  let y = 28
  const leftInfo = [
    ['To:', customer.company || '-'],
    ['Alamat:', customer.address || ''],
    ['Up:', customer.contact || '-'],
    ['Telp/Mobile:', customer.tel || '-'],
    ['Fax/Email:', customer.email || ''],
  ]
  const rightInfo = [
    ['Quotation No.', info.qo_number || ''],
    ['Date:', fmtDate(info.date)],
    ['Sales Name:', info.sales_name || ''],
    ['Mobile:', info.sales_mobile || ''],
    ['Valid Until:', fmtDate(info.valid_until)],
    ['Payment:', info.payment_terms || ''],
  ]
  let ly = y, ry = y
  leftInfo.forEach(([k, v]) => {
    if (!v) return
    doc.setFont(undefined, 'bold')
    doc.text(k, 14, ly)
    doc.setFont(undefined, 'normal')
    doc.text(String(v), 34, ly, { maxWidth: 65 })
    ly += 5
  })
  rightInfo.forEach(([k, v]) => {
    if (!v) return
    doc.setFont(undefined, 'bold')
    doc.text(k, pw / 2 + 2, ry)
    doc.setFont(undefined, 'normal')
    doc.text(String(v), pw / 2 + 26, ry)
    ry += 5
  })
  y = Math.max(ly, ry) + 3

  // Items table
  let nc = 0
  const body = []
  items.forEach(r => {
    if (r.t === 'g') {
      body.push([{ content: r.label || '', colSpan: 8, styles: { fontStyle: 'bold', fillColor: [235, 238, 245] } }])
    } else if (r.t === 'n') {
      body.push([{ content: r.text || '', colSpan: 8, styles: { textColor: [120, 120, 120], fontSize: 7.5 } }])
    } else if (r.t === 'i') {
      nc++
      body.push([
        nc, r.part || '',
        { content: r.name || '', styles: { fontStyle: 'bold' } },
        '' + r.qty, r.unit || '',
        fmt(r.price || 0),
        r.disc ? r.disc + '%' : '-',
        fmt(calcItem(r))
      ])
        ; (r.subs || []).forEach((s, si) => {
          body.push([
            { content: `${nc}.${si + 1}`, styles: { textColor: [150, 150, 150] } },
            '', s.text || '', '', '', '', '', ''
          ])
        })
    }
  })

  doc.autoTable({
    startY: y,
    head: [['#', 'Part No.', 'Description', 'Qty', 'Unit', 'Unit Price', 'Disc', 'Price']],
    body,
    headStyles: { fillColor: [0, 32, 96], fontSize: 7.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      3: { cellWidth: 9, halign: 'center' },
      4: { cellWidth: 12 },
      5: { cellWidth: 26, halign: 'right' },
      6: { cellWidth: 12, halign: 'center' },
      7: { cellWidth: 26, halign: 'right' }
    },
    theme: 'grid',
    margin: { left: 14, right: 14 }
  })

  // Totals
  const fy = doc.lastAutoTable.finalY + 3
  const sr = [
    ['TOTAL', fmt(tot)],
    ...(dp > 0 ? [[`DISKON (${dp}%)`, `- ${fmt(da)}`]] : []),
    ['SUB TOTAL', fmt(sub)],
    [`VAT (${vp}%)`, fmt(vat)],
    ['GRAND TOTAL', fmt(grand)]
  ]
  doc.autoTable({
    startY: fy,
    body: sr,
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { halign: 'right', fontStyle: 'bold' }, 1: { halign: 'right', cellWidth: 40 } },
    theme: 'plain',
    margin: { left: pw - 100, right: 14 },
    didParseCell: d => {
      if (d.row.index === sr.length - 1) {
        d.cell.styles.fontStyle = 'bold'
        d.cell.styles.fontSize = 11
      }
    }
  })

  // Notes
  if (info.notes) {
    const ny = doc.lastAutoTable.finalY + 6
    doc.setFontSize(7.5)
    doc.setTextColor(100, 100, 100)
    doc.text('Notes:', 14, ny)
    doc.text(info.notes, 14, ny + 4, { maxWidth: pw - 28 })
  }

  // Footer
  const fh = doc.internal.pageSize.getHeight() - 10
  doc.setDrawColor(0, 32, 96)
  doc.setLineWidth(0.3)
  doc.line(14, fh - 4, pw - 14, fh - 4)
  doc.setFontSize(7.5)
  doc.setTextColor(0, 32, 96)
  doc.setFont(undefined, 'bold')
  doc.text('PT Global Sahabat Otomasi  "Your Automation Partner"', pw / 2, fh, { align: 'center' })

  const filename = (info.qo_number || 'quotation').replace(/[/\\]/g, '-') + '.pdf'
  doc.save(filename)
}
