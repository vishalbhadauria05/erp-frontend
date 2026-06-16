import * as XLSX from 'xlsx';

/**
 * Export data to an Excel (.xlsx) file and trigger download.
 * @param data - Array of objects to export
 * @param fileName - Name of the file (without extension)
 * @param sheetName - Name of the Excel sheet
 */
export function exportToExcel(data: Record<string, any>[], fileName: string, sheetName = 'Sheet1') {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-size columns
  const colWidths = Object.keys(data[0]).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String(row[key] ?? '').length)
    );
    return { wch: Math.min(maxLen + 2, 40) };
  });
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
