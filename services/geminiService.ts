
import { GoogleGenAI } from "@google/genai";
import { StockRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateStockReportSummary = async (
  records: StockRecord[],
  startDate: string,
  endDate: string
): Promise<string> => {
  
  const relevantData = records.map(record => {
    const { Timestamp, 'Email address': email, 'PNS yang mengisi:': staff } = record;
    const items = Object.entries(record)
      .filter(([key, value]) => !['Timestamp', 'Email address', 'PNS yang mengisi:'].includes(key) && value && value.trim() !== '' && !key.startsWith('Column'))
      .reduce((obj, [key, value]) => {
        obj[key.split(' [')[0]] = value; // Clean up column names
        return obj;
      }, {} as {[key: string]: string});
      
    return { Timestamp, staff, items };
  });

  const prompt = `
    You are an inventory manager for a restaurant called Sarkop. Your task is to analyze the following stock opname data and write a concise summary for a report to be sent via WhatsApp to the owner.

    The data below shows stock levels submitted by staff between ${startDate} and ${endDate}.

    Data:
    ${JSON.stringify(relevantData, null, 2)}

    Your summary MUST follow these instructions:
    1.  Start with a clear and friendly header, like "Stock Opname Report for [Date Range]".
    2.  Provide a very brief overview, mentioning how many staff members submitted reports.
    3.  Analyze the latest stock entries to identify critical items. Highlight 3 to 5 items that have the lowest numerical stock levels or are marked as "Tidak cukup" (Not enough). These are priorities for reordering. List them clearly.
    4.  Mention 1 or 2 items that seem to have very high stock ("Cukup untuk hari ini" or high numbers), suggesting good inventory levels for those.
    5.  Conclude with a brief, positive closing remark, for example, "Overall, stock levels are being monitored well. Let's restock the priority items."
    6.  The entire message should be professional, brief, and formatted with clear sections for easy reading on a mobile phone. Use line breaks to separate points. Do not use markdown like '*' or '#'.
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to communicate with the AI service. Please check the console for details.");
  }
};
