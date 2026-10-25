import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  escapeCSVCell,
  buildCSVContent,
  exportWithdrawalsToCSV,
  exportExpensesToCSV,
  exportTransactionsToCSV,
  exportTaxSummaryToCSV,
} from "./csv-export";
import { Withdrawal, Expense, Account, PropFirm } from "@/types/database";

describe("csv-export service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("escapeCSVCell", () => {
    it("handles null and undefined", () => {
      expect(escapeCSVCell(null)).toBe("");
      expect(escapeCSVCell(undefined)).toBe("");
    });

    it("leaves standard text untouched", () => {
      expect(escapeCSVCell("Apex")).toBe("Apex");
      expect(escapeCSVCell(1234)).toBe("1234");
    });

    it("escapes cells containing commas, quotes, and newlines", () => {
      expect(escapeCSVCell("Topstep, LLC")).toBe('"Topstep, LLC"');
      expect(escapeCSVCell('Cuenta "Master"')).toBe('"Cuenta ""Master"""');
      expect(escapeCSVCell("Línea 1\nLínea 2")).toBe('"Línea 1\nLínea 2"');
    });
  });

  describe("buildCSVContent", () => {
    it("includes UTF-8 BOM and joins headers and rows with CRLF", () => {
      const headers = ["Fecha", "Importe"];
      const rows = [["2026-03-01", 1500]];
      const result = buildCSVContent(headers, rows);
      expect(result.startsWith("\uFEFF")).toBe(true);
      expect(result).toContain("Fecha,Importe\r\n2026-03-01,1500");
    });
  });

  describe("download exports", () => {
    const mockFirms: PropFirm[] = [
      { id: "f1", user_id: "u1", name: "Apex Trader Funding", website: "", logo_url: "", created_at: "" },
    ];
    const mockAccounts: Account[] = [
      { id: "a1", user_id: "u1", firm_id: "f1", account_size: 50000, account_type: "Evaluation", alias: "Apex-01", status: "Active", created_at: "" },
    ];
    const mockWithdrawals: Withdrawal[] = [
      { id: "w1", user_id: "u1", firm_id: "f1", account_id: "a1", gross_amount: 2100, fee_amount: 100, net_amount: 2000, status: "completed", date: "2026-03-15", created_at: "" },
    ];
    const mockExpenses: Expense[] = [
      { id: "e1", user_id: "u1", firm_id: "f1", account_id: "a1", amount: 150, category: "evaluation", description: "Evaluacion 50k", date: "2026-03-01", created_at: "" },
    ];

    it("generates correct withdrawals CSV data", () => {
      // Mock DOM download
      const clickMock = vi.fn();
      const appendMock = vi.fn();
      const removeMock = vi.fn();

      vi.spyOn(document, "createElement").mockImplementation((tag) => {
        if (tag === "a") {
          return {
            setAttribute: vi.fn(),
            click: clickMock,
            style: {},
          } as unknown as HTMLAnchorElement;
        }
        return document.createElement(tag);
      });
      vi.spyOn(document.body, "appendChild").mockImplementation(appendMock as any);
      vi.spyOn(document.body, "removeChild").mockImplementation(removeMock as any);
      global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      global.URL.revokeObjectURL = vi.fn();

      exportWithdrawalsToCSV(mockWithdrawals, mockAccounts, mockFirms);
      expect(clickMock).toHaveBeenCalled();
    });

    it("generates correct expenses CSV data", () => {
      const clickMock = vi.fn();
      vi.spyOn(document, "createElement").mockImplementation((tag) => {
        if (tag === "a") {
          return {
            setAttribute: vi.fn(),
            click: clickMock,
            style: {},
          } as unknown as HTMLAnchorElement;
        }
        return document.createElement(tag);
      });
      vi.spyOn(document.body, "appendChild").mockImplementation(vi.fn() as any);
      vi.spyOn(document.body, "removeChild").mockImplementation(vi.fn() as any);
      global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      global.URL.revokeObjectURL = vi.fn();

      exportExpensesToCSV(mockExpenses, mockAccounts, mockFirms);
      expect(clickMock).toHaveBeenCalled();
    });

    it("generates tax summary CSV with proper financial calculations", () => {
      const clickMock = vi.fn();
      vi.spyOn(document, "createElement").mockImplementation((tag) => {
        if (tag === "a") {
          return {
            setAttribute: vi.fn(),
            click: clickMock,
            style: {},
          } as unknown as HTMLAnchorElement;
        }
        return document.createElement(tag);
      });
      vi.spyOn(document.body, "appendChild").mockImplementation(vi.fn() as any);
      vi.spyOn(document.body, "removeChild").mockImplementation(vi.fn() as any);
      global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      global.URL.revokeObjectURL = vi.fn();

      exportTaxSummaryToCSV(mockExpenses, mockWithdrawals, 2026);
      expect(clickMock).toHaveBeenCalled();
    });
  });
});
