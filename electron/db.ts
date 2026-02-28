import { app } from 'electron';
import { join } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

export interface LogEntry {
  id: string;
  executionId: string;
  datetime: string;
  successCount: number;
  failCount: number;
  warningCount: number;
  totalAmount: number;
  status: 'completed' | 'partial' | 'failed';
  files: {
    fileName: string;
    status: 'success' | 'warning' | 'error';
    vendor: string;
    docNumber: string;
    amount: number;
    savePath: string;
    message: string;
  }[];
}

export type Schema = {
  vendors: {
    id: string;
    name: string;
    code: string;
    contact: string;
    phone: string;
    docPrefix: string;
    savePath: string;
    isActive: boolean;
    taxType?: string;
    bizStatus?: string;
    exceptionKeywords?: string[];
  }[];
  mappingRules: {
    id: string;
    vendorId: string;
    ruleName: string;
    mappings: Record<string, string>;
  }[];
  settings: {
    defaultInputFolder: string;
    defaultOutputFolder: string;
    ocrApiKey: string;
    reduceMotion: boolean;
  };
  pricingTables: {
    vendorId: string;
    items: {
      itemName: string;
      itemCode: string;
      unit: string;
      unitPrice: number;
    }[];
  }[];
  logs: LogEntry[];
  sequenceCounters: Record<string, number>; // key: YYYYMMDD, value: last used seq
};

const defaultData: Schema = {
  vendors: [],
  mappingRules: [],
  pricingTables: [],
  logs: [],
  sequenceCounters: {},
  settings: {
    defaultInputFolder: '',
    defaultOutputFolder: '',
    ocrApiKey: '',
    reduceMotion: false
  }
};

class LocalDB {
  private file: string;
  public data: Schema;

  constructor() {
    const userDataPath = app.getPath('userData');
    if (!existsSync(userDataPath)) {
      mkdirSync(userDataPath, { recursive: true });
    }
    this.file = join(userDataPath, 'app_db.json');
    this.data = { ...defaultData };
  }

  read() {
    if (existsSync(this.file)) {
      try {
        const raw = readFileSync(this.file, 'utf-8');
        this.data = { ...defaultData, ...JSON.parse(raw) };
      } catch (e) {
        console.error('Failed to read DB:', e);
      }
    } else {
      this.write();
    }
  }

  write() {
    try {
      writeFileSync(this.file, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error('Failed to write DB:', e);
    }
  }
}

export const db = new LocalDB();
