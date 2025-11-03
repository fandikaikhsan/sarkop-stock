import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { StockRecord, CurrentStockItem, LatestMeta, SupplierContact } from "../types"

type ItemRow = {
  itemName: string
  before: string
  after: string
}

const TIMESTAMP_KEY = "Timestamp"
const EMAIL_KEY = "Email address"
const STAFF_KEY = "PNS yang mengisi:"

// Parse "DD/MM/YYYY HH:mm:ss" to Date
const parseTimestamp = (ts: string): Date | null => {
  if (!ts) return null
  // expected format: 31/12/2025 23:59:59
  const [datePart, timePart = "00:00:00"] = ts.split(" ")
  const [dd, mm, yyyy] = datePart.split("/")
  if (!dd || !mm || !yyyy) return null
  const iso = `${yyyy}-${mm}-${dd}T${timePart}`
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return d
}

const ymd = (d: Date) => d.toISOString().split("T")[0]

const isMetaKey = (key: string) =>
  key === TIMESTAMP_KEY || key === EMAIL_KEY || key === STAFF_KEY || key.startsWith("Column")

// From one stock record, extract item->value pairs (column D and beyond)
const extractItems = (record: StockRecord): Record<string, string> => {
  const items: Record<string, string> = {}
  Object.entries(record).forEach(([key, value]) => {
    if (isMetaKey(key)) return
    if (value && value.toString().trim() !== "") {
      // Clean header like "Item Name [something]" -> "Item Name"
      const cleanKey = key.split(" [")[0]
      items[cleanKey] = String(value)
    }
  })
  return items
}

// For each date, pick the latest submission of that day
const latestPerDay = (records: StockRecord[]): Map<string, StockRecord> => {
  const byDay = new Map<string, { record: StockRecord; at: number }>()
  for (const rec of records) {
    const d = parseTimestamp(rec[TIMESTAMP_KEY])
    if (!d) continue
    const key = ymd(d)
    const at = d.getTime()
    const existing = byDay.get(key)
    if (!existing || at > existing.at) {
      byDay.set(key, { record: rec, at })
    }
  }
  const map = new Map<string, StockRecord>()
  for (const [day, { record }] of byDay) map.set(day, record)
  return map
}

// Build rows for the PDF for dates within [start..end] inclusive
export const buildPdfRowsByDate = (
  allRecords: StockRecord[],
  startDate: string,
  endDate: string
): Map<string, ItemRow[]> => {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T23:59:59.999`)

  // latest submission for every day available in the dataset
  const daily = latestPerDay(allRecords)

  // Sorted list of all days available
  const allDays = Array.from(daily.keys()).sort()

  // Filter to days in selected range
  const selectedDays = allDays.filter((day) => {
    const d = new Date(`${day}T00:00:00`)
    return d >= start && d <= end
  })

  const rowsByDate = new Map<string, ItemRow[]>()

  for (const day of selectedDays) {
    const currentRec = daily.get(day)!
    const currentItems = extractItems(currentRec)

    // find previous available day before current day
    const prevDay = [...allDays]
      .filter((d) => d < day)
      .sort()
      .pop()
    const prevItems = prevDay ? extractItems(daily.get(prevDay)!) : {}

    // union of item names
    const itemNames = Array.from(
      new Set([...Object.keys(prevItems), ...Object.keys(currentItems)])
    ).sort()

    const rows: ItemRow[] = itemNames.map((name) => ({
      itemName: name,
      before: prevItems[name] ?? "-",
      after: currentItems[name] ?? "-",
    }))

    rowsByDate.set(day, rows)
  }

  return rowsByDate
}

export const generatePdf = async (
  rowsByDate: Map<string, ItemRow[]>,
  startDate: string,
  endDate: string
): Promise<{ blob: Blob; fileName: string }> => {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })

  const title = "Stock Opname Report"
  const subtitle = `Report for the period of ${startDate}${
    startDate !== endDate ? ` to ${endDate}` : ""
  }`

  let isFirstPage = true
  for (const [day, rows] of rowsByDate) {
    if (!isFirstPage) doc.addPage()
    isFirstPage = false

    doc.setFontSize(18)
    doc.text(title, 40, 40)
    doc.setFontSize(12)
    doc.text(subtitle, 40, 60)

    doc.setFontSize(14)
    doc.text(day, 40, 90)

    autoTable(doc, {
      startY: 110,
      head: [["Item Name", "Stock Before", "Stock After"]],
      body: rows.map((r) => [r.itemName, r.before, r.after]),
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [182, 67, 43] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 260 },
        1: { cellWidth: 130 },
        2: { cellWidth: 130 },
      },
      margin: { left: 40, right: 40 },
    })
  }

  const fileName = `stock-opname-${startDate.replace(/-/g, "")}-${endDate.replace(/-/g, "")}.pdf`
  const blob = doc.output("blob")
  return { blob, fileName }
}

// Generate PDF for Current Stock feature
export const generateCurrentStockPdf = async (
  items: CurrentStockItem[],
  latest: LatestMeta | null,
  suppliers: SupplierContact[]
): Promise<{ blob: Blob; fileName: string }> => {
  // Portrait as requested; adjust font if needed
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })

  const titleBase = "Kebutuhan Restock Barang Sarkop"
  const title = latest?.timestamp
    ? `${titleBase} tanggal ${latest.timestamp}${latest.staff ? ` - ${latest.staff}` : ""}`
    : titleBase

  const priority = (c: string) => (c === "bahaya" ? 0 : c === "low" ? 1 : 2)
  const sorted = [...items].sort((a, b) => priority(a.condition) - priority(b.condition))

  // Part 1: Main table (Item, Current Qty, Par Qty, Minimum Restock, Unit) with highlights
  doc.setFontSize(16)
  doc.text(title, 40, 40)
  doc.setFontSize(12)
  doc.text("Ringkasan Stok Saat Ini", 40, 60)

  const mainHead = [["Item", "Current Qty", "Par Qty", "Minimum Restock", "Unit"]]
  const mainBody = sorted.map((i) => [i.item, String(i.currentQty), String(i.parQty), String(i.minRestock), i.unit])

  autoTable(doc, {
    startY: 80,
    head: mainHead,
    body: mainBody,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [182, 67, 43], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 40, right: 40 },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const idx = data.row.index
        const cond = sorted[idx].condition
        if (cond === 'bahaya') {
          data.cell.styles.fillColor = [255, 204, 153] // light orange
        } else if (cond === 'low') {
          data.cell.styles.fillColor = [255, 255, 153] // light yellow
        }
      }
    },
  })

  // Part 2: Restock tables grouped by vendor
  const restockItems = sorted.filter((i) => i.currentQty < i.parQty || i.condition !== '-')
  const byVendor = new Map<string, CurrentStockItem[]>()
  for (const it of restockItems) {
    const v = it.vendor || 'Tanpa Vendor'
    if (!byVendor.has(v)) byVendor.set(v, [])
    byVendor.get(v)!.push(it)
  }

  if (byVendor.size > 0) {
    doc.addPage('a4', 'portrait')
    doc.setFontSize(14)
    doc.text('Daftar Restock per Vendor', 40, 40)

    const supplierMap = new Map<string, SupplierContact>()
    for (const s of suppliers) supplierMap.set(s.name, s)

    for (const [vendor, itemsOfVendor] of byVendor) {
      // vendor subtitle with supplier info
      const s = supplierMap.get(vendor)
      doc.setFontSize(12)
      const subtitle = `${vendor}${s ? ` • ${s.media || ''} ${s.phone || ''} ${s.alias || ''}` : ''}`.trim()
      autoTable(doc, {
        startY: (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : 60,
        head: [[subtitle]],
        body: [],
        theme: 'plain',
        styles: { fontSize: 11 },
        margin: { left: 40, right: 40 },
      })

      const vendorSorted = [...itemsOfVendor].sort((a, b) => priority(a.condition) - priority(b.condition))
      const head = [["Item", "Current Qty", "Vendor", "Minimum Restock"]]
      const body = vendorSorted.map((i) => [i.item, String(i.currentQty), vendor, String(i.minRestock)])
      autoTable(doc, {
        startY: (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 6 : undefined,
        head,
        body,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [182, 67, 43], textColor: 255 },
        margin: { left: 40, right: 40 },
        didParseCell: (data) => {
          if (data.section === 'body') {
            const idx = data.row.index
            const cond = vendorSorted[idx].condition
            if (cond === 'bahaya') {
              data.cell.styles.fillColor = [255, 204, 153]
            } else if (cond === 'low') {
              data.cell.styles.fillColor = [255, 255, 153]
            }
          }
        },
      })

      // Add page if the next table would overflow significantly
      if ((doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY > 740) {
        doc.addPage('a4', 'portrait')
      }
    }
  }

  const fileName = `current-stock-${Date.now()}.pdf`
  const blob = doc.output('blob')
  return { blob, fileName }
}
