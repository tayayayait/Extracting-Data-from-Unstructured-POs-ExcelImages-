import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Loader2, CheckCircle2, XCircle, AlertTriangle, Info, ArrowRight } from "lucide-react";
import { useElectron } from "@/hooks/use-electron";
import { formatBizNo, stripBizNo, isBizNoComplete, validateBizNoCheckDigit } from "@/lib/bizno-utils";
import { toast } from "sonner";
import type { PricingItem, MappingRule } from "@/types/schema";

interface Vendor {
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
}

export default function VendorManagementPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { api, isElectron } = useElectron();

  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPrefix, setFormPrefix] = useState("");
  const [formPath, setFormPath] = useState("");
  const [ntsStatus, setNtsStatus] = useState<"none" | "valid" | "invalid">("none");
  const [isCheckingNts, setIsCheckingNts] = useState(false);
  const [errors, setErrors] = useState<{name?: string, prefix?: string, path?: string, code?: string}>({});
  const [taxTypeLabel, setTaxTypeLabel] = useState("");
  const [bizStatusDetail, setBizStatusDetail] = useState("");
  const [duplicateVendor, setDuplicateVendor] = useState<Vendor | null>(null);
  const [checkDigitValid, setCheckDigitValid] = useState<boolean | null>(null);
  const autoCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 업체 상세 탭 데이터
  const [vendorPrices, setVendorPrices] = useState<PricingItem[]>([]);
  const [vendorMappings, setVendorMappings] = useState<MappingRule[]>([]);
  const [exceptionKeywords, setExceptionKeywords] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const dbData = await api.dbRead();
        if (!isMounted) return;
        setVendors(dbData?.vendors || []);
      } catch (error) {
        console.error("Failed to load vendors:", error);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [api]);

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.includes(search) || v.code.includes(search) || v.contact.includes(search)
  );

  // 자동 NTS 조회 (10자리 입력 완료 시)
  const performAutoCheck = useCallback(async (code: string) => {
    const digits = stripBizNo(code);
    if (digits.length !== 10) return;

    // 체크디짓 검증
    const isValid = validateBizNoCheckDigit(digits);
    setCheckDigitValid(isValid);
    if (!isValid) {
      setNtsStatus("invalid");
      setErrors((prev) => ({ ...prev, code: "사업자번호 형식이 유효하지 않습니다 (체크디짓 오류)." }));
      return;
    }

    // 중복 감지
    const existing = vendors.find(
      (v) => stripBizNo(v.code) === digits && v.id !== selectedVendor?.id
    );
    setDuplicateVendor(existing || null);

    // API 조회
    setIsCheckingNts(true);
    setNtsStatus("none");
    try {
      const res = await api.checkNtsStatus(digits);
      setErrors((prev) => ({ ...prev, code: undefined }));
      const item = res?.data?.[0];
      if (item) {
        setTaxTypeLabel(item.tax_type || "");
        setBizStatusDetail(item.b_stt || "");
        if (item.b_stt_cd === "01") {
          setNtsStatus("valid");
        } else {
          setNtsStatus("invalid");
        }
      } else {
        setNtsStatus("invalid");
      }
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        code: e instanceof Error ? e.message : "진위확인 중 오류가 발생했습니다.",
      }));
      setNtsStatus("invalid");
    } finally {
      setIsCheckingNts(false);
    }
  }, [api, vendors, selectedVendor]);

  const openVendorDetail = async (vendor: Vendor | null) => {
    setSelectedVendor(vendor);
    setFormName(vendor?.name || "");
    setFormCode(vendor?.code ? formatBizNo(vendor.code) : "");
    setFormContact(vendor?.contact || "");
    setFormPhone(vendor?.phone || "");
    setFormPrefix(vendor?.docPrefix || "");
    setFormPath(vendor?.savePath || "");
    setNtsStatus("none");
    setTaxTypeLabel(vendor?.taxType || "");
    setBizStatusDetail(vendor?.bizStatus || "");
    setDuplicateVendor(null);
    setCheckDigitValid(null);
    setErrors({});
    setExceptionKeywords((vendor as any)?.exceptionKeywords?.join("\n") || "");
    setDrawerOpen(true);

    // 업체 상세 탭 데이터 로드
    if (vendor) {
      try {
        const dbData = await api.dbRead();
        // pricing
        const tables = dbData?.pricingTables ?? [];
        const vendorTable = tables.find((t: any) => t.vendorId === vendor.id);
        setVendorPrices(vendorTable?.items ?? []);
        // mapping
        const rules = dbData?.mappingRules ?? [];
        setVendorMappings(rules.filter((r: any) => r.vendorId === vendor.id));
      } catch (e) {
        console.error("Failed to load vendor detail tabs:", e);
      }
    } else {
      setVendorPrices([]);
      setVendorMappings([]);
    }
  };

  const handleOpenChange = (open: boolean) => {
    // Prevent closing if currently saving
    if (isSaving && !open) return;
    setDrawerOpen(open);
  };

  const handleCheckNts = async () => {
    if (!formCode.trim()) {
      setErrors((prev) => ({ ...prev, code: "사업자번호를 입력해주세요." }));
      return;
    }
    await performAutoCheck(formCode);
  };

  // 사업자번호 입력 핸들러 (포맷 자동 적용 + 10자리 시 자동 조회)
  const handleBizNoChange = (rawValue: string) => {
    const formatted = formatBizNo(rawValue);
    setFormCode(formatted);
    if (errors.code) {
      setErrors((prev) => ({ ...prev, code: undefined }));
    }
    // 이전 타이머 취소
    if (autoCheckTimerRef.current) {
      clearTimeout(autoCheckTimerRef.current);
    }
    // 초기화
    setNtsStatus("none");
    setTaxTypeLabel("");
    setBizStatusDetail("");
    setDuplicateVendor(null);
    setCheckDigitValid(null);

    // 10자리 완성 시 500ms 후 자동 조회
    if (isBizNoComplete(rawValue)) {
      autoCheckTimerRef.current = setTimeout(() => {
        void performAutoCheck(formatted);
      }, 500);
    }
  };

  const handleSave = async () => {
    const cleanCode = stripBizNo(formCode);
    const newErrors: {name?: string, prefix?: string, path?: string, code?: string} = {};
    if (!formName.trim()) newErrors.name = "업체명은 필수입니다.";
    if (!cleanCode) newErrors.code = "사업자등록번호는 필수입니다.";
    else if (cleanCode.length !== 10) newErrors.code = "사업자등록번호는 10자리여야 합니다.";
    if (!formPrefix.trim()) newErrors.prefix = "문서 접두사는 필수입니다.";
    if (!formPath.trim()) newErrors.path = "저장 경로는 필수입니다.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);
    
    try {
      const dbData = await api.dbRead();
      let updatedVendors = dbData.vendors || [];
      
      if (selectedVendor) {
        // Edit
        updatedVendors = updatedVendors.map((v: Vendor) => 
          v.id === selectedVendor.id 
            ? { ...v, name: formName, code: cleanCode, contact: formContact, phone: formPhone, docPrefix: formPrefix, savePath: formPath, taxType: taxTypeLabel, bizStatus: bizStatusDetail }
            : v
        );
      } else {
        // Create
        const newVendor: Vendor = {
          id: crypto.randomUUID(),
          name: formName,
          code: cleanCode,
          contact: formContact,
          phone: formPhone,
          docPrefix: formPrefix,
          savePath: formPath,
          isActive: true,
          taxType: taxTypeLabel,
          bizStatus: bizStatusDetail,
        };
        updatedVendors.push(newVendor);
      }
      
      dbData.vendors = updatedVendors;
      await api.dbWrite(dbData);
      setVendors(updatedVendors);
      setDrawerOpen(false);
    } catch (e) {
      console.error("Failed to save vendor:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const dbData = await api.dbRead();
      const updatedVendors = (dbData.vendors || []).filter((v: Vendor) => v.id !== id);
      dbData.vendors = updatedVendors;
      await api.dbWrite(dbData);
      setVendors(updatedVendors);
    } catch (err) {
      console.error("Failed to delete vendor:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* 상단 바 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="업체명, 코드, 담당자 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button className="gap-2" onClick={() => openVendorDetail(null)}>
          <Plus className="h-4 w-4" />
          업체 추가
        </Button>
      </div>

      {/* 업체 테이블 */}
      <Card>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>코드</TableHead>
                <TableHead>업체명</TableHead>
                <TableHead>담당자</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>문서 접두사</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="w-[100px]">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors.map((vendor, i) => (
                  <TableRow
                    key={vendor.id}
                    className={`cursor-pointer ${i % 2 === 1 ? "bg-muted/30" : ""}`}
                    onClick={() => openVendorDetail(vendor)}
                  >
                    <TableCell className="font-mono text-xs">{vendor.code}</TableCell>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.contact}</TableCell>
                    <TableCell className="text-muted-foreground">{vendor.phone}</TableCell>
                    <TableCell className="font-mono text-xs">{vendor.docPrefix}</TableCell>
                    <TableCell>
                      <Badge variant={vendor.isActive ? "default" : "secondary"}>
                        {vendor.isActive ? "활성" : "비활성"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openVendorDetail(vendor); }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => handleDelete(e, vendor.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 업체 상세 Drawer */}
      <Sheet open={drawerOpen} onOpenChange={handleOpenChange}>
        <SheetContent className="w-[420px] sm:max-w-[420px] overflow-y-auto" onInteractOutside={(e) => isSaving && e.preventDefault()}>
          <SheetHeader>
            <SheetTitle>{selectedVendor?.name || "업체 상세"}</SheetTitle>
            <SheetDescription>업체 정보를 편집합니다.</SheetDescription>
          </SheetHeader>

          {drawerOpen && (
            <Tabs defaultValue="basic" className="mt-6">
              <TabsList className="w-full flex overflow-x-auto">
                <TabsTrigger value="basic" className="flex-1">기본</TabsTrigger>
                <TabsTrigger value="pricing" className="flex-1">단가</TabsTrigger>
                <TabsTrigger value="mapping" className="flex-1">매핑</TabsTrigger>
                <TabsTrigger value="rules" className="flex-1">규칙</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>업체명 *</Label>
                  <Input 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)}
                    className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''} 
                  />
                  {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>사업자등록번호(코드) *</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={formCode}
                      onChange={e => handleBizNoChange(e.target.value)}
                      placeholder="000-00-00000"
                      className={`flex-1 font-mono ${errors.code ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    <Button
                      variant="secondary"
                      onClick={handleCheckNts}
                      disabled={isCheckingNts || !formCode.trim()}
                    >
                      {isCheckingNts ? <Loader2 className="w-4 h-4 animate-spin" /> : "조회"}
                    </Button>
                  </div>

                  {/* 체크디짓 검증 결과 */}
                  {checkDigitValid === false && (
                    <p className="text-destructive text-xs flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> 사업자번호 형식이 유효하지 않습니다 (체크디짓 오류)
                    </p>
                  )}

                  {errors.code && <p className="text-destructive text-xs">{errors.code}</p>}

                  {/* 정상 사업자 */}
                  {ntsStatus === "valid" && (
                    <div className="space-y-1">
                      <p className="text-green-600 text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 정상 — {bizStatusDetail || "계속사업자"}
                      </p>
                      {taxTypeLabel && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">{taxTypeLabel}</Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 휴/폐업 경고 */}
                  {ntsStatus === "invalid" && checkDigitValid !== false && (
                    <Alert variant="destructive" className="py-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {bizStatusDetail ? `${bizStatusDetail}` : "휴/폐업 또는 유효하지 않은 사업자번호입니다."}
                        {taxTypeLabel && ` (${taxTypeLabel})`}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* 중복 감지 경고 */}
                  {duplicateVendor && (
                    <Alert className="py-2 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                      <Info className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-xs text-yellow-700">
                        이미 등록된 업체입니다: <strong>{duplicateVendor.name}</strong>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* 로딩 인디케이터 */}
                  {isCheckingNts && (
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> 사업자 정보 조회 중...
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>담당자</Label>
                  <Input value={formContact} onChange={e => setFormContact(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>연락처</Label>
                  <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>문서 접두사 *</Label>
                  <Input 
                    value={formPrefix} 
                    onChange={e => setFormPrefix(e.target.value)}
                    className={errors.prefix ? 'border-destructive focus-visible:ring-destructive' : ''} 
                  />
                  {errors.prefix && <p className="text-destructive text-xs">{errors.prefix}</p>}
                </div>
                <div className="space-y-2">
                  <Label>저장 경로 *</Label>
                  <Input 
                    value={formPath} 
                    onChange={e => setFormPath(e.target.value)}
                    className={errors.path ? 'border-destructive focus-visible:ring-destructive' : ''} 
                  />
                  {errors.path && <p className="text-destructive text-xs">{errors.path}</p>}
                </div>
                <div className="pt-4 flex gap-2">
                  <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "저장"}
                  </Button>
                  <Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={isSaving}>취소</Button>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">품목별 단가</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vendorPrices.length === 0 ? (
                      <p className="text-sm text-muted-foreground">등록된 단가가 없습니다. 단가·규칙 메뉴에서 추가하세요.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>품목명</TableHead>
                            <TableHead>코드</TableHead>
                            <TableHead>단위</TableHead>
                            <TableHead className="text-right">단가</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vendorPrices.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{item.itemName}</TableCell>
                              <TableCell className="font-mono text-xs">{item.itemCode || "-"}</TableCell>
                              <TableCell>{item.unit || "-"}</TableCell>
                              <TableCell className="text-right tabular-nums">{item.unitPrice.toLocaleString()}원</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mapping" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">매핑 규칙</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vendorMappings.length === 0 ? (
                      <p className="text-sm text-muted-foreground">등록된 매핑 규칙이 없습니다. 매핑 마법사에서 추가하세요.</p>
                    ) : (
                      <div className="space-y-3">
                        {vendorMappings.map((rule) => (
                          <div key={rule.id} className="border rounded-lg p-3 space-y-2">
                            <p className="text-sm font-medium">{rule.ruleName}</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(rule.mappings).map(([src, tgt]) => (
                                <div key={src} className="flex items-center gap-1 text-xs">
                                  <Badge variant="outline">{src}</Badge>
                                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                  <Badge>{tgt}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="rules" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">예외 키워드</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>예외 키워드 (줄 단위)</Label>
                      <Textarea
                        placeholder="예외 처리용 키워드를 줄 단위로 입력하세요."
                        rows={5}
                        value={exceptionKeywords}
                        onChange={(e) => setExceptionKeywords(e.target.value)}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!selectedVendor) return;
                        try {
                          const dbData = await api.dbRead();
                          const updatedVendors = (dbData.vendors || []).map((v: Vendor) =>
                            v.id === selectedVendor.id
                              ? { ...v, exceptionKeywords: exceptionKeywords.split("\n").map(s => s.trim()).filter(Boolean) }
                              : v
                          );
                          dbData.vendors = updatedVendors;
                          await api.dbWrite(dbData);
                          setVendors(updatedVendors);
                          toast.success("예외 키워드가 저장되었습니다.");
                        } catch (e) {
                          toast.error("저장에 실패했습니다.");
                        }
                      }}
                    >
                      키워드 저장
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}



