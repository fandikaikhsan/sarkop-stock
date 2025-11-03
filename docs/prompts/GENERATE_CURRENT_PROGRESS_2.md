Lets update several things on the generate current progress feature.

In generate PDF, we need to create multiple parts that grouped based on purposes, and the PDF should be in portrait mode. If the table is too wide, we can reduce the font size to fit the page width.

The parts are:

1. The main table that shows all items. To quick overview about the items' condition. It includes the columns: Item, Current Qty, Par Qty, Minimum Restock, Unit. If the condition is "bahaya" then the row will be highlighted in orange and if has "low" condition, then the row will be highlighted in yellow color. The data is taken from the "Processing" sheet in the Google Sheets. I have exported the sheet to CSV for reference: Sarkop Daily Stock Monitoring (Responses) - Processing.csv. It sorted by Condition in the order of "bahaya", "low", and "normal".

2. The restock table shows all items that need restock (Current Qty < Par Stock) or the "low" and "bahaya" conditions. Grouped based on the vendor. so each vendor has their own table. It includes the columns: Item, Current Qty, Vendor, Minimum Restock. If the condition is "bahaya" then the row will be highlighted in orange and if has "low" condition, then the row will be highlighted in yellow color. Each of table will have a subtitle that shows the Name Media Phone Number Alias.
   This data is taken from the "Supplier" sheet in the Google Sheets. I have exported the sheet to CSV for reference: Sarkop Daily Stock Monitoring (Responses) - Supplier.csv.

Another things that need to be improve is the "Request Overview" table. Currently we have Item, Current Qty, Unit. We need to add "Minimum Restock" columns. And also sort the table by Condition in the order of "bahaya", "low", and "normal". For the chat message, we're using "Minimum Restock" for each item value to order. And put the unit on the parentheses.

Other than that, the message format is still the same.

For example:
"Halo [Alias],\n\n

Kami dari Sarkop membutuhkan barang yang perlu direstock: \n\n

- Kentang: [Minimum Restock] ([Unit])\n
- Sosis: 10 (pack 1 kg, 40 pcs)\n
- Nugget: 5 (pack 500 gr)\n\n

Mohon segera informasikan apabila ada barang yang tidak tersedia. Terima kasih.
