import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, Check, ArrowRight, ArrowLeft, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useElectron } from "@/hooks/use-electron";

const steps = [
  { id: 1, title: "샘플 업로드", description: "분석할 파일을 업로드합니다" },
  { id: 2, title: "필드 매핑", description: "원본과 대상 필드를 매핑합니다" },
  { id: 3, title: "미리보기", description: "매핑 결과를 확인합니다" },
  { id: 4, title: "저장", description: "매핑 규칙을 저장합니다" },
];

const targetFields = ["item_name", "quantity", "unit_price", "total_amount", "remarks", "item_code", "unit", "spec_w", "spec_d", "spec_h"];
const requiredMappingFields = ["item_name", "quantity", "unit_price"];

const getMappingErrors = (currentMappings: Record<string, string>): string[] => {
  const mappedFields = new Set(Object.values(currentMappings));
  return requiredMappingFields
    .filter((field) => !mappedFields.has(field))
    .map((field) => `필수 필드 '${field}'가 매핑되지 않았습니다.`);
};

interface VendorItem {
  id: string;
  name: string;
}

export default function MappingWizardPage() {
  const { api, isElectron } = useElectron();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [tableData, setTableData] = useState<string[][]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showMappingErrors, setShowMappingErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [targetVendor, setTargetVendor] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const vendorOptions = [
    { id: "", name: "공통 (모든 업체 적용)" },
    ...vendors.map((v: any) => ({
      id: v.id,
      name: v.name,
    })),
  ];

  useEffect(() => {
    let mounted = true;

    const loadVendors = async () => {
      try {
        const dbData = await api.dbRead();
        if (!mounted) return;
        setVendors((dbData?.vendors ?? []).map((v: { id: string; name: string }) => ({ id: v.id, name: v.name })));
      } catch (error) {
        console.error("Failed to load vendors:", error);
      }
    };

    void loadVendors();
    return () => {
      mounted = false;
    };
  }, [api]);

  const mappingErrors = useMemo(() => getMappingErrors(mappings), [mappings]);
  const canProceed = useMemo(() => {
    if (currentStep === 1) return !!uploadedFile && sourceColumns.length > 0;
    if (currentStep === 2) return mappingErrors.length === 0;
    if (currentStep === 3) return mappingErrors.length === 0;
    return true;
  }, [currentStep, uploadedFile, sourceColumns, mappingErrors]);

  const handleSave = async () => {
    if (!ruleName.trim()) {
      toast.error("규칙 이름을 입력해주세요.");
      return;
    }
    setIsSaving(true);
    try {
      const dbData = await api.dbRead();
      const newRule = {
        id: crypto.randomUUID(),
        vendorId: targetVendor,
        ruleName,
        mappings,
      };
      dbData.mappingRules = [...(dbData.mappingRules || []), newRule];
      await api.dbWrite(dbData);
      toast.success("매핑 규칙이 저장되었습니다.");
      
      setCurrentStep(1);
      setShowMappingErrors(false);
      setUploadedFile(null);
      setSourceColumns([]);
      setTableData([]);
      setMappings({});
      setRuleName("");
    } catch (e: any) {
       toast.error("규칙 저장에 실패했습니다.", { description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  /** 파싱 결과(rows)를 받아 상태에 반영하는 공통 헬퍼 */
  const applyParsedRows = (fileName: string, rows: string[][]) => {
    if (rows.length === 0) {
      toast.error("엑셀 파일이 비어있습니다.");
      return;
    }

    const headers = rows[0];
    setUploadedFile(fileName);
    setSourceColumns(headers);
    setTableData(rows.slice(1, 6)); // Preview 5 rows

    // Auto mapping attempts based on header strings
    const autoMap: Record<string, string> = {};
    headers.forEach((h) => {
      if (h.includes("품명") || h.includes("설명") || h.includes("Item")) autoMap[h] = "item_name";
      else if (h.includes("수량") || h.includes("수") || h.includes("Qty")) autoMap[h] = "quantity";
      else if (h.includes("단가") || h.includes("가격") || h.includes("Price")) autoMap[h] = "unit_price";
      else if (h.includes("금액") || h.includes("총액") || h.includes("Amount")) autoMap[h] = "total_amount";
      else if (h.includes("비고") || h.includes("Remark")) autoMap[h] = "remarks";
      else if (h.includes("코드") || h.includes("품번") || h.includes("Code")) autoMap[h] = "item_code";
      else if (h.includes("단위") || h.includes("Unit")) autoMap[h] = "unit";
    });
    setMappings(autoMap);
  };

  /** 브라우저에서 File → ArrayBuffer 로 읽어서 반환 */
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error("파일을 읽는 도중 오류가 발생했습니다."));
      reader.readAsArrayBuffer(file);
    });

  /** CSV 텍스트 → string[][] 간이 파서 */
  const parseCsvText = (text: string): string[][] =>
    text
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => line.split(",").map((cell) => cell.trim()));

  const setFileFromList = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      if (isElectron) {
        // Electron: file.path 사용
        const filePath = (file as any).path;
        if (!filePath) {
          toast.error("파일 경로를 읽을 수 없습니다. 환경을 확인해주세요.");
          return;
        }
        const ext = file.name.split(".").pop()?.toLowerCase();
        
        if (["png", "jpg", "jpeg"].includes(ext || "")) {
          toast.info("이미지 분석 중... 시간이 걸릴 수 있습니다.", { id: "analyzeLoading" });
          try {
            const ocrText = await api.performOCR(filePath);
            const items = await api.parseGemini(ocrText);
            toast.dismiss("analyzeLoading");
            
            if (!items || items.length === 0) {
              toast.error("이미지에서 유효한 데이터를 추출하지 못했습니다.");
              return;
            }
            const headers = Object.keys(items[0]);
            const rows = [headers];
            items.forEach((item: any) => {
              rows.push(headers.map(h => String(item[h] || "")));
            });
            applyParsedRows(file.name, rows);
          } catch(e) {
            toast.dismiss("analyzeLoading");
            throw e;
          }
        } else {
          const rows = await api.parseExcel(filePath);
          applyParsedRows(file.name, rows);
        }
      } else {
        // Browser: FileReader로 ArrayBuffer를 읽어서 파싱
        const ext = file.name.split(".").pop()?.toLowerCase();

        if (["png", "jpg", "jpeg"].includes(ext || "")) {
          toast.error("이미지 분석(OCR) 기능은 데스크톱 앱(Electron) 환경에서만 지원됩니다.");
        } else if (ext === "csv") {
          const text = await file.text();
          const rows = parseCsvText(text);
          applyParsedRows(file.name, rows);
        } else if (ext === "xlsx") {
          const buffer = await readFileAsArrayBuffer(file);
          const rows = await api.parseExcel(buffer);
          applyParsedRows(file.name, rows);
        } else {
          toast.error("지원하지 않는 파일 형식입니다. xlsx 또는 csv 파일을 사용하세요.");
        }
      }
    } catch (e: any) {
      toast.error("파일 파싱 실패", { description: e.message });
      setUploadedFile(null);
      setSourceColumns([]);
      setTableData([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFileFromList(e.dataTransfer.files);
  };

  const handleNext = () => {
    if (currentStep === 2 && mappingErrors.length > 0) {
      setShowMappingErrors(true);
      return;
    }

    setShowMappingErrors(false);
    setCurrentStep((step) => step + 1);
  };

  return (
    <div className="flex gap-6 min-h-[calc(100vh-120px)]">
      <div className="w-60 shrink-0">
        <div className="space-y-1">
          {steps.map((step) => (
            <button
              key={step.id}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg transition-colors",
                currentStep === step.id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : step.id < currentStep
                    ? "text-success"
                    : "text-muted-foreground",
              )}
              onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : step.id < currentStep
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {step.id < currentStep ? <Check className="h-3.5 w-3.5" /> : step.id}
                </div>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>샘플 파일 업로드</CardTitle>
              <CardDescription>분석할 엑셀 또는 CSV 파일을 업로드하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv,.png,.jpg,.jpeg"
                onChange={(e) => setFileFromList(e.target.files)}
              />
              <div
                className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                data-testid="mapping-upload-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <FileSpreadsheet className="h-12 w-12 text-success" />
                    <p className="font-medium">{uploadedFile}</p>
                    <Badge variant="secondary">업로드 완료</Badge>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">파일을 드래그하거나 클릭해 업로드하세요.</p>
                    <p className="text-xs text-muted-foreground">xlsx, xls, csv, png, jpg 확장자를 지원합니다.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>필드 매핑</CardTitle>
              <CardDescription>원본 컬럼을 대상 필드와 매핑하세요. (필수: item_name, quantity, unit_price)</CardDescription>
            </CardHeader>
            <CardContent>
              {showMappingErrors && mappingErrors.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  {mappingErrors.map((error) => (
                    <p key={error} className="text-sm text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>원본 컬럼</TableHead>
                    <TableHead>→</TableHead>
                    <TableHead>대상 필드</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourceColumns.map((column, index) => (
                    <TableRow key={`${column}-${index}`}>
                      <TableCell className="font-medium">{column}</TableCell>
                      <TableCell>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={mappings[column] || ""}
                          onValueChange={(value) => setMappings((prev) => ({ ...prev, [column]: value }))}
                        >
                          <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="필드 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {targetFields.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field}
                                {requiredMappingFields.includes(field) ? " *" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>매핑 미리보기</CardTitle>
              <CardDescription>매핑 결과를 확인하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(mappings).map(([source, target]) => (
                  <div key={source} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Badge variant="outline">{source}</Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge>{target}</Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="gap-2" onClick={() => setPreviewOpen(true)}>
                <Eye className="h-4 w-4" />
                상세 미리보기
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>매핑 규칙 저장</CardTitle>
              <CardDescription>규칙 이름과 적용 대상을 선택해 저장하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>규칙 이름 *</Label>
                <Input placeholder="규칙 이름" value={ruleName} onChange={e => setRuleName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>적용 업체</Label>
                <Select value={targetVendor} onValueChange={setTargetVendor}>
                  <SelectTrigger>
                    <SelectValue placeholder="적용 대상 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorOptions.map((v) => (
                      <SelectItem key={v.id === "" ? "__empty" : v.id} value={v.id || "__empty"}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                매핑 규칙 저장
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((step) => Math.max(1, step - 1))}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            이전
          </Button>
          {currentStep < 4 && (
            <Button
              data-testid="mapping-next-button"
              onClick={handleNext}
              disabled={!canProceed}
              className="gap-2"
            >
              다음
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[840px]">
          <DialogHeader>
            <DialogTitle>매핑 결과 미리보기</DialogTitle>
            <DialogDescription>업로드된 데이터에 현재 매핑 규칙을 적용한 결과입니다.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {targetFields.map((field) => (
                    <TableHead key={`th-${field}`}>{field}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={targetFields.length} className="text-center text-muted-foreground">
                      미리보기 데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  tableData.map((row, rowIndex) => {
                    // Extract mapped indices
                    const mappedRow: Record<string, string> = {};
                    targetFields.forEach(target => {
                      const sourceCol = Object.keys(mappings).find(src => mappings[src] === target);
                      if (sourceCol) {
                        const colIndex = sourceColumns.indexOf(sourceCol);
                        mappedRow[target] = colIndex !== -1 ? (row[colIndex] || '') : '';
                      } else {
                        mappedRow[target] = '';
                      }
                    });

                    return (
                      <TableRow key={`row-${rowIndex}`}>
                        {targetFields.map(target => (
                          <TableCell key={`cell-${rowIndex}-${target}`}>
                            {mappedRow[target] !== '' ? mappedRow[target] : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
