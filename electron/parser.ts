import ExcelJS from 'exceljs';
import path from 'node:path';

type ExcelCellValue = ExcelJS.CellValue;

/**
 * Parses an Excel or CSV file and extracts data as a 2D array of strings.
 * @param filePath Absolute path to the file.
 * @returns Array of rows (which are arrays of cell string values).
 */
export async function parseExcelOrCsv(filePath: string): Promise<string[][]> {
  const workbook = new ExcelJS.Workbook();
  const extension = path.extname(filePath).toLowerCase();

  try {
    if (extension === '.csv') {
      await workbook.csv.readFile(filePath);
    } else if (extension === '.xls') {
      throw new Error('XLS 파일 지원은 중단되었습니다. XLSX 또는 CSV로 변환해 주세요.');
    } else {
      await workbook.xlsx.readFile(filePath);
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('워크시트를 찾을 수 없습니다.');
    }

    const rows: string[][] = [];
    worksheet.eachRow((row) => {
      const cells: string[] = [];
      for (let col = 1; col <= row.cellCount; col += 1) {
        const cell = row.getCell(col);
        cells.push(coerceCellValue(cell.value));
      }
      rows.push(cells);
    });

    return rows;
  } catch (error) {
    console.error('파일 파싱 실패:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('파일을 파싱하는 동안 알 수 없는 오류가 발생했습니다.');
  }
}

function coerceCellValue(value: ExcelCellValue | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'object') {
    if ('text' in value && typeof value.text === 'string') {
      return value.text.trim();
    }
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((segment) => segment.text).join('').trim();
    }
    if ('result' in value && value.result !== undefined && value.result !== null) {
      return String(value.result).trim();
    }
    return JSON.stringify(value).trim();
  }

  return String(value).trim();
}
