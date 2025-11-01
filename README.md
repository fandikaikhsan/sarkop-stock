<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1WCDQ95j7EmRO4K2obahXdmsJMnPZ5LVo

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## New: PDF report from Google Sheets

After choosing a date range in the "Send Stock Opname Report" modal, the app now:

- Fetches real data from the configured Google Sheet.
- Generates an AI summary (Gemini) for the period.
- Builds a PDF containing per-date tables with columns: Item Name, Stock Before, Stock After.
- Provides a Download PDF button.

Notes:

- WhatsApp Web doesn’t allow attaching files via URL, so the app opens WhatsApp with the summary text and a note that the PDF has been downloaded. Please attach the downloaded PDF manually in WhatsApp.
- If multiple submissions exist on the same day, the latest entry for that day is used for the "Stock After" values.
