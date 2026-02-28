import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useState } from "react";
import { useElectron } from "@/hooks/use-electron";

function HookHarness({ onRender }: { onRender: (apiRef: unknown) => void }) {
  const { api } = useElectron();
  const [tick, setTick] = useState(0);

  onRender(api);

  return (
    <button type="button" data-testid="rerender-trigger" onClick={() => setTick((prev) => prev + 1)}>
      {tick}
    </button>
  );
}

describe("useElectron", () => {
  it("keeps fallback api reference stable across rerenders in browser mode", () => {
    const extendedWindow = window as Window & { electronAPI?: unknown };
    const originalElectronApi = extendedWindow.electronAPI;
    delete extendedWindow.electronAPI;

    try {
      const capturedRefs: unknown[] = [];

      render(<HookHarness onRender={(apiRef) => capturedRefs.push(apiRef)} />);
      fireEvent.click(screen.getByTestId("rerender-trigger"));
      fireEvent.click(screen.getByTestId("rerender-trigger"));

      expect(capturedRefs.length).toBeGreaterThan(1);
      expect(new Set(capturedRefs).size).toBe(1);
    } finally {
      if (originalElectronApi === undefined) {
        delete extendedWindow.electronAPI;
      } else {
        extendedWindow.electronAPI = originalElectronApi;
      }
    }
  });
});
