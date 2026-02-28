import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { db } from './db';
import { performOCR } from './ocr';
import { parseTextWithGemini } from './llm';
import { parseExcelOrCsv } from './parser';
import { generateInvoiceExcel, generateFileName } from './generator';
import { roundCurrency, parseDimensions, calculateTotalAmount } from '../src/lib/calculator';
import type { LogEntry, LogFileEntry, ProcessingResult } from '../src/types/schema';

// ─── 헬퍼: 일별 문서 시퀀스 번호 생성 ───
function getNextSequence(dateStr: string): number {
  const key = dateStr.replace(/-/g, ''); // YYYYMMDD
  const counters = db.data.sequenceCounters || {};
  const next = (counters[key] || 0) + 1;
  counters[key] = next;
  db.data.sequenceCounters = counters;
  db.write();
  return next;
}

// ─── 헬퍼: 단가 테이블에서 자동 매칭 ───
function lookupUnitPrice(vendorId: string, itemName: string, itemCode?: string, unit?: string): number | null {
  const tables = db.data.pricingTables || [];
  const normalizedItemName = itemName.trim().toLowerCase();
  const normalizedItemCode = itemCode?.trim().toLowerCase();
  const normalizedUnit = unit?.trim().toLowerCase();

  const findMatch = (items: any[]) => {
    // 1. itemName, itemCode, unit 모두 일치
    if (normalizedItemCode && normalizedUnit) {
      const match = items.find(
        item => item.itemName.trim().toLowerCase() === normalizedItemName &&
                 item.itemCode?.trim().toLowerCase() === normalizedItemCode &&
                 item.unit?.trim().toLowerCase() === normalizedUnit
      );
      if (match) return match.unitPrice;
    }
    // 2. itemName, itemCode 일치
    if (normalizedItemCode) {
      const match = items.find(
        item => item.itemName.trim().toLowerCase() === normalizedItemName &&
                 item.itemCode?.trim().toLowerCase() === normalizedItemCode
      );
      if (match) return match.unitPrice;
    }
    // 3. itemName, unit 일치
    if (normalizedUnit) {
      const match = items.find(
        item => item.itemName.trim().toLowerCase() === normalizedItemName &&
                 item.unit?.trim().toLowerCase() === normalizedUnit
      );
      if (match) return match.unitPrice;
    }
    // 4. itemName만 일치
    const match = items.find(
      item => item.itemName.trim().toLowerCase() === normalizedItemName
    );
    if (match) return match.unitPrice;

    return null;
  };

  // 해당 거래처 단가 테이블 검색
  const vendorTable = tables.find(t => t.vendorId === vendorId);
  if (vendorTable) {
    const match = findMatch(vendorTable.items);
    if (match !== null) return match;
  }
  // 공통 단가 테이블 폴백 (vendorId === '__common')
  const commonTable = tables.find(t => t.vendorId === '__common' || t.vendorId === '' || t.vendorId === 'COMMON');
  if (commonTable) {
    const match = findMatch(commonTable.items);
    if (match !== null) return match;
  }
  return null;
}

// ─── 헬퍼: 업체명 조회 ───
function getVendorName(vendorId: string): string {
  if (!vendorId || vendorId === 'UNKNOWN' || vendorId === '__empty') return 'COMMON';
  const vendor = (db.data.vendors || []).find(v => v.id === vendorId);
  return vendor ? vendor.name : vendorId;
}

// ─── 정밀 계산 적용: 각 아이템에 대한 금액 검증 ───
function applyPreciseCalculations(items: any[], vendorId: string): any[] {
  return items.map(item => {
    const qty = Number(item.qty) || 0;
    let unitPrice = Number(item.unitPrice) || 0;

    // 단가 테이블 자동 매칭 (발주서 단가가 0이거나 없는 경우)
    if (unitPrice === 0 && item.itemName) {
      const lookedUp = lookupUnitPrice(vendorId, item.itemName);
      if (lookedUp !== null) unitPrice = lookedUp;
    }

    // 규격 파싱 (spec 문자열 또는 개별 spec_w/d/h)
    let specW = Number(item.spec_w) || 0;
    let specD = Number(item.spec_d) || 0;
    let specH = Number(item.spec_h) || 0;

    if ((!specW || !specD) && item.spec) {
      const [w, d, h] = parseDimensions(String(item.spec));
      specW = specW || w;
      specD = specD || d;
      specH = specH || h;
    }

    // 정밀 금액 계산 (Decimal.js 기반 사사오입)
    const amount = calculateTotalAmount(qty, unitPrice);

    // 규격 문자열 정리
    const specParts = [specW, specD, specH].filter(v => v > 0);
    const spec = specParts.length > 0 ? specParts.join('*') : (item.spec || '');

    return {
      ...item,
      qty,
      unitPrice: roundCurrency(unitPrice, 0),
      amount,
      spec,
      spec_w: specW,
      spec_d: specD,
      spec_h: specH,
      unit: item.unit || '',
      remark: item.remark || item.remarks || '',
    };
  });
}

export async function runBatch(sender: any, inputFolder: string, outputFolder: string, processDate: string, useAiForExcel?: boolean, isCancelled?: () => boolean) {
  const executionId = `EXEC-${Date.now().toString(36).toUpperCase()}`;
  const batchResults: LogEntry['files'] = [];

  try {
    if (!fs.existsSync(inputFolder)) {
      throw new Error(`입력 폴더를 찾을 수 없습니다: ${inputFolder}`);
    }
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    const supportedExts = ['.xlsx', '.csv', '.jpg', '.jpeg', '.png', '.pdf'];
    const files = fs.readdirSync(inputFolder).filter(f => {
      if (f.startsWith('.')) return false;
      const ext = path.extname(f).toLowerCase();
      return supportedExts.includes(ext);
    });
    const totalFiles = files.length;

    if (totalFiles === 0) {
      sender.send('batch:progress', { progress: 100 });
      return;
    }

    db.read();
    const settings = db.data.settings;
    if (!settings.ocrApiKey) {
      throw new Error('Google API Key가 설정되지 않았습니다. 설정 페이지에서 등록해 주세요.');
    }

    for (let i = 0; i < totalFiles; i++) {
      // 사용자 중단 체크
      if (isCancelled && isCancelled()) {
        sender.send('batch:progress', { progress: 100, cancelled: true });
        break;
      }

      const fileName = files[i];
      const filePath = path.join(inputFolder, fileName);
      const ext = path.extname(fileName).toLowerCase();

      try {
        let items: any[] = [];
        let vendorId = 'UNKNOWN';

        // ─── Step 1: 데이터 추출 ───
        if (ext === '.xlsx' || ext === '.csv') {
          const rows = await parseExcelOrCsv(filePath);
          if (rows.length > 0) {
            const headers = rows[0];
            const rules = db.data.mappingRules || [];

            // 매핑 규칙 헤더 매칭
            let matchedRule = null;
            if (!useAiForExcel) {
              for (const rule of rules) {
                const sourceCols = Object.keys(rule.mappings || {});
                const isMatch = sourceCols.length > 0 && sourceCols.every(sc => headers.includes(sc));
                if (isMatch) {
                  matchedRule = rule;
                  break;
                }
              }
            }

              if (matchedRule) {
                const ruleMappings = matchedRule.mappings;
                vendorId = matchedRule.vendorId === '__empty' || !matchedRule.vendorId ? 'COMMON' : matchedRule.vendorId;

              const colIndices: Record<string, number> = {};
              for (const [source, target] of Object.entries(ruleMappings)) {
                if (typeof target === 'string') {
                  colIndices[target] = headers.indexOf(source);
                }
              }

              for (let r = 1; r < rows.length; r++) {
                const row = rows[r];
                const itemName = row[colIndices['item_name']] || '';
                const qty = row[colIndices['quantity']] || '';
                if (!itemName && !qty) continue;

                items.push({
                  itemName,
                  qty,
                  unitPrice: row[colIndices['unit_price']] || '0',
                  amount: row[colIndices['total_amount']] || '0',
                  spec_w: row[colIndices['spec_w']] || '0',
                  spec_d: row[colIndices['spec_d']] || '0',
                  spec_h: row[colIndices['spec_h']] || '0',
                  unit: row[colIndices['unit']] || '',
                  remark: row[colIndices['remarks']] || '',
                });
              }
            } else {
              // Gemini AI 폴백
              const textForm = rows.map(r => r.join(' | ')).join('\n');
              items = await parseTextWithGemini(textForm, settings.ocrApiKey);
            }
          }
        } else if (['.jpg', '.png', '.jpeg', '.pdf'].includes(ext)) {
          const ocrText = await performOCR(filePath, settings.ocrApiKey);
          items = await parseTextWithGemini(ocrText, settings.ocrApiKey);
        } else {
          throw new Error('지원하지 않는 파일 형식입니다.');
        }

        // ─── Step 2: 정밀 계산 적용 ───
        items = applyPreciseCalculations(items, vendorId);

        // ─── Step 3: 문서번호 시퀀스 생성 ───
        const seq = getNextSequence(processDate);
        const vendorName = getVendorName(vendorId);
        const docNumber = `${processDate.replace(/-/g, '')}-${String(seq).padStart(3, '0')}`;

        // ─── Step 4: 총 금액 (정밀 합산) ───
        const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        // ─── Step 5: 파일명 규칙 적용 (날짜_업체명_순번) ───
        const outExcelName = generateFileName(vendorName, seq, '.xlsx');
        const outExcelPath = path.join(outputFolder, outExcelName);

        // ─── Step 6: 엑셀 거래명세서 생성 ───
        await generateInvoiceExcel(items, vendorName, outExcelPath);

        // ─── Step 7: 원본 파일 복사 ───
        const originalOutPath = path.join(outputFolder, `${path.parse(fileName).name}_원본${ext}`);
        fs.copyFileSync(filePath, originalOutPath);

        const fileResult = {
          fileName,
          status: 'success' as const,
          vendor: vendorName,
          docNumber,
          amount: totalAmount,
          savePath: outExcelPath,
          message: `명세서 생성 완료 (${items.length}건, ${totalAmount.toLocaleString()}원)`,
        };
        batchResults.push(fileResult);

        sender.send('batch:result', {
          id: crypto.randomUUID(),
          ...fileResult,
          result: fileResult.message,
        });

      } catch (err: any) {
        const fileResult = {
          fileName,
          status: 'error' as const,
          vendor: 'ERROR',
          docNumber: '-',
          amount: 0,
          savePath: '-',
          message: err.message || '처리 중 알 수 없는 오류 발생',
        };
        batchResults.push(fileResult);

        sender.send('batch:result', {
          id: crypto.randomUUID(),
          ...fileResult,
          result: fileResult.message,
        });
      }

      // 진행률 전송
      sender.send('batch:progress', { progress: Math.round(((i + 1) / totalFiles) * 100) });
    }

    // ─── Step 8: 배치 결과를 DB에 로그 저장 ───
    const successCount = batchResults.filter(r => r.status === 'success').length;
    const failCount = batchResults.filter(r => r.status === 'error').length;
    const warningCount = batchResults.filter(r => r.status === 'warning').length;
    const totalAmountAll = batchResults.reduce((sum, r) => sum + r.amount, 0);

    const logEntry: LogEntry = {
      id: crypto.randomUUID(),
      executionId,
      datetime: new Date().toISOString(),
      successCount,
      failCount,
      warningCount,
      totalAmount: totalAmountAll,
      status: failCount === 0 ? 'completed' : (successCount > 0 ? 'partial' : 'failed'),
      files: batchResults,
    };

    db.read();
    if (!Array.isArray(db.data.logs)) db.data.logs = [];
    db.data.logs.push(logEntry);
    db.write();

  } catch (error: any) {
    console.error('Batch Error:', error);
    sender.send('batch:result', {
      id: crypto.randomUUID(),
      status: 'error',
      vendor: 'SYSTEM',
      fileName: '배치 시스템',
      docNumber: '-',
      amount: 0,
      savePath: '-',
      result: error.message || '배치 처리 초기화 실패',
    });
    sender.send('batch:progress', { progress: 100 });
  }
}
