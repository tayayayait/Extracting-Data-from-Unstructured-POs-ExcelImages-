import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  dbRead: () => ipcRenderer.invoke('db:read'),
  dbWrite: (data: any) => ipcRenderer.invoke('db:write', data),
  selectFolder: (defaultPath?: string) => ipcRenderer.invoke('dialog:selectFolder', defaultPath),
  parseExcel: (filePath: string) => ipcRenderer.invoke('parser:parseExcel', filePath),
  performOCR: (filePath: string) => ipcRenderer.invoke('parser:performOCR', filePath),
  parseGemini: (extractedText: string) => ipcRenderer.invoke('parser:parseGemini', extractedText),
  checkNtsStatus: (bizNumber: string) => ipcRenderer.invoke('api:ntsStatus', bizNumber),
  testGoogleApi: (apiKey: string) => ipcRenderer.invoke('api:testGoogleApi', apiKey),
  generateExcel: (records: any[], tmpl: string, out: string) => ipcRenderer.invoke('doc:generateExcel', records, tmpl, out),
  mergeInvoices: (genPdf: string, origPdf: string, out: string) => ipcRenderer.invoke('doc:mergeInvoices', genPdf, origPdf, out),

  // Batch
  runBatch: (inputFolder: string, outputFolder: string, processDate: string, useAiForExcel?: boolean) => ipcRenderer.invoke('batch:run', inputFolder, outputFolder, processDate, useAiForExcel),
  cancelBatch: () => ipcRenderer.invoke('batch:cancel'),
  onBatchProgress: (callback: (data: any) => void) => {
    ipcRenderer.on('batch:progress', (_, data) => callback(data));
  },
  onBatchResult: (callback: (data: any) => void) => {
    ipcRenderer.on('batch:result', (_, data) => callback(data));
  },
  removeBatchListeners: () => {
    ipcRenderer.removeAllListeners('batch:progress');
    ipcRenderer.removeAllListeners('batch:result');
  },
});
