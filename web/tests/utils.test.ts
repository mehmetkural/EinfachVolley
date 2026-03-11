import { describe, it, expect } from "vitest";
import { getAuthRedirectUrl } from "@/lib/auth-guard";

describe("getAuthRedirectUrl", () => {
  it("returns destination without returnTo", () => {
    expect(getAuthRedirectUrl("/sign-in")).toBe("/sign-in");
  });

  it("appends returnTo query param", () => {
    const url = getAuthRedirectUrl("/sign-in", "/dashboard");
    expect(url).toBe("/sign-in?returnTo=%2Fdashboard");
  });
});
