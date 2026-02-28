import ExcelJS from 'exceljs';
import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import path from 'path';

/**
 * 템플릿(Excel)에 파싱된 데이터를 주입하여 거래명세서 엑셀을 생성합니다.
 * @param records 파싱 및 계산이 완료된 거래처별 데이터 배열
 * @param templatePath 템플릿 엑셀 경로
 * @param outputPath 저장될 엑셀 결과물 경로
 */
export async function generateInvoiceExcel(records: any[], vendorName: string, outputPath: string): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("거래명세서");
  
  // Header
  sheet.getCell('A1').value = '거래명세서';
  sheet.getCell('A1').font = { size: 20, bold: true };
  sheet.getCell('A3').value = `업체명: ${vendorName}`;
  sheet.getCell('A4').value = `일자: ${new Date().toLocaleDateString()}`;
  
  // Table Headers
  sheet.getCell('A6').value = 'No.';
  sheet.getCell('B6').value = '품명';
  sheet.getCell('C6').value = '규격';
  sheet.getCell('D6').value = '단위';
  sheet.getCell('E6').value = '수량';
  sheet.getCell('F6').value = '단가';
  sheet.getCell('G6').value = '공급가액';
  sheet.getCell('H6').value = '비고';

  records.forEach((r, idx) => {
    const row = 7 + idx;
    sheet.getCell(`A${row}`).value = idx + 1;
    sheet.getCell(`B${row}`).value = r.itemName || '';
    sheet.getCell(`C${row}`).value = r.spec || '';
    sheet.getCell(`D${row}`).value = r.unit || '';
    sheet.getCell(`E${row}`).value = Number(r.qty) || 0;
    sheet.getCell(`F${row}`).value = Number(r.unitPrice) || 0;
    sheet.getCell(`G${row}`).value = Number(r.amount) || 0;
    sheet.getCell(`H${row}`).value = r.remark || '';
  });

  // Adjust column widths
  sheet.columns.forEach((col) => {
    if (col) col.width = 15;
  });
  const colB = sheet.getColumn(2);
  if (colB) colB.width = 30; // 품명

  await workbook.xlsx.writeFile(outputPath);
  return outputPath;
}

/**
 * 두 개의 PDF 파일(원본 발주서 + 생성된 명세서)을 하나로 병합합니다.
 * @param generatedPdfPath 시스템이 생성한 명세서 PDF 경로
 * @param originalPdfPath 원본 발주서 PDF 경로 (이미지인 경우 사전 PDF 변환 필요)
 * @param outputPath 최종 합본 PDF 저장 경로
 */
export async function mergeInvoices(generatedPdfPath: string, originalPdfPath: string, outputPath: string): Promise<string> {
  const generatedBytes = readFileSync(generatedPdfPath);
  const originalBytes = readFileSync(originalPdfPath);

  const generatedDoc = await PDFDocument.load(generatedBytes);
  const originalDoc = await PDFDocument.load(originalBytes);

  const mergedPdf = await PDFDocument.create();

  // 1페이지: 거래명세서
  const copiedGenPages = await mergedPdf.copyPages(generatedDoc, generatedDoc.getPageIndices());
  copiedGenPages.forEach((page) => mergedPdf.addPage(page));

  // 2페이지 이후: 원본 발주서
  const copiedOrgPages = await mergedPdf.copyPages(originalDoc, originalDoc.getPageIndices());
  copiedOrgPages.forEach((page) => mergedPdf.addPage(page));

  const mergedBytes = await mergedPdf.save();
  writeFileSync(outputPath, mergedBytes);
  
  return outputPath;
}

/**
 * 파일 저장 네이밍 컨벤션을 생성합니다. (날짜_업체명_순번)
 */
export function generateFileName(vendorName: string, configCount: number, ext: string = '.pdf'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const seq = String(configCount).padStart(3, '0');
  return `${dateStr}_${vendorName}_${seq}${ext}`;
}
