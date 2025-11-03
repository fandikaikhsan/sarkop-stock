import { StockRecord, CurrentStockItem, LatestMeta, SupplierContact } from "../types"
import { GOOGLE_SHEET_ID, GOOGLE_SHEET_RANGE, GOOGLE_SHEET_PROCESSING_RANGE, GOOGLE_SHEET_SUPPLIER_RANGE } from "../config"

// const API_KEY = process.env.API_KEY as string;
const API_KEY = "AIzaSyCuC6XdW805Ve5osrtyfwpPIZWGuqsoq-4"
const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${GOOGLE_SHEET_RANGE}?key=${API_KEY}`

const buildApiUrl = (range: string) =>
  `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`

/**
 * Fetches and parses stock data from the configured Google Sheet.
 * @returns {Promise<StockRecord[]>} A promise that resolves to an array of stock records.
 */
export const getStockData = async (): Promise<StockRecord[]> => {
  if (!GOOGLE_SHEET_ID || GOOGLE_SHEET_ID === "YOUR_GOOGLE_SHEET_ID") {
    console.error("Google Sheet ID is not configured in config.ts")
    throw new Error(
      "Google Sheet is not configured. Please update the config.ts file."
    )
  }

  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error fetching from Google Sheets API:", errorData)
      throw new Error(
        `Failed to fetch data from Google Sheets. Status: ${response.status}. Please check your Sheet ID, range, and API key permissions.`
      )
    }

    const result = await response.json()
    const values = result.values

    if (!values || values.length < 2) {
      // No data found, or only header row exists
      return []
    }

    const headers = values[0]
    const dataRows = values.slice(1)

    const stockRecords: StockRecord[] = dataRows.map((row: string[]) => {
      const record: StockRecord = {}
      headers.forEach((header: string, index: number) => {
        record[header] = row[index] || "" // Handle empty cells
      })
      return record
    })

    // Filter out any potential empty rows at the end
    return stockRecords.filter(
      (record) => record.Timestamp && record["Email address"]
    )
  } catch (error) {
    console.error("Error in getStockData:", error)
    // Re-throw to be caught by the component
    throw error
  }
}

/**
 * Fetch arbitrary range from Google Sheets API and return as array of records keyed by header row.
 */
const fetchSheetRecords = async (range: string): Promise<StockRecord[]> => {
  if (!GOOGLE_SHEET_ID) throw new Error("Google Sheet ID missing")
  const url = buildApiUrl(range)
  const response = await fetch(url)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("Error fetching range", range, errorData)
    throw new Error(`Failed to fetch sheet range ${range} (status ${response.status})`)
  }
  const result = await response.json()
  const values: string[][] = result.values || []
  if (values.length < 2) return []
  const headers = values[0]
  const rows = values.slice(1)
  return rows.map((row: string[]) => {
    const record: StockRecord = {}
    headers.forEach((h: string, i: number) => {
      record[h] = row[i] || ""
    })
    return record
  })
}

/**
 * Processing sheet to CurrentStockItem[] with computed condition.
 */
export const getProcessingData = async (): Promise<CurrentStockItem[]> => {
  const records = await fetchSheetRecords(GOOGLE_SHEET_PROCESSING_RANGE)
  return records.map((r) => {
    const item = r["Item"] || r["item"] || ""
    const unit = r["Unit"] || r["unit"] || ""
    const vendor = r["Vendor"] || r["vendor"] || ""
    const category = r["Category"] || r["category"] || ""
    const parQty = Number(r["Par Qty"] || r["Par"] || r["ParQty"] || 0)
    const minRestock = Number(r["Minimum Restock"] || r["Min Restock"] || r["Minimum"] || 0)
    const currentQty = Number(r["Current Qty"] || r["Current"] || r["Qty"] || 0)

    // Compute condition as per spec regardless of provided value
    let condition: "bahaya" | "low" | "-" = "-"
    if (parQty > 0 && currentQty <= parQty * 0.5) condition = "bahaya"
    else if (currentQty <= minRestock) condition = "low"

    return { item, unit, vendor, category, parQty, minRestock, currentQty, condition }
  })
}

/**
 * Get latest timestamp and staff from Form responses sheet.
 */
export const getLatestSubmissionMeta = async (): Promise<LatestMeta | null> => {
  const records = await fetchSheetRecords(GOOGLE_SHEET_RANGE)
  if (!records.length) return null
  const parseTs = (ts: string): number => {
    const [datePart, timePart = "00:00:00"] = (ts || "").split(" ")
    const [dd, mm, yyyy] = (datePart || "").split("/")
    if (!dd || !mm || !yyyy) return 0
    const iso = `${yyyy}-${mm}-${dd}T${timePart}`
    const d = new Date(iso)
    return isNaN(d.getTime()) ? 0 : d.getTime()
  }
  let latest = records[0]
  let latestAt = parseTs(latest["Timestamp"]) || 0
  for (const r of records) {
    const at = parseTs(r["Timestamp"]) || 0
    if (at > latestAt) {
      latestAt = at
      latest = r
    }
  }
  const staff = latest["PNS yang mengisi:"] || latest["PNS yang mengisi"] || ""
  const timestamp = latest["Timestamp"] || ""
  return { timestamp, staff }
}

/**
 * Get supplier contacts from Supplier sheet
 */
export const getSuppliers = async (): Promise<SupplierContact[]> => {
  const records = await fetchSheetRecords(GOOGLE_SHEET_SUPPLIER_RANGE)
  return records.map((r) => ({
    name: r["Name"] || "",
    media: r["Media"] || "",
    phone: (r["Phone Number"] || "").replace(/\D/g, ""),
    alias: r["Alias"] || "",
  }))
}
