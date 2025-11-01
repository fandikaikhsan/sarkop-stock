// The Google Form URL for stock opname.
export const SARKOP_FORM_URL: string = "https://forms.gle/CS7TqgHVf8GLP1Fv8" // Replace with actual URL

// The WhatsApp number to send the report to.
// Make sure to include the country code without '+' or '00'.
export const WHATSAPP_TARGET_NUMBER: string = "6282126666440" // Replace with actual number

// --- Google Sheets Configuration ---
// To get the SHEET_ID:
// 1. Open your Google Sheet.
// 2. The URL will look like: https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
// 3. Copy the long string of characters from the URL.
export const GOOGLE_SHEET_ID: string =
  "1qu3iAhtdhX5eCWXlBoXR9SLoMqDl_VyJ6ioCwRMD-No" // <-- IMPORTANT: Replace with your actual Sheet ID

// To get the SHEET_RANGE:
// 1. This is the name of the sheet tab and the cell range you want to read.
// 2. Example: 'Form responses 1'!A:ZZ to read all data from the sheet named "Form responses 1".
export const GOOGLE_SHEET_RANGE: string = "Form responses 1!A:ZZ" // <-- IMPORTANT: Replace with your sheet name and range

// NOTE on API Key and Permissions:
// The process.env.API_KEY used for the Gemini API will also be used here.
// For this to work, you must:
// 1. Enable the Google Sheets API in your Google Cloud project.
// 2. Make your Google Sheet public ("Anyone with the link can view") OR share it with the service account associated with your API key. For simplicity, making it public is easier.
