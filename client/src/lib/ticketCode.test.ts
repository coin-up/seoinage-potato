import { describe, expect, it } from "vitest";
import { normalizeTicketCodeInput } from "./ticketCode";

describe("normalizeTicketCodeInput", () => {
  it("keeps only the first letter when one key emits several letters", () => {
    expect(normalizeTicketCodeInput("ABC")).toBe("A");
    expect(normalizeTicketCodeInput("ZZZ")).toBe("Z");
  });

  it("accepts a complete pasted ticket code", () => {
    expect(normalizeTicketCodeInput("a123")).toBe("A123");
    expect(normalizeTicketCodeInput(" A-123 ")).toBe("A123");
  });

  it("keeps the first letter and up to three digits from noisy keyboard output", () => {
    expect(normalizeTicketCodeInput("ABC123")).toBe("A123");
    expect(normalizeTicketCodeInput("A1B2C345")).toBe("A123");
  });

  it("does not allow a number-only or symbol-only value", () => {
    expect(normalizeTicketCodeInput("1234")).toBe("");
    expect(normalizeTicketCodeInput("!@#$")).toBe("");
  });
});
