import React, { useMemo, useState } from "react"
import { CloseIcon, WhatsappIcon } from "./Icons"
import { CurrentStockItem, SupplierContact } from "../types"
import { VENDOR_PHONE_NUMBERS } from "../config"

interface SupplierContactModalProps {
  isOpen: boolean
  onClose: () => void
  itemsNeedingRestock: CurrentStockItem[]
  suppliers: SupplierContact[]
}

const SupplierContactModal: React.FC<SupplierContactModalProps> = ({
  isOpen,
  onClose,
  itemsNeedingRestock,
  suppliers,
}) => {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)
  const [customMessage, setCustomMessage] = useState<string>("")

  const whatsappSuppliers = useMemo(() => {
    // Only list suppliers with Media === 'Whatsapp'
    return suppliers.filter((s) => (s.media || "").toLowerCase() === "whatsapp")
  }, [suppliers])

  const groupedItems = useMemo(() => {
    const map = new Map<string, CurrentStockItem[]>()
    for (const it of itemsNeedingRestock) {
      const v = it.vendor || "Tanpa Vendor"
      if (!map.has(v)) map.set(v, [])
      map.get(v)!.push(it)
    }
    return map
  }, [itemsNeedingRestock])

  const order = (c: string) => (c === "bahaya" ? 0 : c === "low" ? 1 : 2)

  const buildMessage = (vendor: string) => {
    const list = (groupedItems.get(vendor) || [])
      .slice()
      .sort((a, b) => order(a.condition) - order(b.condition))
    const supplier = whatsappSuppliers.find((s) => s.name === vendor)
    const greetName = supplier?.alias || vendor
    const lines = list
      .map((i) => `- ${i.item}: ${i.minRestock} (${i.unit})`)
      .join("\n")
    return `Halo ${greetName},\n\nKami dari Sarkop membutuhkan barang yang perlu direstock:\n\n${lines}\n\nMohon segera informasikan apabila ada barang yang tidak tersedia. Terima kasih.`
  }

  const handleSelectVendor = (vendor: string) => {
    setSelectedVendor(vendor)
    setCustomMessage(buildMessage(vendor))
  }

  const handleOpenWhatsApp = () => {
    if (!selectedVendor) return
    const msg = encodeURIComponent(customMessage)
    const supplier = whatsappSuppliers.find((s) => s.name === selectedVendor)
    const directPhone = supplier?.phone || VENDOR_PHONE_NUMBERS[selectedVendor]
    const base = directPhone
      ? `https://wa.me/${directPhone}`
      : `https://web.whatsapp.com/send`
    const url = `${base}?text=${msg}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white text-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#B6432B]">Contact Supplier</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </header>

        <main className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
          <section className="md:col-span-1 border rounded-lg p-3">
            <h3 className="font-semibold mb-2">Suppliers (WhatsApp)</h3>
            <div className="space-y-2">
              {whatsappSuppliers.length === 0 && (
                <div className="text-sm text-gray-600">
                  No WhatsApp suppliers found.
                </div>
              )}
              {whatsappSuppliers.map((s) => (
                <button
                  key={s.name}
                  onClick={() => handleSelectVendor(s.name)}
                  className={`w-full text-left px-3 py-2 rounded border ${
                    selectedVendor === s.name
                      ? "bg-[#B6432B] text-white border-[#B6432B]"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="font-medium">{s.name}</div>
                  <div
                    className={`text-xs ${
                      selectedVendor === s.name
                        ? "bg-[#B6432B] text-white "
                        : "hover:bg-gray-100"
                    }`}
                  >
                    Alias: {s.alias || "-"}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="md:col-span-2 border rounded-lg p-3 flex flex-col">
            <h3 className="font-semibold mb-2">Request Overview</h3>
            {!selectedVendor ? (
              <div className="text-sm text-gray-600">
                Select a supplier on the left to preview items and message.
              </div>
            ) : (
              <>
                <div className="overflow-auto max-h-48 border rounded mb-3">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-3 py-2">Item</th>
                        <th className="text-left px-3 py-2">Current Qty</th>
                        <th className="text-left px-3 py-2">Unit</th>
                        <th className="text-left px-3 py-2">Minimum Restock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(groupedItems.get(selectedVendor) || [])
                        .slice()
                        .sort((a, b) => order(a.condition) - order(b.condition))
                        .map((i, idx) => (
                          <tr key={idx} className={idx % 2 ? "bg-gray-50" : ""}>
                            <td className="px-3 py-2">{i.item}</td>
                            <td className="px-3 py-2">{i.currentQty}</td>
                            <td className="px-3 py-2">{i.unit}</td>
                            <td className="px-3 py-2">{i.minRestock}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  className="border rounded p-2 text-sm h-32 w-full"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleOpenWhatsApp}
                    className="px-6 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#1EBE57] font-semibold flex items-center gap-2"
                  >
                    <WhatsappIcon /> Chat via WhatsApp
                  </button>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default SupplierContactModal
