/**
 * 공유 타입 정의 — 프론트엔드/백엔드 전 모듈에서 사용
 *
 * 이 파일은 JSON DB의 스키마와 모듈 간 데이터 교환 인터페이스를
 * 한 곳에서 관리하기 위해 만들어졌습니다.
 */

// ─── Vendor (업체) ───
export interface Vendor {
  id: string;
  name: string;
  code: string;           // 사업자등록번호 (10자리)
  contact: string;
  phone: string;
  docPrefix: string;
  savePath: string;
  isActive: boolean;
  taxType?: string;       // 세금 유형 (NTS 조회 결과)
  bizStatus?: string;     // 사업자 상태 (NTS 조회 결과)
  exceptionKeywords?: string[];  // 예외 키워드
}

// ─── Mapping Rule (매핑 규칙) ───
export interface MappingRule {
  id: string;
  vendorId: string;       // "" = 공통(모든 업체), vendor.id = 특정 업체
  ruleName: string;
  mappings: Record<string, string>;  // sourceColumn → targetField
}

// ─── Pricing Table (단가 테이블) ───
export interface PricingItem {
  itemName: string;
  itemCode: string;
  unit: string;
  unitPrice: number;
}

export interface PricingTable {
  vendorId: string;       // "__common" = 공통, vendor.id = 특정 업체
  items: PricingItem[];
}

// ─── Log (로그) ───
export interface LogFileEntry {
  fileName: string;
  status: "success" | "warning" | "error";
  vendor: string;
  docNumber: string;
  amount: number;
  savePath: string;
  message: string;
}

export interface LogEntry {
  id: string;
  executionId: string;
  datetime: string;
  successCount: number;
  failCount: number;
  warningCount: number;
  totalAmount: number;
  status: "completed" | "partial" | "failed";
  files: LogFileEntry[];
}

// ─── Settings (설정) ───
export interface AppSettings {
  defaultInputFolder: string;
  defaultOutputFolder: string;
  ocrApiKey: string;
  reduceMotion: boolean;
}

// ─── Processing Result (배치 결과 — UI) ───
export interface ProcessingResult {
  id: string;
  status: "success" | "warning" | "error";
  vendor: string;
  fileName: string;
  docNumber: string;
  amount: number;
  savePath: string;
  result: string;
}

// ─── DB Schema (전체 DB 구조) ───
export interface Schema {
  vendors: Vendor[];
  mappingRules: MappingRule[];
  pricingTables: PricingTable[];
  logs: LogEntry[];
  sequenceCounters: Record<string, number>;  // key: YYYYMMDD
  settings: AppSettings;
}

// ─── 기본값 ───
export const defaultSettings: AppSettings = {
  defaultInputFolder: "",
  defaultOutputFolder: "",
  ocrApiKey: "",
  reduceMotion: false,
};

export const makeEmptyDb = (): Schema => ({
  settings: { ...defaultSettings },
  vendors: [],
  mappingRules: [],
  pricingTables: [],
  logs: [],
  sequenceCounters: {},
});
