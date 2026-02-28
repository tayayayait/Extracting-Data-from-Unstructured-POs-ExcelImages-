import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, Save, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useElectron } from "@/hooks/use-electron";
import { toast } from "sonner";
import type { PricingItem, PricingTable } from "@/types/schema";

// ─── 타입 ───

interface VendorItem {
  id: string;
  name: string;
}

interface FlatUnitPrice extends PricingItem {
  /** 표시용 고유 키 */
  key: string;
  vendorId: string;
  vendorName: string;
}

// ─── 헬퍼 ───

/** pricingTables 배열 → 플랫 목록으로 변환 */
const flattenPricingTables = (
  tables: PricingTable[],
  vendorMap: Map<string, string>,
): FlatUnitPrice[] =>
  tables.flatMap((table) =>
    (table.items ?? []).map((item, idx) => ({
      key: `${table.vendorId}-${idx}-${item.itemName}`,
      vendorId: table.vendorId,
      vendorName: vendorMap.get(table.vendorId) ?? (table.vendorId === "__common" ? "공통" : ""),
      ...item,
    })),
  );

// ─── 컴포넌트 ───

export default function PricingRulesPage() {
  const { api } = useElectron();

  // 원본 데이터
  const [pricingTables, setPricingTables] = useState<PricingTable[]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [vendorMap, setVendorMap] = useState<Map<string, string>>(new Map());

  // UI 상태
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FlatUnitPrice | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 폼 상태
  const [formItemName, setFormItemName] = useState("");
  const [formItemCode, setFormItemCode] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formVendorId, setFormVendorId] = useState("__common");

  // ─── 데이터 로드 ───

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const dbData = await api.dbRead();
        if (!mounted) return;

        const rawVendors = dbData?.vendors ?? [];
        const map = new Map<string, string>(
          rawVendors.map((v: { id: string; name: string }) => [v.id, v.name]),
        );
        setVendorMap(map);
        setVendors(rawVendors.map((v: { id: string; name: string }) => ({ id: v.id, name: v.name })));
        setPricingTables(dbData?.pricingTables ?? []);
      } catch (error) {
        console.error("Failed to load pricing tables:", error);
      }
    };

    void loadData();
    return () => { mounted = false; };
  }, [api]);

  // ─── 파생 데이터 ───

  const flatPrices = useMemo(
    () => flattenPricingTables(pricingTables, vendorMap),
    [pricingTables, vendorMap],
  );

  const filtered = useMemo(
    () =>
      flatPrices.filter(
        (p) =>
          p.itemName.includes(search) ||
          p.itemCode.includes(search) ||
          p.vendorName.includes(search),
      ),
    [flatPrices, search],
  );

  // ─── 다이얼로그: 열기/닫기 ───

  const resetForm = () => {
    setFormItemName("");
    setFormItemCode("");
    setFormUnit("");
    setFormPrice("");
    setFormVendorId("__common");
    setEditingItem(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (item: FlatUnitPrice) => {
    setEditingItem(item);
    setFormItemName(item.itemName);
    setFormItemCode(item.itemCode || "");
    setFormUnit(item.unit || "");
    setFormPrice(String(item.unitPrice));
    setFormVendorId(item.vendorId);
    setDialogOpen(true);
  };

  // ─── 저장 ───

  const handleSave = async () => {
    if (!formItemName.trim()) {
      toast.error("품목명을 입력해주세요.");
      return;
    }
    const price = Number(formPrice);
    if (isNaN(price) || price < 0) {
      toast.error("유효한 단가를 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const dbData = await api.dbRead();
      const tables: PricingTable[] = dbData?.pricingTables ?? [];

      const newItem: PricingItem = {
        itemName: formItemName.trim(),
        itemCode: formItemCode.trim(),
        unit: formUnit.trim(),
        unitPrice: price,
      };

      if (editingItem) {
        // 편집: 기존 아이템 교체
        const tableIdx = tables.findIndex((t) => t.vendorId === editingItem.vendorId);
        if (tableIdx !== -1) {
          const itemIdx = tables[tableIdx].items.findIndex(
            (it) => it.itemName === editingItem.itemName && it.unitPrice === editingItem.unitPrice,
          );
          if (itemIdx !== -1) {
            // vendorId가 변경된 경우 → 기존 테이블에서 제거 후 새 테이블에 추가
            if (formVendorId !== editingItem.vendorId) {
              tables[tableIdx].items.splice(itemIdx, 1);
              if (tables[tableIdx].items.length === 0) {
                tables.splice(tableIdx, 1);
              }
              upsertToTable(tables, formVendorId, newItem);
            } else {
              tables[tableIdx].items[itemIdx] = newItem;
            }
          }
        }
      } else {
        // 추가
        upsertToTable(tables, formVendorId, newItem);
      }

      dbData.pricingTables = tables;
      await api.dbWrite(dbData);
      setPricingTables([...tables]);
      setDialogOpen(false);
      resetForm();
      toast.success(editingItem ? "단가가 수정되었습니다." : "단가가 추가되었습니다.");
    } catch (e: any) {
      toast.error("단가 저장에 실패했습니다.", { description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── 삭제 ───

  const handleDelete = async (item: FlatUnitPrice) => {
    if (!confirm(`"${item.itemName}" 단가를 삭제하시겠습니까?`)) return;

    try {
      const dbData = await api.dbRead();
      const tables: PricingTable[] = dbData?.pricingTables ?? [];
      const tableIdx = tables.findIndex((t) => t.vendorId === item.vendorId);
      if (tableIdx !== -1) {
        tables[tableIdx].items = tables[tableIdx].items.filter(
          (it) => !(it.itemName === item.itemName && it.unitPrice === item.unitPrice),
        );
        if (tables[tableIdx].items.length === 0) {
          tables.splice(tableIdx, 1);
        }
      }
      dbData.pricingTables = tables;
      await api.dbWrite(dbData);
      setPricingTables([...tables]);
      toast.success("단가가 삭제되었습니다.");
    } catch (e: any) {
      toast.error("삭제에 실패했습니다.", { description: e.message });
    }
  };

  // ─── Render ───

  return (
    <div className="space-y-6">
      <Tabs defaultValue="prices">
        <TabsList>
          <TabsTrigger value="prices">단가 관리</TabsTrigger>
          <TabsTrigger value="rules">규칙 편집</TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="품목명, 코드, 업체 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button className="gap-2" onClick={openAddDialog}>
              <Plus className="h-4 w-4" />
              단가 추가
            </Button>
          </div>

          <Card>
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>품목코드</TableHead>
                    <TableHead>품목명</TableHead>
                    <TableHead>단위</TableHead>
                    <TableHead className="text-right">단가</TableHead>
                    <TableHead>업체</TableHead>
                    <TableHead className="w-[100px]">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        등록된 단가 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((item, i) => (
                      <TableRow key={item.key} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                        <TableCell className="font-mono text-xs">{item.itemCode || "-"}</TableCell>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell>{item.unit || "-"}</TableCell>
                        <TableCell className="text-right tabular-nums">{item.unitPrice.toLocaleString()}원</TableCell>
                        <TableCell className="text-muted-foreground">{item.vendorName || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => void handleDelete(item)}
                            >
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
        </TabsContent>

        <TabsContent value="rules" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">생성 규칙 편집</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                거래명세서 생성 시 적용되는 할인·조건부 규칙은 추후 업데이트 예정입니다.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 단가 추가/편집 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "단가 수정" : "단가 추가"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>적용 업체</Label>
              <Select value={formVendorId} onValueChange={setFormVendorId}>
                <SelectTrigger>
                  <SelectValue placeholder="업체 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__common">공통 (모든 업체)</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>품목명 *</Label>
              <Input
                placeholder="품목명"
                value={formItemName}
                onChange={(e) => setFormItemName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>품목코드</Label>
              <Input
                placeholder="품목코드"
                value={formItemCode}
                onChange={(e) => setFormItemCode(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>단위</Label>
                <Input
                  placeholder="EA, M, KG..."
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>단가 *</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              취소
            </Button>
            <Button onClick={() => void handleSave()} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingItem ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── 유틸리티 ───

/** pricingTables 배열에서 특정 vendorId 테이블을 찾아 아이템 추가 (없으면 새 테이블 생성) */
function upsertToTable(tables: PricingTable[], vendorId: string, item: PricingItem) {
  const existing = tables.find((t) => t.vendorId === vendorId);
  if (existing) {
    existing.items.push(item);
  } else {
    tables.push({ vendorId, items: [item] });
  }
}
