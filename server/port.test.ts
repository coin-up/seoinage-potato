import { describe, expect, it } from "vitest";
import { getPreferredPort, shouldProbeForPort } from "./_core/port";

describe("server port selection", () => {
  it("uses Render's valid PORT without probing", () => {
    expect(getPreferredPort("10000")).toBe(10000);
    expect(shouldProbeForPort("10000")).toBe(false);
  });

  it("falls back to local development defaults for missing or invalid PORT", () => {
    expect(getPreferredPort(undefined)).toBe(3000);
    expect(getPreferredPort("not-a-port")).toBe(3000);
    expect(getPreferredPort("70000")).toBe(3000);
    expect(shouldProbeForPort(undefined)).toBe(true);
  });
});
