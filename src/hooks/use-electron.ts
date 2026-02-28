/**
 * useElectron Hook
 * A safe wrapper around window.electronAPI for the Vite + React frontend.
 * Provides browser fallback persistence for DB read/write if not running in Electron.
 */
import { useMemo } from "react";
import ExcelJS from "exceljs";
import { roundCurrency, parseDimensions, calculateTotalAmount } from "@/lib/calculator";

// Define the shape of our API exposed in preload.ts
interface ElectronAPI {
  dbRead: () => Promise<any>;
  dbWrite: (data: any) => Promise<boolean>;
  selectFolder: (defaultPath?: string) => Promise<string | null>;
  parseExcel: (filePathOrBuffer: string | ArrayBuffer) => Promise<string[][]>;
  performOCR: (filePath: string) => Promise<string>;
  parseGemini: (extractedText: string) => Promise<any>;
  checkNtsStatus: (bizNumber: string) => Promise<any>;
  testGoogleApi: (apiKey: string) => Promise<boolean>;
  generateExcel: (records: any[], tmpl: string, out: string) => Promise<string>;
  mergeInvoices: (genPdf: string, origPdf: string, out: string) => Promise<string>;
  
  // Batch
  runBatch: (inputFolder: string, outputFolder: string, processDate: string, useAiForExcel?: boolean) => Promise<void>;
  cancelBatch: () => Promise<boolean>;
  onBatchProgress: (callback: (data: any) => void) => void;
  onBatchResult: (callback: (data: any) => void) => void;
  removeBatchListeners: () => void;
}

type BrowserDirectoryPicker = (options?: { mode?: "read" | "readwrite" }) => Promise<{ name: string }>;

const BROWSER_FOLDER_PREFIX = "browser://";
const browserDirectoryHandles = new Map<string, unknown>();

const makeEmptyDb = () => ({ settings: {}, vendors: [], mappingRules: [], pricingTables: [], logs: [], sequenceCounters: {} });
const localDbKey = "app_db";

const toBrowserFolderToken = (id: string, folderName: string) => `${BROWSER_FOLDER_PREFIX}${id}/${folderName}`;
const isLikelyGoogleApiKey = (value: string) => /^AIza[0-9A-Za-z_-]{20,}$/.test(value);

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

let batchProgressListeners: ((data: any) => void)[] = [];
let batchResultListeners: ((data: any) => void)[] = [];
let isBatchCancelled = false;

// --- Browser Fallback Helpers ---
function getNextSequence(dateStr: string, dbData: any): number {
  const key = dateStr.replace(/-/g, "");
  const counters = dbData.sequenceCounters || {};
  const next = (counters[key] || 0) + 1;
  counters[key] = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(localDbKey, JSON.stringify(dbData));
  }
  return next;
}

function getVendorName(vendorId: string, dbData: any): string {
  if (!vendorId || vendorId === "UNKNOWN" || vendorId === "__empty") return "COMMON";
  const vendor = (dbData.vendors || []).find((v: any) => v.id === vendorId);
  return vendor ? vendor.name : vendorId;
}

function lookupUnitPrice(vendorId: string, itemName: string, dbData: any, itemCode?: string, unit?: string): number | null {
  const tables = dbData.pricingTables || [];
  const normalizedItemName = itemName.trim().toLowerCase();
  const normalizedItemCode = itemCode?.trim().toLowerCase();
  const normalizedUnit = unit?.trim().toLowerCase();

  const findMatch = (items: any[]) => {
    if (normalizedItemCode && normalizedUnit) {
      const match = items.find(
        (item: any) =>
          item.itemName.trim().toLowerCase() === normalizedItemName &&
          item.itemCode?.trim().toLowerCase() === normalizedItemCode &&
          item.unit?.trim().toLowerCase() === normalizedUnit
      );
      if (match) return match.unitPrice;
    }
    if (normalizedItemCode) {
      const match = items.find(
        (item: any) =>
          item.itemName.trim().toLowerCase() === normalizedItemName &&
          item.itemCode?.trim().toLowerCase() === normalizedItemCode
      );
      if (match) return match.unitPrice;
    }
    if (normalizedUnit) {
      const match = items.find(
        (item: any) =>
          item.itemName.trim().toLowerCase() === normalizedItemName &&
          item.unit?.trim().toLowerCase() === normalizedUnit
      );
      if (match) return match.unitPrice;
    }
    const match = items.find((item: any) => item.itemName.trim().toLowerCase() === normalizedItemName);
    if (match) return match.unitPrice;
    return null;
  };

  const vendorTable = tables.find((t: any) => t.vendorId === vendorId);
  if (vendorTable) {
    const match = findMatch(vendorTable.items);
    if (match !== null) return match;
  }
  const commonTable = tables.find((t: any) => t.vendorId === "__common" || t.vendorId === "" || t.vendorId === "COMMON");
  if (commonTable) {
    const match = findMatch(commonTable.items);
    if (match !== null) return match;
  }
  return null;
}

function applyPreciseCalculations(items: any[], vendorId: string, dbData: any): any[] {
  return items.map((item) => {
    const qty = Number(item.qty) || 0;
    let unitPrice = Number(item.unitPrice) || 0;

    if (unitPrice === 0 && item.itemName) {
      const lookedUp = lookupUnitPrice(vendorId, item.itemName, dbData);
      if (lookedUp !== null) unitPrice = lookedUp;
    }

    let specW = Number(item.spec_w) || 0;
    let specD = Number(item.spec_d) || 0;
    let specH = Number(item.spec_h) || 0;

    if ((!specW || !specD) && item.spec) {
      const [w, d, h] = parseDimensions(String(item.spec));
      specW = specW || w;
      specD = specD || d;
      specH = specH || h;
    }

    const amount = calculateTotalAmount(qty, unitPrice);
    const specParts = [specW, specD, specH].filter((v) => v > 0);
    const spec = specParts.length > 0 ? specParts.join("*") : item.spec || "";

    return {
      ...item,
      qty,
      unitPrice: roundCurrency(unitPrice, 0),
      amount,
      spec,
      spec_w: specW,
      spec_d: specD,
      spec_h: specH,
      unit: item.unit || "",
      remark: item.remark || item.remarks || "",
    };
  });
}

function generateFileName(vendorName: string, configCount: number, ext: string = ".xlsx"): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(configCount).padStart(3, "0");
  return `${dateStr}_${vendorName}_${seq}${ext}`;
}

async function parseTextWithGeminiLocal(extractedText: string, apiKey: string): Promise<any> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `당신은 비정형 거래명세서 및 발주서 데이터를 정형화된 JSON 포맷으로 배열 형태로 추출하는 데이터 파싱 전문가입니다.
다음 OCR 추출 텍스트를 분석하여 품목별 분할 데이터를 추출해 주세요.

필수 속성:
- itemName: 품명 (문자열)
- qty: 수량 (숫자, 없으면 0)
- unitPrice: 단가 (숫자, 없으면 0)
- spec_w: 규격 가로 (숫자, 없으면 0)
- spec_d: 규격 세로 (숫자, 없으면 0)
- spec_h: 규격 두께 (숫자, 없으면 0)

[OCR 문자열 데이터 시작]
${extractedText}
[OCR 문자열 데이터 끝]`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to parse with Gemini API");
  }
  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return [];
  return JSON.parse(text);
}

const fallbackApi: ElectronAPI = {
  // Browser fallbacks powered by Web APIs.
  dbRead: async () => {
    if (typeof window === "undefined") {
      return makeEmptyDb();
    }

    try {
      const raw = window.localStorage.getItem(localDbKey);
      if (!raw) {
        return makeEmptyDb();
      }
      return JSON.parse(raw);
    } catch {
      return makeEmptyDb();
    }
  },
  dbWrite: async (data: any) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(localDbKey, JSON.stringify(data));
    }
    return true;
  },
  selectFolder: async () => {
    if (typeof window === "undefined") return null;

    const picker = (window as Window & { showDirectoryPicker?: BrowserDirectoryPicker }).showDirectoryPicker;
    if (typeof picker !== "function") {
      throw new Error("??釉뚮씪?곗????대뜑 ?좏깮 API(File System Access API)瑜?吏?먰븯吏 ?딆뒿?덈떎.");
    }

    try {
      const handle = await picker({ mode: "readwrite" });
      const folderName = handle?.name || "selected-folder";
      const id = crypto.randomUUID();
      browserDirectoryHandles.set(id, handle);
      return toBrowserFolderToken(id, folderName);
    } catch (error: any) {
      if (error?.name === "AbortError") {
        return null;
      }
      throw error;
    }
  },
  parseExcel: async (filePathOrBuffer: string | ArrayBuffer) => {
    if (typeof filePathOrBuffer === "string") {
      throw new Error("브라우저에서는 파일 경로 기반 파싱을 지원하지 않습니다.");
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(filePathOrBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new Error("워크시트를 찾을 수 없습니다.");

    const rows: string[][] = [];
    worksheet.eachRow((row) => {
      const cells: string[] = [];
      for (let col = 1; col <= row.cellCount; col += 1) {
        const cell = row.getCell(col);
        const value = cell.value;
        if (value === undefined || value === null) {
          cells.push("");
        } else if (typeof value === "object") {
          if ("text" in value && typeof (value as any).text === "string") cells.push((value as any).text.trim());
          else if ("richText" in value && Array.isArray((value as any).richText))
            cells.push((value as any).richText.map((s: any) => s.text).join("").trim());
          else if ("result" in value && (value as any).result != null) cells.push(String((value as any).result).trim());
          else cells.push(JSON.stringify(value).trim());
        } else {
          cells.push(String(value).trim());
        }
      }
      rows.push(cells);
    });

    return rows;
  },
  runBatch: async (inputFolder: string, outputFolder: string, processDate: string, useAiForExcel?: boolean) => {
    isBatchCancelled = false;
    const executionId = `EXEC-${Date.now().toString(36).toUpperCase()}`;
    const batchResults: any[] = [];
    
    try {
      const extractIdFromToken = (token: string) => {
        if (!token?.startsWith(BROWSER_FOLDER_PREFIX)) return null;
        const withoutPrefix = token.substring(BROWSER_FOLDER_PREFIX.length);
        const parts = withoutPrefix.split("/");
        return parts[0]; 
      };

      const inputId = extractIdFromToken(inputFolder);
      const outputId = extractIdFromToken(outputFolder);

      const inputHandle = inputId ? (browserDirectoryHandles.get(inputId) as any) : null;
      const outputHandle = outputId ? (browserDirectoryHandles.get(outputId) as any) : null;
      
      if (!inputHandle || !outputHandle) {
        throw new Error("입력/출력 폴더 핸들을 찾을 수 없습니다. 다시 폴더를 선택해주세요.");
      }

      const files = [];
      for await (const entry of inputHandle.values()) {
        if (entry.kind === "file") {
          const ext = entry.name.split(".").pop()?.toLowerCase();
          if (["xlsx", "csv"].includes(ext || "")) {
            files.push(entry);
          }
        }
      }
      
      const totalFiles = files.length;
      if (totalFiles === 0) {
        batchProgressListeners.forEach(cb => cb({ progress: 100 }));
        return;
      }

      const dbData = await fallbackApi.dbRead();
      const settings = dbData.settings || {};

      for (let i = 0; i < totalFiles; i++) {
        if (isBatchCancelled) {
          batchProgressListeners.forEach(cb => cb({ progress: 100, cancelled: true }));
          break;
        }

        const fileHandle = files[i];
        const fileName = fileHandle.name;
        
        try {
          const file = await fileHandle.getFile();
          const buffer = await file.arrayBuffer();
          const rows = await fallbackApi.parseExcel(buffer);
          
          let items: any[] = [];
          let vendorId = "UNKNOWN";

          if (rows.length > 0) {
            const headers = rows[0];
            const rules = dbData.mappingRules || [];
            let matchedRule = null;
            if (!useAiForExcel) {
              for (const rule of rules) {
                const sourceCols = Object.keys(rule.mappings || {});
                const isMatch = sourceCols.length > 0 && sourceCols.every((sc: string) => headers.includes(sc));
                if (isMatch) {
                  matchedRule = rule; break;
                }
              }
            }

            if (matchedRule) {
              const ruleMappings = matchedRule.mappings;
              vendorId = matchedRule.vendorId === "__empty" || !matchedRule.vendorId ? "COMMON" : matchedRule.vendorId;
              const colIndices: Record<string, number> = {};
              for (const [source, target] of Object.entries(ruleMappings)) {
                if (typeof target === "string") {
                  colIndices[target] = headers.indexOf(source);
                }
              }

              for (let r = 1; r < rows.length; r++) {
                const row = rows[r];
                const itemName = row[colIndices["item_name"]] || "";
                const qty = row[colIndices["quantity"]] || "";
                if (!itemName && !qty) continue;
                items.push({
                  itemName, qty,
                  unitPrice: row[colIndices["unit_price"]] || "0",
                  amount: row[colIndices["total_amount"]] || "0",
                  spec_w: row[colIndices["spec_w"]] || "0",
                  spec_d: row[colIndices["spec_d"]] || "0",
                  spec_h: row[colIndices["spec_h"]] || "0",
                  unit: row[colIndices["unit"]] || "",
                  remark: row[colIndices["remarks"]] || "",
                });
              }
            } else {
               if (!settings.ocrApiKey) {
                 throw new Error("Google API Key가 설정되지 않았습니다.");
               }
               const textForm = rows.map((r: string[]) => r.join(" | ")).join("\\n");
               items = await parseTextWithGeminiLocal(textForm, settings.ocrApiKey);
            }
          }

          items = applyPreciseCalculations(items, vendorId, dbData);
          const seq = getNextSequence(processDate, dbData);
          const vendorName = getVendorName(vendorId, dbData);
          const docNumber = `${processDate.replace(/-/g, "")}-${String(seq).padStart(3, "0")}`;
          const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
          
          const outExcelName = generateFileName(vendorName, seq, ".xlsx");
          
          const workbook = new ExcelJS.Workbook();
          const sheet = workbook.addWorksheet("거래명세서");
          sheet.getCell("A1").value = "거래명세서";
          sheet.getCell("A1").font = { size: 20, bold: true };
          sheet.getCell("A3").value = `업체명: ${vendorName}`;
          sheet.getCell("A4").value = `일자: ${new Date().toLocaleDateString()}`;
          sheet.getCell("A6").value = "No.";
          sheet.getCell("B6").value = "품명";
          sheet.getCell("C6").value = "규격";
          sheet.getCell("D6").value = "단위";
          sheet.getCell("E6").value = "수량";
          sheet.getCell("F6").value = "단가";
          sheet.getCell("G6").value = "공급가액";
          sheet.getCell("H6").value = "비고";

          items.forEach((r, idx) => {
            const row = 7 + idx;
            sheet.getCell(`A${row}`).value = idx + 1;
            sheet.getCell(`B${row}`).value = r.itemName || "";
            sheet.getCell(`C${row}`).value = r.spec || "";
            sheet.getCell(`D${row}`).value = r.unit || "";
            sheet.getCell(`E${row}`).value = Number(r.qty) || 0;
            sheet.getCell(`F${row}`).value = Number(r.unitPrice) || 0;
            sheet.getCell(`G${row}`).value = Number(r.amount) || 0;
            sheet.getCell(`H${row}`).value = r.remark || "";
          });
          sheet.columns.forEach((col) => { if (col) col.width = 15; });
          const colB = sheet.getColumn(2);
          if (colB) colB.width = 30;

          const outBuffer = await workbook.xlsx.writeBuffer();
          const outFileHandle = await outputHandle.getFileHandle(outExcelName, { create: true });
          const writable = await outFileHandle.createWritable();
          await writable.write(outBuffer);
          await writable.close();

          const fileResult = {
            fileName,
            status: "success" as const,
            vendor: vendorName,
            docNumber,
            amount: totalAmount,
            savePath: "browser://" + outExcelName,
            message: `명세서 생성 완료 (${items.length}건, ${totalAmount.toLocaleString()}원)`,
          };
          batchResults.push(fileResult);

          batchResultListeners.forEach(cb => cb({ id: crypto.randomUUID(), ...fileResult, result: fileResult.message }));

        } catch (err: any) {
          const fileResult = {
            fileName,
            status: "error" as const,
            vendor: "ERROR",
            docNumber: "-",
            amount: 0,
            savePath: "-",
            message: err.message || "처리 중 오류 발생",
          };
          batchResults.push(fileResult);
          batchResultListeners.forEach(cb => cb({ id: crypto.randomUUID(), ...fileResult, result: fileResult.message }));
        }

        batchProgressListeners.forEach(cb => cb({ progress: Math.round(((i + 1) / totalFiles) * 100) }));
      }

      const successCount = batchResults.filter(r => r.status === "success").length;
      const failCount = batchResults.filter(r => r.status === "error").length;
      const warningCount = batchResults.filter(r => r.status === "warning").length;
      const totalAmountAll = batchResults.reduce((sum, r) => sum + r.amount, 0);

      const logEntry = {
        id: crypto.randomUUID(),
        executionId,
        datetime: new Date().toISOString(),
        successCount, failCount, warningCount,
        totalAmount: totalAmountAll,
        status: failCount === 0 ? "completed" : (successCount > 0 ? "partial" : "failed"),
        files: batchResults,
      };

      if (!Array.isArray(dbData.logs)) dbData.logs = [];
      dbData.logs.push(logEntry);
      await fallbackApi.dbWrite(dbData);

    } catch (err: any) {
      batchResultListeners.forEach(cb => cb({
        id: crypto.randomUUID(),
        status: "error", vendor: "SYSTEM", fileName: "배치 시스템", docNumber: "-", amount: 0, savePath: "-",
        result: err.message || "배치 초기화 실패",
      }));
      batchProgressListeners.forEach(cb => cb({ progress: 100 }));
    }
  },
  cancelBatch: async () => {
    isBatchCancelled = true;
    return true;
  },
  onBatchProgress: (cb) => batchProgressListeners.push(cb),
  onBatchResult: (cb) => batchResultListeners.push(cb),
  removeBatchListeners: () => {
    batchProgressListeners = [];
    batchResultListeners = [];
  },
  performOCR: async () => {
    throw new Error("performOCR is only available in Electron runtime. Please use the server-side proxy or AI alternative in the browser.");
  },
  parseGemini: async () => {
    throw new Error("parseGemini is only available in Electron runtime. Please use parseTextWithGeminiLocal in the browser.");
  },
  checkNtsStatus: async (bizNumber: string) => {
    const apiKey = import.meta.env.VITE_NTS_API_KEY;
    if (!apiKey) {
      throw new Error("NTS API Key가 설정되지 않았습니다. .env 파일을 확인하세요.");
    }
    const cleanNumber = bizNumber.replace(/-/g, "").trim();
    if (cleanNumber.length !== 10) {
      throw new Error("사업자등록번호는 10자리 숫자여야 합니다.");
    }
    const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ b_no: [cleanNumber] }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NTS API 오류: ${response.status} - ${errorText}`);
    }
    return response.json();
  },
  testGoogleApi: async (apiKey: string) => {
    const normalizedKey = apiKey?.trim();
    if (!normalizedKey) {
      throw new Error("Google API key is empty.");
    }
    if (!isLikelyGoogleApiKey(normalizedKey)) {
      throw new Error("잘못된 Google API Key 형식입니다. Google AI Studio 키(예: AIza...)를 사용하세요.");
    }

    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(normalizedKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "ping" }] }],
            generationConfig: { maxOutputTokens: 1 },
          }),
        }
      );
    } catch (error: any) {
      throw new Error(error?.message || "Google API endpoint에 연결하지 못했습니다.");
    }

    if (!response.ok) {
      const detail = await response.text();
      if (response.status === 401 && detail.includes("API keys are not supported")) {
        throw new Error(
          "현재 입력값은 Google API Key가 아닙니다. OAuth 토큰이 아니라 Google AI Studio API Key(예: AIza...)를 입력하세요."
        );
      }
      throw new Error(`Google API test failed (${response.status}): ${detail}`);
    }

    return true;
  },
  generateExcel: async (records, tmpl, out) => {
    // Basic browser generation fallback since template parsing in browser is complex.
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("거래명세서");
    
    // Header
    sheet.getCell('A1').value = '거래명세서';
    sheet.getCell('A1').font = { size: 20, bold: true };
    sheet.getCell('A3').value = `업체명: 해당기능_브라우저미지원`; 
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

    sheet.columns.forEach((col) => {
      if (col) col.width = 15;
    });
    const colB = sheet.getColumn(2);
    if (colB) colB.width = 30; // 품명

    const buffer = await workbook.xlsx.writeBuffer();
    return "BROWSER_GENERATED_EXCEL";
  },
  mergeInvoices: async () => {
    throw new Error("mergeInvoices is only available in Electron runtime.");
  },
};

export function useElectron() {
  const isElectron = typeof window !== "undefined" && window.electronAPI !== undefined;
  const api = useMemo<ElectronAPI>(() => {
    if (typeof window === "undefined") {
      return fallbackApi;
    }
    return window.electronAPI ?? fallbackApi;
  }, [isElectron]);

  return {
    isElectron,
    api,
  };
}
