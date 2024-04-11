// Import API configuration variables from api.ts
import { apiKey, sheetId } from "./api";

// Function to fetch sheet data dynamically based on the last row with content
export async function fetchSheetData(column: string, sheetName: string, row: number) {
  // Construct the base URL for accessing the Google Sheets API with the provided sheet ID
  const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`;

  // Construct the URL to get the last row with content in the specified sheet
  // This request retrieves the range of cells with user-entered values to determine the last row
  const lastLineUrl = `${baseUrl}?ranges=${sheetName}&fields=sheets/data/rowData/values/userEnteredValue&key=${apiKey}`;

  try {
    // Fetch the last row data from Google Sheets API
    const lastRowResponse = await fetch(lastLineUrl);
    const lastRowData = await lastRowResponse.json();

    // Check if there are any sheets and rows with data
    if (lastRowData.sheets && lastRowData.sheets.length > 0) {
      const rows = lastRowData.sheets[0].data[0].rowData;

      // Construct the URL to fetch data from column A to the last row with content
      const dataUrl = `${baseUrl}/values/${sheetName}!${column}${row}:${column}${rows.length}?key=${apiKey}`;
      // Fetch the data from Google Sheets API
      const dataResponse = await fetch(dataUrl);
      const data = await dataResponse.json();
      return data.values;
    }
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return null; // Return null in case of any errors
  }
}

// Function to fetch sheet data from A1 to G7 (as an example)
export async function fetchSheetDataForColumns(lastColumn: string, sheetName: string, startRow: number, lastRow: number) {
  const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`;
  const dataUrl = `${baseUrl}/values/${sheetName}!A${startRow}:${lastColumn}${lastRow}?key=${apiKey}`;

  try {
    const response = await fetch(dataUrl);
    const { values } = await response.json();
    return values; // 'values' is a 2D array where each inner array represents a row
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return null; // Return null in case of errors
  }
}
