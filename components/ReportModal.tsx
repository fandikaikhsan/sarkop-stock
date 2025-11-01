
import React, { useState, useEffect } from 'react';
import { WHATSAPP_TARGET_NUMBER } from '../config';
import { CloseIcon, WhatsappIcon } from './Icons';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateReport: (startDate: string, endDate: string) => void;
  report: string | null;
  isLoading: boolean;
  error: string | null;
  pdfUrl?: string | null;
  pdfFileName?: string | null;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onGenerateReport, report, isLoading, error, pdfUrl, pdfFileName }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      setEndDate(today.toISOString().split('T')[0]);
      setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateClick = () => {
    if (startDate && endDate) {
      onGenerateReport(startDate, endDate);
    }
  };

  const handleSendWhatsApp = () => {
    if (report) {
      const extra = pdfFileName ? `\n\nPDF report: ${pdfFileName} (downloaded to your device)` : '';
      const message = encodeURIComponent(report + extra);
      const url = `https://wa.me/${WHATSAPP_TARGET_NUMBER}?text=${message}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white text-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#B6432B]">Generate Stock Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon />
          </button>
        </header>

        <main className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B6432B] focus:border-[#B6432B]"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B6432B] focus:border-[#B6432B]"
              />
            </div>
          </div>

          <div className="mt-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-lg">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6432B]"></div>
                 <p className="mt-4 text-gray-600">Generating AI summary... Please wait.</p>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            {report && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Generated Report:</h3>
                <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">{report}</div>
                {pdfUrl && (
                  <div className="mt-3 text-sm text-gray-600">
                    PDF has been generated. You can download it and share via WhatsApp.
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <footer className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex flex-col sm:flex-row gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
          {!report ? (
            <button
              onClick={handleGenerateClick}
              disabled={isLoading || !startDate || !endDate}
              className="px-6 py-2 bg-[#B6432B] text-white rounded-md hover:bg-[#a03a25] font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate Report'}
            </button>
          ) : (
             <div className="flex flex-col sm:flex-row gap-3">
               {pdfUrl && (
                 <a
                   href={pdfUrl}
                   download={pdfFileName || 'stock-opname-report.pdf'}
                   className="px-6 py-2 bg-white border border-gray-300 text-gray-800 rounded-md hover:bg-gray-100 font-semibold text-center"
                 >
                   Download PDF
                 </a>
               )}
               <button
                onClick={handleSendWhatsApp}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#1EBE57] font-semibold"
               >
                 <WhatsappIcon />
                 Send via WhatsApp
               </button>
             </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default ReportModal;
