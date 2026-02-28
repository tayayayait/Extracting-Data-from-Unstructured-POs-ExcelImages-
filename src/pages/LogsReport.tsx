import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Calendar, Download, Eye, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useElectron } from "@/hooks/use-electron";
import { toast } from "sonner";
import type { LogEntry, LogFileEntry } from "@/types/schema";

const statusBadge = {
  completed: <Badge className="bg-success/10 text-success hover:bg-success/20 border-0">완료</Badge>,
  partial: <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-0">부분 실패</Badge>,
  failed: <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">실패</Badge>,
};

const fileStatusIcon = {
  success: <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />,
  warning: <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0" />,
  error: <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />,
};

const today = new Date();
const lastMonth = new Date(today);
lastMonth.setDate(today.getDate() - 30);

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

export default function LogsReportPage() {
  const { api } = useElectron();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(toDateInput(lastMonth));
  const [dateTo, setDateTo] = useState(toDateInput(today));

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const dbData = await api.dbRead();
        if (mounted && dbData?.logs) {
          // 최신순 정렬
          const sortedLogs = [...dbData.logs].sort(
            (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
          );
          setLogs(sortedLogs);
        }
      } catch (error) {
        console.error("Failed to load logs:", error);
      }
    };

    void loadData();

    // 5초마다 자동 새로고침 (BatchProcessing에서 백그라운드로 로그가 쌓일 수 있으므로)
    const interval = setInterval(() => void loadData(), 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [api]);

  const openLogDetail = (log: LogEntry) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const filteredLogs = useMemo(
    () => logs.filter((log) => {
      const day = log.datetime.slice(0, 10);
      return day >= dateFrom && day <= dateTo;
    }).sort((a, b) => b.datetime.localeCompare(a.datetime)),
    [logs, dateFrom, dateTo],
  );

  const handleExportLogs = async () => {
    if (filteredLogs.length === 0) {
      toast.warning("다운로드할 로그 데이터가 없습니다.");
      return;
    }

    try {
      // CSV 형태로 변환하여 다운로드
      const header = "실행ID,일시,성공,실패,금액합계,상태";
      const rows = filteredLogs.map(log =>
        `${log.executionId},${log.datetime},${log.successCount},${log.failCount},${log.totalAmount},${log.status}`
      );
      const csvContent = [header, ...rows].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `처리로그_${dateFrom}_${dateTo}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("로그 다운로드 완료");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("로그 다운로드에 실패했습니다.");
    }
  };

  const formatDateTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input type="date" className="w-40" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <span className="text-muted-foreground">~</span>
          <Input type="date" className="w-40" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="flex-1" />
        <Button variant="outline" className="gap-2" onClick={handleExportLogs}>
          <Download className="h-4 w-4" />
          로그 다운로드
        </Button>
      </div>

      <Card>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>실행 ID</TableHead>
                <TableHead>일시</TableHead>
                <TableHead className="text-right">성공</TableHead>
                <TableHead className="text-right">실패</TableHead>
                <TableHead className="text-right">금액 합계</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="w-[80px]">상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    로그 데이터가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log, i) => (
                  <TableRow
                    key={log.id}
                    className={`cursor-pointer ${i % 2 === 1 ? "bg-muted/30" : ""}`}
                    onClick={() => openLogDetail(log)}
                  >
                    <TableCell className="font-mono text-xs">{log.executionId}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(log.datetime)}</TableCell>
                    <TableCell className="text-right tabular-nums text-success">{log.successCount}</TableCell>
                    <TableCell className="text-right tabular-nums text-destructive">{log.failCount}</TableCell>
                    <TableCell className="text-right tabular-nums">{log.totalAmount.toLocaleString()}원</TableCell>
                    <TableCell>{statusBadge[log.status]}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[420px] sm:max-w-[420px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>실행 상세</SheetTitle>
            <SheetDescription>{selectedLog?.executionId}</SheetDescription>
          </SheetHeader>

          {selectedLog && (
            <div className="mt-6 space-y-4">
              {/* 요약 카드 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">처리 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">실행 일시</span>
                    <span>{formatDateTime(selectedLog.datetime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">성공 건수</span>
                    <span className="text-success font-medium">{selectedLog.successCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">실패 건수</span>
                    <span className="text-destructive font-medium">{selectedLog.failCount}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">총 금액</span>
                    <span className="font-semibold">{selectedLog.totalAmount.toLocaleString()}원</span>
                  </div>
                </CardContent>
              </Card>

              {/* 파일별 상세 목록 */}
              {selectedLog.files && selectedLog.files.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">파일별 처리 결과</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedLog.files.map((file, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 p-2 rounded-md text-xs ${
                          file.status === 'error' ? 'bg-destructive/5' :
                          file.status === 'warning' ? 'bg-warning/5' :
                          'bg-success/5'
                        }`}
                      >
                        {fileStatusIcon[file.status]}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate" title={file.fileName}>{file.fileName}</p>
                          <p className="text-muted-foreground mt-0.5">{file.message}</p>
                          {file.status === 'success' && (
                            <div className="flex gap-3 mt-1 text-muted-foreground">
                              <span>문서: {file.docNumber}</span>
                              <span>금액: {file.amount.toLocaleString()}원</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
