import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { FolderOpen, Eye, EyeOff, TestTube2, RotateCcw, Save, Key } from "lucide-react";
import { useElectron } from "@/hooks/use-electron";

interface AppSettings {
  defaultInputFolder: string;
  defaultOutputFolder: string;
  ocrApiKey: string;
  reduceMotion: boolean;
}

const defaultSettings: AppSettings = {
  defaultInputFolder: "",
  defaultOutputFolder: "",
  ocrApiKey: "",
  reduceMotion: false,
};

const emptyDb = { settings: {}, vendors: [], mappingRules: [], pricingTables: [] };
const browserFolderPrefix = "browser://";

function normalizeSettings(raw: unknown): AppSettings {
  const value = typeof raw === "object" && raw !== null ? (raw as Partial<AppSettings>) : {};
  return {
    defaultInputFolder:
      typeof value.defaultInputFolder === "string" ? value.defaultInputFolder : defaultSettings.defaultInputFolder,
    defaultOutputFolder:
      typeof value.defaultOutputFolder === "string"
        ? value.defaultOutputFolder
        : defaultSettings.defaultOutputFolder,
    ocrApiKey: typeof value.ocrApiKey === "string" ? value.ocrApiKey : defaultSettings.ocrApiKey,
    reduceMotion: typeof value.reduceMotion === "boolean" ? value.reduceMotion : defaultSettings.reduceMotion,
  };
}

export default function SettingsPage() {
  const { api, isElectron } = useElectron();
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const dbData = await api.dbRead();
        if (!mounted) return;
        setSettings(normalizeSettings(dbData?.settings));
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("설정을 불러오지 못했습니다.");
      }
    };

    void loadSettings();
    return () => {
      mounted = false;
    };
  }, [api]);

  useEffect(() => {
    if (settings.reduceMotion) {
      document.body.classList.add("reduce-motion");
    } else {
      document.body.classList.remove("reduce-motion");
    }
  }, [settings.reduceMotion]);

  const saveSettings = async (next: AppSettings, successMessage?: string) => {
    setIsSaving(true);
    try {
      const dbData = await api.dbRead();
      const safeDbData = typeof dbData === "object" && dbData !== null ? dbData : { ...emptyDb };
      safeDbData.settings = next;
      await api.dbWrite(safeDbData);
      setSettings(next);
      if (successMessage) {
        toast.success(successMessage);
      }
      return true;
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("설정 저장에 실패했습니다.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectFolder = async (target: "input" | "output") => {
    try {
      const currentPath = target === "input" ? settings.defaultInputFolder : settings.defaultOutputFolder;
      const selected = await api.selectFolder(currentPath);
      if (!selected) return;

      setSettings((prev) =>
        target === "input"
          ? { ...prev, defaultInputFolder: selected }
          : { ...prev, defaultOutputFolder: selected }
      );

      if (!isElectron && selected.startsWith(browserFolderPrefix)) {
        toast.success("브라우저 폴더가 선택되었습니다.");
      }
    } catch (error: any) {
      console.error("Failed to select folder:", error);
      toast.error("폴더 선택에 실패했습니다.", {
        description: error?.message || String(error),
      });
    }
  };

  const handleSavePaths = async () => {
    await saveSettings(settings, "경로 설정이 저장되었습니다.");
  };

  const handleSaveApiKey = async () => {
    if (!settings.ocrApiKey.trim()) {
      toast.error("Google API Key를 입력해 주세요.");
      return;
    }
    await saveSettings(settings, "API 설정이 저장되었습니다.");
  };

  const handleTestConnection = async () => {
    if (!settings.ocrApiKey.trim()) {
      toast.error("Google API Key를 입력해 주세요.");
      return;
    }

    setIsTesting(true);
    try {
      await api.testGoogleApi(settings.ocrApiKey.trim());
      toast.success("Google API 연결 테스트에 성공했습니다.");
    } catch (error: any) {
      console.error("Google API test failed:", error);
      toast.error("Google API 연결 테스트에 실패했습니다.", {
        description: error?.message || String(error),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReduceMotionChange = async (checked: boolean) => {
    const previous = settings;
    const next = { ...settings, reduceMotion: checked };
    setSettings(next);

    const ok = await saveSettings(next);
    if (!ok) {
      setSettings(previous);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const ok = await saveSettings(defaultSettings, "모든 설정을 초기화했습니다.");
      if (ok) {
        setShowApiKey(false);
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">기본 경로</CardTitle>
          <CardDescription>입력/출력 기본 경로를 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isElectron && (
            <p className="text-xs text-muted-foreground">
              브라우저에서는 보안 정책상 절대 경로 대신 `browser://...` 형식의 폴더 식별자가 저장됩니다.
            </p>
          )}
          <div className="space-y-2">
            <Label>기본 입력 폴더</Label>
            <div className="flex gap-2">
              <Input
                value={settings.defaultInputFolder}
                onChange={(e) => setSettings((prev) => ({ ...prev, defaultInputFolder: e.target.value }))}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => void handleSelectFolder("input")}
                aria-label="기본 입력 폴더 선택"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>기본 출력 폴더</Label>
            <div className="flex gap-2">
              <Input
                value={settings.defaultOutputFolder}
                onChange={(e) => setSettings((prev) => ({ ...prev, defaultOutputFolder: e.target.value }))}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => void handleSelectFolder("output")}
                aria-label="기본 출력 폴더 선택"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button className="gap-2" onClick={() => void handleSavePaths()} disabled={isSaving}>
            <Save className="h-4 w-4" />
            경로 저장
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="w-4 h-4" />
            API 설정
          </CardTitle>
          <CardDescription>Gemini/OCR에 사용할 Google API Key를 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Google API Key</Label>
            <div className="flex gap-2">
              <Input
                type={showApiKey ? "text" : "password"}
                value={settings.ocrApiKey}
                onChange={(e) => setSettings((prev) => ({ ...prev, ocrApiKey: e.target.value }))}
                className="flex-1 font-mono"
                placeholder="AIzaSy..."
              />
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => setShowApiKey((prev) => !prev)}
                aria-label={showApiKey ? "API Key 숨기기" : "API Key 보기"}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => void handleTestConnection()} disabled={isTesting}>
              <TestTube2 className="h-4 w-4" />
              {isTesting ? "테스트 중..." : "연결 테스트"}
            </Button>
            <Button className="gap-2" onClick={() => void handleSaveApiKey()} disabled={isSaving}>
              <Save className="h-4 w-4" />
              저장
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">접근성</CardTitle>
          <CardDescription>사용 편의 옵션을 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">모션 최소화</p>
              <p className="text-xs text-muted-foreground">애니메이션과 전환 효과를 줄입니다.</p>
            </div>
            <Switch checked={settings.reduceMotion} onCheckedChange={(checked) => void handleReduceMotionChange(checked)} />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-base text-destructive">위험 영역</CardTitle>
          <CardDescription>아래 작업은 되돌릴 수 없습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2" disabled={isResetting}>
                <RotateCcw className="h-4 w-4" />
                모든 설정 초기화
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>설정을 초기화할까요?</AlertDialogTitle>
                <AlertDialogDescription>
                  기본 경로, API Key, 접근성 옵션이 기본값으로 초기화됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => void handleReset()}
                >
                  초기화
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
