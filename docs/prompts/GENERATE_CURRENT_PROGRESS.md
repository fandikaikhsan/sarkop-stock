Create a new feature called "Current Stock Report".

I. Purpose: To show the data of the current stock condition with an additional feature to generate a PDF report and contact the supplier. The data is based on Google Sheets that on the second sheet called "Processing". I have exported the sheet to CSV for reference: Sarkop Daily Stock Monitoring (Responses) - Processing.csv.

II. Data Structure:
The sheet contains this columns:
Item Condition Current Qty Par Qty Minimum Restock Unit Vendor Category.

The Item shows the item name, Current Qty shows the stock after opname, Par Qty shows the ideal stock, Minimum Restock shows the minimum stock before restock is needed (if stock is same or below this value, then the status would be "low", but if the stock is 50% of the Par Qty it would be "bahaya" in the condition column), Unit shows the unit of measurement, Vendor shows the supplier, and Category shows the item category.

III. Feature Description:

1. There will be a button on the main page called "Check Current Stock Report".
2. When clicked, the app will read the Google Sheets "Processing" data. The page will show a date of the latest data updated from the "Form responses 1" sheets, which include the latest Timestamp (DD/MM/YYYY HH:mm:ss format and "PNS yang mengisi:") you can see the "Sarkop Daily Stock Monitoring (Responses) - Form responses 1.csv" for reference, and a table with the columns: Item, Condition, Current Qty, Minimum Restock. Sorted by Condition in the order of "bahaya", "low", and "-" (for normal). You must think about the responsiveness of the table for mobile and tab first. Make sure it looks good on different screen sizes and able to scroll vertically if needed.
3. User see the button "Generate PDF Report" below the table, when clicked, it will generate a PDF report with the following format:

- Title: "Kebutuhan Restock Barang Sarkop tanggal [date of the latest data updated from the "Form responses 1" sheets, which include the latest Timestamp (DD/MM/YYYY HH:mm:ss format and "PNS yang mengisi:"]"
- A table with the following columns: "Item", "Condition", "Current Qty", "Vendor", "Category", "Restock Needed".
- The "Restock Needed" column should be calculated as follows:
  - If "Current Qty" is less than or equal to "Minimum Restock", then the value should be "Yes".
  - Otherwise, the value should be "No".
- The table will be sorted by "Condition" in the order of "bahaya", "low", and "normal".

4. There is also a button "Contact Supplier" below the "Generate PDF Report" button, when clicked, it will open WhatsApp Web with a pre-filled message to the suppliers (Vendor) whose items need restocking (Restock Needed: Yes). The app should group the items by Vendor and create a message for each vendor listing the items with the number of items that need restocking based on "minimum restock" value. The message format should be as follows:
   "Halo [Vendor Name],\n\n Kami dari Sarkop membutuhkan barang yang perlu direstock:\n\n- [Item 1]: [Current Qty 1] [Unit 1]\n- [Item 2]: [Current Qty 2] [Unit 2]\n\nMohon segera informasikan apabila ada barang yang tidak tersedia. Terima kasih."

5. Ensure that the app handles errors gracefully, such as issues with reading the Google Sheets data or generating the PDF. Provide user feedback in such cases.
