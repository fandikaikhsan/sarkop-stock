import React, { useState, useCallback } from "react"
import { generateStockReportSummary } from "./services/geminiService"
import { getStockData } from "./services/dataService"
import { StockRecord } from "./types"
import ReportModal from "./components/ReportModal"
import ActionButton from "./components/ActionButton"
import { FormIcon, WhatsappIcon } from "./components/Icons"
import { SARKOP_FORM_URL } from "./config"
import Header from "./components/Header"
import { buildPdfRowsByDate, generatePdf } from "./services/pdfService"
import CurrentStockModal from "./components/CurrentStockModal"

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [report, setReport] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfFileName, setPdfFileName] = useState<string | null>(null)
  const [isCurrentStockOpen, setIsCurrentStockOpen] = useState(false)

  const handleOpenForm = () => {
    window.open(SARKOP_FORM_URL, "_blank", "noopener,noreferrer")
  }

  const handleGenerateReport = useCallback(
    async (startDate: string, endDate: string) => {
      setIsLoading(true)
      setError(null)
      setReport(null)
      setPdfUrl(null)
      setPdfFileName(null)

      try {
        const data: StockRecord[] = await getStockData()

        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // Include the whole end day

        const filteredData = data.filter((record) => {
          if (!record.Timestamp) return false
          // The timestamp format is DD/MM/YYYY HH:mm:ss, need to parse it correctly
          const [datePart, timePart] = record.Timestamp.split(" ")
          const [day, month, year] = datePart.split("/")
          const recordDate = new Date(`${year}-${month}-${day}T${timePart}`)
          return recordDate >= start && recordDate <= end
        })

        if (filteredData.length === 0) {
          setReport(
            "No stock data found for the selected date range. Please try a different period."
          )
          setIsLoading(false)
          return
        }

        const summary = await generateStockReportSummary(
          filteredData,
          startDate,
          endDate
        )
        setReport(summary)

        // Build and generate PDF from actual sheet data for the selected range
        const rowsByDate = buildPdfRowsByDate(data, startDate, endDate)
        const { blob, fileName } = await generatePdf(
          rowsByDate,
          startDate,
          endDate
        )
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
        setPdfFileName(fileName)
      } catch (err: any) {
        console.error(err)
        setError(
          err.message ||
            "An unexpected error occurred. Please check the console."
        )
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return (
    <div className="bg-[#B6432B] min-h-screen text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <Header />
      <main className="w-full max-w-md mx-auto flex flex-col gap-6 mt-8">
        <ActionButton
          text="Buka Form Pengisian Stock"
          onClick={handleOpenForm}
          icon={<FormIcon />}
          className="bg-white text-[#B6432B] hover:bg-gray-200"
        />
        <ActionButton
          text="Cek Stok Sekarang"
          onClick={() => setIsCurrentStockOpen(true)}
          icon={<WhatsappIcon />}
          className="bg-[#25D366] text-white hover:bg-[#1EBE57]"
        />
        <ActionButton
          text="Create Report using AI"
          onClick={() => setIsModalOpen(true)}
          icon={<FormIcon />}
          className="bg-blue-600 text-white hover:bg-blue-700"
        />
      </main>

      <ReportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setReport(null)
          setError(null)
          setPdfUrl(null)
          setPdfFileName(null)
        }}
        onGenerateReport={handleGenerateReport}
        report={report}
        isLoading={isLoading}
        error={error}
        pdfUrl={pdfUrl}
        pdfFileName={pdfFileName}
      />
      <CurrentStockModal
        isOpen={isCurrentStockOpen}
        onClose={() => setIsCurrentStockOpen(false)}
      />
      <footer className="absolute bottom-4 text-center text-white/70 text-sm">
        <p>&copy; {new Date().getFullYear()} Sarkop. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
