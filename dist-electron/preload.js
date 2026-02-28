import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
  dbRead: () => ipcRenderer.invoke("db:read"),
  dbWrite: (data) => ipcRenderer.invoke("db:write", data),
  parseExcel: (filePath) => ipcRenderer.invoke("parser:parseExcel", filePath),
  performOCR: (filePath) => ipcRenderer.invoke("parser:performOCR", filePath),
  parseGemini: (extractedText) => ipcRenderer.invoke("parser:parseGemini", extractedText),
  checkNtsStatus: (bizNumber) => ipcRenderer.invoke("api:ntsStatus", bizNumber),
  generateExcel: (records, tmpl, out) => ipcRenderer.invoke("doc:generateExcel", records, tmpl, out),
  mergeInvoices: (genPdf, origPdf, out) => ipcRenderer.invoke("doc:mergeInvoices", genPdf, origPdf, out)
});
