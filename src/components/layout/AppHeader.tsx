import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onOpenSearch?: () => void;
}

export function AppHeader({ onOpenSearch }: AppHeaderProps) {
  return (
    <header className="h-14 flex items-center border-b bg-card px-4 gap-3 shrink-0">
      <SidebarTrigger />
      <h1 className="text-base font-semibold text-foreground whitespace-nowrap">
        거래명세서 자동 생성
      </h1>
      <div className="flex-1" />
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={onOpenSearch}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">검색</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </Button>
    </header>
  );
}
