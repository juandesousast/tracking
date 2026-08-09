import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateContent = vi.fn();
vi.mock("@google/generative-ai", () => {
  class MockGoogleGenerativeAI {
    getGenerativeModel() {
      return {
        generateContent: mockGenerateContent,
      };
    }
  }

  return {
    SchemaType: {
      OBJECT: "OBJECT",
      NUMBER: "NUMBER",
      STRING: "STRING",
    },
    GoogleGenerativeAI: MockGoogleGenerativeAI,
  };
});

import { scanReceiptAction } from "./scan-receipt";
import { matchAccountFromScan } from "@/lib/match-account";
import { Account, PropFirm } from "@/types/database";

describe("scanReceiptAction", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    mockGenerateContent.mockReset();
  });

  it("should return error if no API key is defined or keys are empty strings", async () => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const res = await scanReceiptAction({ base64Data: "base64data", mimeType: "image/png" });
    expect(res.success).toBe(false);
    expect(res.error).toContain("Falta OPENROUTER_API_KEY");
  });

  it("should correctly trim and clean OPENROUTER_API_KEY with whitespace, line breaks or quotes", async () => {
    process.env.OPENROUTER_API_KEY = '  "sk-or-v1-testkey123" \n';
    delete process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const mockResponseData = {
      amount: 200.0,
      type: "expense",
      category: "Challenge Fee",
      firm_name: "FTMO",
      date: "2026-08-09",
      description: "Evaluation",
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockResponseData) } }],
      }),
    } as Response);

    const res = await scanReceiptAction({ base64Data: "data:image/png;base64,abc12345", mimeType: "image/png" });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer sk-or-v1-testkey123",
        }),
      })
    );
    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockResponseData);

    fetchSpy.mockRestore();
  });

  it("should extract receipt data successfully when API key is set", async () => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    process.env.GEMINI_API_KEY = "mock-test-key";

    const mockResponseData = {
      amount: 150.0,
      type: "expense",
      category: "Challenge Fee",
      firm_name: "FTMO",
      date: "2026-08-09",
      description: "100k Challenge Pass",
      account_number_candidate: "123456",
      alias_candidate: "Pass Phase 1",
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify(mockResponseData),
      },
    });

    const res = await scanReceiptAction({ base64Data: "data:image/png;base64,abc12345", mimeType: "image/png" });

    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockResponseData);
  });

  it("should fallback to NEXT_PUBLIC_GEMINI_API_KEY if GEMINI_API_KEY is not defined", async () => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    delete process.env.GEMINI_API_KEY;
    process.env.NEXT_PUBLIC_GEMINI_API_KEY = "AIzaSyFallbackKey98765";

    const mockResponseData = {
      amount: 50.0,
      type: "withdrawal",
      category: "Payout",
      firm_name: "Apex",
      date: "2026-08-09",
      description: "Profit withdrawal",
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify(mockResponseData),
      },
    });

    const res = await scanReceiptAction({ base64Data: "data:image/png;base64,abc12345", mimeType: "image/png" });

    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockResponseData);
  });

  it("should handle error gracefully when API fails", async () => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    process.env.GEMINI_API_KEY = "AIzaSyTestKey123456789";
    mockGenerateContent.mockRejectedValue(new Error("API rate limit exceeded"));

    const res = await scanReceiptAction({ base64Data: "abc12345", mimeType: "image/png" });

    expect(res.success).toBe(false);
    expect(res.error).toBe("API rate limit exceeded");
  });
});

describe("matchAccountFromScan", () => {
  const mockFirms: PropFirm[] = [
    { id: "firm-1", user_id: "u1", name: "FTMO", website: null, created_at: "" },
    { id: "firm-2", user_id: "u1", name: "Apex Trader", website: null, created_at: "" },
  ];

  const mockAccounts: Account[] = [
    {
      id: "acc-1",
      user_id: "u1",
      firm_id: "firm-1",
      account_size: 100000,
      account_type: "Evaluation",
      status: "Active",
      account_number: "1001",
      alias: "FTMO Main",
      created_at: "",
    },
    {
      id: "acc-2",
      user_id: "u1",
      firm_id: "firm-1",
      account_size: 50000,
      account_type: "Funded",
      status: "Active",
      account_number: "1002",
      alias: "FTMO Second",
      created_at: "",
    },
    {
      id: "acc-3",
      user_id: "u1",
      firm_id: "firm-1",
      account_size: 25000,
      account_type: "Evaluation",
      status: "Failed",
      account_number: "1003",
      alias: "FTMO Old",
      created_at: "",
    },
    {
      id: "acc-4",
      user_id: "u1",
      firm_id: "firm-2",
      account_size: 150000,
      account_type: "Funded",
      status: "Active",
      account_number: "2001",
      alias: "Apex Solo",
      created_at: "",
    },
  ];

  it("a) should match exact account by firm_id and account_number", () => {
    const result = matchAccountFromScan("FTMO", "1002", null, mockAccounts, mockFirms);
    expect(result.matchedFirmId).toBe("firm-1");
    expect(result.matchedAccountId).toBe("acc-2");
    expect(result.hasAmbiguity).toBe(false);
  });

  it("a) should match exact account by firm_id and alias", () => {
    const result = matchAccountFromScan("FTMO", null, "FTMO Main", mockAccounts, mockFirms);
    expect(result.matchedFirmId).toBe("firm-1");
    expect(result.matchedAccountId).toBe("acc-1");
    expect(result.hasAmbiguity).toBe(false);
  });

  it("c) should select the single active account if firm matches and exactly 1 active account exists", () => {
    const result = matchAccountFromScan("Apex Trader", null, null, mockAccounts, mockFirms);
    expect(result.matchedFirmId).toBe("firm-2");
    expect(result.matchedAccountId).toBe("acc-4");
    expect(result.hasAmbiguity).toBe(false);
    expect(result.candidateAccounts).toHaveLength(1);
  });

  it("d) should report ambiguity if firm matches and multiple active accounts exist without exact match", () => {
    const result = matchAccountFromScan("FTMO", null, null, mockAccounts, mockFirms);
    expect(result.matchedFirmId).toBe("firm-1");
    expect(result.matchedAccountId).toBeUndefined();
    expect(result.hasAmbiguity).toBe(true);
    expect(result.candidateAccounts).toHaveLength(2);
    expect(result.candidateAccounts.map((a) => a.id)).toEqual(["acc-1", "acc-2"]);
  });

  it("should handle unknown firm gracefully", () => {
    const result = matchAccountFromScan("NonExistentFirm", null, null, mockAccounts, mockFirms);
    expect(result.matchedFirmId).toBeUndefined();
    expect(result.matchedAccountId).toBeUndefined();
    expect(result.hasAmbiguity).toBe(false);
    expect(result.candidateAccounts).toHaveLength(0);
  });
});

