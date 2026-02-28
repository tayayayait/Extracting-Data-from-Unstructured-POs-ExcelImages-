import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Internal modules
import { db } from './db';
import { parseExcelOrCsv } from './parser';
import { performOCR } from './ocr';

// Ensure this directory exists
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null = null;
let batchCancelled = false;

// Setup IPC Listeners
function setupIpcHandlers() {
  // DB Handlers
  ipcMain.handle('db:read', () => {
    db.read();
    return db.data;
  });
  
  ipcMain.handle('db:write', (_, currentData) => {
    db.data = currentData;
    db.write();
    return true;
  });

  ipcMain.handle('dialog:selectFolder', async (_, defaultPath?: string) => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      defaultPath: defaultPath && defaultPath.trim() ? defaultPath : undefined,
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  // Parser Handlers
  ipcMain.handle('parser:parseExcel', async (_, filePath: string) => {
    return parseExcelOrCsv(filePath);
  });

  // OCR Handlers
  ipcMain.handle('parser:performOCR', async (_, filePath: string) => {
    db.read(); // Get latest settings
    const settings = db.data.settings;
    return performOCR(filePath, settings.ocrApiKey);
  });

  ipcMain.handle('parser:parseGemini', async (_, extractedText: string) => {
    db.read();
    const settings = db.data.settings;
    const { parseTextWithGemini } = require('./llm');
    return parseTextWithGemini(extractedText, settings.ocrApiKey);
  });

  // NTS API Handlers
  ipcMain.handle('api:ntsStatus', async (_, bizNumber: string) => {
    require('dotenv').config();
    const apiKey = process.env.VITE_NTS_API_KEY || '';
    const { checkBusinessStatus } = require('./nts');
    return checkBusinessStatus(bizNumber, apiKey);
  });

  // Google API Test Handler
  ipcMain.handle('api:testGoogleApi', async (_, apiKey: string) => {
    const normalizedKey = apiKey?.trim();
    if (!normalizedKey) {
      throw new Error('Google API key is empty.');
    }
    if (!/^AIza[0-9A-Za-z_-]{20,}$/.test(normalizedKey)) {
      throw new Error('Invalid Google API key format. Use a Google AI Studio key (starts with "AIza").');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(normalizedKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'ping' }] }],
        generationConfig: { maxOutputTokens: 1 },
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      if (response.status === 401 && detail.includes('API keys are not supported')) {
        throw new Error('Provided credential is not a Google API key. Use Google AI Studio API key (starts with "AIza").');
      }
      throw new Error(`Google API test failed (${response.status}): ${detail}`);
    }

    return true;
  });

  // Generator Handlers
  ipcMain.handle('doc:generateExcel', async (_, records: any[], tmpl: string, out: string) => {
    const { generateInvoiceExcel } = require('./generator');
    return generateInvoiceExcel(records, tmpl, out);
  });

  ipcMain.handle('doc:mergeInvoices', async (_, genPdf: string, origPdf: string, out: string) => {
    const { mergeInvoices } = require('./generator');
    return mergeInvoices(genPdf, origPdf, out);
  });

  // Batch Handlers
  ipcMain.handle('batch:run', async (event, input: string, output: string, date: string, useAiForExcel?: boolean) => {
    batchCancelled = false;
    const { runBatch } = require('./batch');
    // Fire and forget so we don't block
    runBatch(event.sender, input, output, date, useAiForExcel, () => batchCancelled).catch((err: any) => console.error("Batch engine threw unhandled error", err));
    return true;
  });

  ipcMain.handle('batch:cancel', async () => {
    batchCancelled = true;
    return true;
  });
}

function createWindow() {
  setupIpcHandlers();
  
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    // In production, load the local index.html
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
