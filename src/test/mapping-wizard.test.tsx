import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MappingWizardPage from "@/pages/MappingWizard";

describe("MappingWizardPage", () => {
  it("moves from step 1 to step 2 without render-loop errors", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      render(<MappingWizardPage />);

      const file = new File(["dummy"], "real-order.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      fireEvent.drop(screen.getByTestId("mapping-upload-dropzone"), {
        dataTransfer: { files: [file] },
      });
      fireEvent.click(screen.getByTestId("mapping-next-button"));

      expect(screen.getByRole("table")).toBeInTheDocument();

      const hasDepthError = consoleErrorSpy.mock.calls.some((args) =>
        args.some((arg) => String(arg).includes("Maximum update depth exceeded")),
      );
      expect(hasDepthError).toBe(false);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
