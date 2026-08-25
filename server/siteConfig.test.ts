import { describe, expect, it, vi } from "vitest";
import { getSiteConfig } from "./siteConfig";

describe("site config", () => {
  it("exposes the configured app title through the lightweight config API", () => {
    vi.stubEnv("VITE_APP_TITLE", "谷口の背負い投げポテト｜受付管理");
    expect(getSiteConfig()).toEqual({ title: "谷口の背負い投げポテト｜受付管理" });
    vi.unstubAllEnvs();
  });
});
