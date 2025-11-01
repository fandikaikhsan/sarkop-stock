import { StockRecord } from "../types"
import { GOOGLE_SHEET_ID, GOOGLE_SHEET_RANGE } from "../config"

// const API_KEY = process.env.API_KEY as string;
const API_KEY = "AIzaSyCuC6XdW805Ve5osrtyfwpPIZWGuqsoq-4"
const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${GOOGLE_SHEET_RANGE}?key=${API_KEY}`

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
