import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import {
  PlayCircle,
  Building2,
  Wand2,
  Calculator,
  FileBarChart,
  Settings,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pages = [
  { title: "일괄 처리", url: "/", icon: PlayCircle },
  { title: "업체 관리", url: "/vendors", icon: Building2 },
  { title: "매핑 마법사", url: "/mapping", icon: Wand2 },
  { title: "단가·규칙", url: "/pricing", icon: Calculator },
  { title: "로그·리포트", url: "/logs", icon: FileBarChart },
  { title: "설정", url: "/settings", icon: Settings },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  const handleSelect = (url: string) => {
    navigate(url);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="메뉴, 업체, 품목 검색..." />
      <CommandList>
        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
        <CommandGroup heading="페이지">
          {pages.map((page) => (
            <CommandItem
              key={page.url}
              onSelect={() => handleSelect(page.url)}
            >
              <page.icon className="mr-2 h-4 w-4" />
              <span>{page.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
