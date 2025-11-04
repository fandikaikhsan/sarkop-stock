import React, { useEffect, useMemo, useState } from "react"
import { CloseIcon, WhatsappIcon } from "./Icons"
import { CurrentStockItem, LatestMeta, SupplierContact } from "../types"
import {
  getLatestSubmissionMeta,
  getProcessingData,
  getSuppliers,
} from "../services/dataService"
import { generateCurrentStockPdf } from "../services/pdfService"
import { VENDOR_PHONE_NUMBERS } from "../config"
import SupplierContactModal from "./SupplierContactModal"

interface CurrentStockModalProps {
  isOpen: boolean
  onClose: () => void
}

type VendorMessage = {
  vendor: string
  items: CurrentStockItem[]
  message: string
}

const CurrentStockModal: React.FC<CurrentStockModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<CurrentStockItem[]>([])
  const [latest, setLatest] = useState<LatestMeta | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)
  const [suppliers, setSuppliers] = useState<SupplierContact[]>([])
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    setError(null)
    setPdfUrl(null)
    setPdfName(null)
    Promise.all([
      getProcessingData(),
      getLatestSubmissionMeta(),
      getSuppliers(),
    ])
      .then(([proc, meta, sups]) => {
        setItems(proc)
        setLatest(meta)
        setSuppliers(sups)
      })
      .catch((e) => setError(e?.message || "Failed to load current stock data"))
      .finally(() => setLoading(false))
  }, [isOpen])

  const sortedRows = useMemo(() => {
    const order = (c: string) => (c === "bahaya" ? 0 : c === "low" ? 1 : 2)
    return [...items].sort((a, b) => order(a.condition) - order(b.condition))
  }, [items])

  const dangerCount = sortedRows.filter((r) => r.condition === "bahaya").length
  const lowCount = sortedRows.filter((r) => r.condition === "low").length

  const vendorMessages = useMemo<VendorMessage[]>(() => {
    const needs = sortedRows.filter((i) => i.currentQty <= i.minRestock)
    const map = new Map<string, CurrentStockItem[]>()
    for (const it of needs) {
      const v = it.vendor || "Tanpa Vendor"
      if (!map.has(v)) map.set(v, [])
      map.get(v)!.push(it)
    }
    const msgs: VendorMessage[] = []
    for (const [vendor, list] of map) {
      const lines = list
        .map((i) => `- ${i.item}: ${i.currentQty} ${i.unit}`.trim())
        .join("\n")
      const message = `Halo ${vendor},\n\nKami dari Sarkop membutuhkan barang yang perlu direstock:\n\n${lines}\n\nMohon segera informasikan apabila ada barang yang tidak tersedia. Terima kasih.`
      msgs.push({ vendor, items: list, message })
    }
    // sort vendors by number of needed items desc
    return msgs.sort((a, b) => b.items.length - a.items.length)
  }, [sortedRows])

  const handleGeneratePdf = async () => {
    try {
      setLoading(true)
      const { blob, fileName } = await generateCurrentStockPdf(
        sortedRows,
        latest,
        suppliers
      )
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setPdfName(fileName)
    } catch (e: any) {
      setError(e?.message || "Failed to generate PDF")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white text-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#B6432B]">
            Current Stock Report
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </header>

        <main className="p-4 space-y-4 overflow-y-auto">
          {latest && (
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Terakhir diperbarui:</span>{" "}
              {latest.timestamp}
              {latest.staff ? (
                <span>
                  {" "}
                  • <span className="font-semibold">Oleh:</span> {latest.staff}
                </span>
              ) : null}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B6432B]"></div>
              <p className="mt-3 text-gray-600">Loading current stock...</p>
            </div>
          )}
          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="flex flex-wrap gap-4 items-center text-sm text-gray-700">
                <span>
                  <span className="font-semibold">Bahaya:</span> {dangerCount}
                </span>
                <span>
                  <span className="font-semibold">Low:</span> {lowCount}
                </span>
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-[46vh] border rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#B6432B] text-white sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2">Item</th>
                      <th className="text-left px-3 py-2">Condition</th>
                      <th className="text-left px-3 py-2">Current Qty</th>
                      <th className="text-left px-3 py-2">Unit</th>
                      <th className="text-left px-3 py-2">Minimum Restock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map((r, idx) => (
                      <tr key={idx} className={idx % 2 ? "bg-gray-50" : ""}>
                        <td className="px-3 py-2 align-top">{r.item}</td>
                        <td className="px-3 py-2 align-top">
                          {r.condition === "-" ? "normal" : r.condition}
                        </td>
                        <td className="px-3 py-2 align-top">{r.currentQty}</td>
                        <td className="px-3 py-2 align-top">{r.unit}</td>
                        <td className="px-3 py-2 align-top">{r.minRestock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pdfUrl && (
                <div className="text-sm text-green-700">
                  PDF generated. Use the button below to download.
                </div>
              )}
            </>
          )}
        </main>

        <footer className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
          >
            Close
          </button>
          <div className="flex flex-col sm:flex-row gap-3">
            {pdfUrl ? (
              <a
                href={pdfUrl}
                download={pdfName || "current-stock.pdf"}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-800 rounded-md hover:bg-gray-100 font-semibold text-center"
              >
                Download PDF Report
              </a>
            ) : (
              <button
                onClick={handleGeneratePdf}
                disabled={loading || !!error}
                className="px-6 py-2 bg-[#B6432B] text-white rounded-md hover:bg-[#a03a25] font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Generate PDF Report
              </button>
            )}

            <button
              onClick={() => setContactOpen(true)}
              className="px-6 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#1EBE57] font-semibold flex items-center gap-2"
            >
              <WhatsappIcon />
              Contact Supplier
            </button>
          </div>
        </footer>
      </div>
      <SupplierContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        itemsNeedingRestock={sortedRows.filter(
          (i) => i.currentQty < i.parQty || i.condition !== "-"
        )}
        suppliers={suppliers}
      />
    </div>
  )
}

export default CurrentStockModal
