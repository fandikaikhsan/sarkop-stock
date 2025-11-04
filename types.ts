export interface StockRecord {
  [key: string]: string
}

export type ConditionLevel = "bahaya" | "low" | "-"

export interface CurrentStockItem {
  item: string
  unit: string
  vendor: string
  category: string
  parQty: number
  minRestock: number
  currentQty: number
  condition: ConditionLevel
}

export interface LatestMeta {
  timestamp: string // DD/MM/YYYY HH:mm:ss
  staff: string // PNS yang mengisi
}

export interface SupplierContact {
  name: string // matches Vendor name in items
  media: string // e.g., 'Whatsapp'
  phone?: string // digits with country code (no +)
  alias?: string // greeting name
}
