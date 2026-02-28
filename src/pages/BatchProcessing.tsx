import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Play, RotateCcw, Eye, AlertCircle, CheckCircle2, AlertTriangle, FolderOpen } from "lucide-react";
import { useElectron } from "@/hooks/use-electron";

interface ProcessingResult {
  id: string;
  status: "success" | "warning" | "error";
  vendor: string;
  fileName: string;
  docNumber: string;
  amount: number;
  savePath: string;
  result: string;
}

const statusIcon = {
  success: <CheckCircle2 className="h-4 w-4 text-success" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning" />,
  error: <AlertCircle className="h-4 w-4 text-destructive" />,
};

const statusBadge = {
  success: <Badge className="bg-success/10 text-success hover:bg-success/20 border-0">성공</Badge>,
  warning: <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-0">경고</Badge>,
  error: <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">실패</Badge>,
};

const today = new Date().toISOString().slice(0, 10);

export default function BatchProcessingPage() {
  const { api } = useElectron();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [processDate, setProcessDate] = useState(today);
  const [inputFolder, setInputFolder] = useState("");
  const [outputFolder, setOutputFolder] = useState("");
  const [useAiForExcel, setUseAiForExcel] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const dbData = await api.dbRead();
        if (!mounted) return;
        setInputFolder(dbData?.settings?.defaultInputFolder ?? "");
        setOutputFolder(dbData?.settings?.defaultOutputFolder ?? "");
      } catch (error) {
        console.error("Failed to load batch settings:", error);
      }
    };

    void loadSettings();

    // Setup Batch Listeners
    if (api.removeBatchListeners) {
      api.removeBatchListeners();
      api.onBatchProgress((data: any) => {
        if (!mounted) return;
        setProgress(data.progress || 0);
        if (data.progress >= 100) {
          setIsProcessing(false);
        }
      });
      api.onBatchResult((data: ProcessingResult) => {
        if (!mounted) return;
        setResults((prev) => [...prev, data]);
      });
    }

    return () => {
      mounted = false;
      if (api.removeBatchListeners) {
        api.removeBatchListeners();
      }
    };
  }, [api]);

  const successCount = useMemo(() => results.filter((r) => r.status === "success").length, [results]);
  const warningCount = useMemo(() => results.filter((r) => r.status === "warning").length, [results]);
  const errorCount = useMemo(() => results.filter((r) => r.status === "error").length, [results]);
  const totalAmount = useMemo(
    () => results.filter((r) => r.status !== "error").reduce((sum, r) => sum + r.amount, 0),
    [results],
  );

  const filteredResults = filterStatus === "all"
    ? results
    : results.filter((r) => r.status === filterStatus);

  const handleStartProcessing = async () => {
    if (!inputFolder || !outputFolder) {
      alert("입력 폴더와 출력 폴더를 지정해주세요.");
      return;
    }
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    try {
      await api.runBatch(inputFolder, outputFolder, processDate, useAiForExcel);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      alert("배치 처리 시작 실패: " + err.message);
    }
  };

  const handleCancelProcessing = async () => {
    try {
      await api.cancelBatch();
    } catch (e) {
      console.error("Cancel failed:", e);
    }
    setIsProcessing(false);
  };

  const handleRetryFailed = async () => {
    const failedFiles = results.filter((r) => r.status === "error").map((r) => r.fileName);
    if (failedFiles.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    // 성공/경고 결과만 유지
    setResults((prev) => prev.filter((r) => r.status !== "error"));
    try {
      await api.runBatch(inputFolder, outputFolder, processDate, useAiForExcel);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleRetryOne = async (fileName: string) => {
    setIsProcessing(true);
    setProgress(0);
    setResults((prev) => prev.filter((r) => r.fileName !== fileName));
    try {
      await api.runBatch(inputFolder, outputFolder, processDate, useAiForExcel);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 flex items-center gap-4 flex-wrap bg-card border rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input type="date" className="w-40" value={processDate} onChange={(e) => setProcessDate(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input placeholder="입력 폴더 경로" value={inputFolder} onChange={(e) => setInputFolder(e.target.value)} />
          <Button variant="outline" size="sm" onClick={async () => {
            const path = await api.selectFolder();
            if (path) setInputFolder(path);
          }}>찾기</Button>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input placeholder="출력 폴더 경로" value={outputFolder} onChange={(e) => setOutputFolder(e.target.value)} />
          <Button variant="outline" size="sm" onClick={async () => {
            const path = await api.selectFolder();
            if (path) setOutputFolder(path);
          }}>찾기</Button>
        </div>
        <div className="flex items-center gap-2 px-2">
          <input
            type="checkbox"
            id="useAiForExcel"
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            checked={useAiForExcel}
            onChange={(e) => setUseAiForExcel(e.target.checked)}
          />
          <Badge variant={useAiForExcel ? "default" : "secondary"} className="cursor-pointer" onClick={() => setUseAiForExcel(!useAiForExcel)}>
            엑셀 데이터도 AI(Gemini) 분석
          </Badge>
        </div>
        {isProcessing ? (
          <Button
            size="lg"
            variant="secondary"
            onClick={handleCancelProcessing}
            className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
          >
            <AlertCircle className="h-4 w-4" />
            일괄 처리 중단
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleStartProcessing}
            disabled={isProcessing}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            일괄 처리 시작
          </Button>
        )}
      </div>

      {isProcessing && <Progress value={progress} className="h-2" />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">성공</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-success">{successCount}건</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">경고</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-warning">{warningCount}건</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">실패</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-destructive">{errorCount}건</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">금액 합계</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{totalAmount.toLocaleString()}원</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="success">성공</SelectItem>
            <SelectItem value="warning">경고</SelectItem>
            <SelectItem value="error">실패</SelectItem>
          </SelectContent>
        </Select>
        {errorCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => void handleRetryFailed()}>
            <RotateCcw className="h-3.5 w-3.5" />
            실패 항목만 재시도
          </Button>
        )}
      </div>

      <Card>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px]">상태</TableHead>
                <TableHead>업체</TableHead>
                <TableHead>파일명</TableHead>
                <TableHead>문서번호</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead>저장경로</TableHead>
                <TableHead>결과</TableHead>
                <TableHead className="w-[100px]">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    처리 결과 데이터가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((row, i) => (
                  <TableRow key={row.id} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                    <TableCell>{statusBadge[row.status]}</TableCell>
                    <TableCell className="font-medium">{row.vendor}</TableCell>
                    <TableCell className="text-muted-foreground">{row.fileName}</TableCell>
                    <TableCell>{row.docNumber}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.amount > 0 ? `${row.amount.toLocaleString()}원` : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{row.savePath}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {statusIcon[row.status]}
                        <span className="text-sm">{row.result}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {row.status === "success" ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => void handleRetryOne(row.fileName)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
