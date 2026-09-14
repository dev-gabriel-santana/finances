import { describe, expect, it } from "vitest";

import { resolveAuthMode } from "./offlineMode";

describe("resolveAuthMode", () => {
  it("uses offline mode when no backend URL is configured", () => {
    expect(
      resolveAuthMode({
        apiBaseUrl: undefined,
        hasStoredRefreshToken: false,
        remoteError: null,
      }),
    ).toBe("offline");
  });

  it("uses offline mode when backend health check fails", () => {
    expect(
      resolveAuthMode({
        apiBaseUrl: "http://localhost:3000",
        hasStoredRefreshToken: false,
        remoteError: new Error("Network Error"),
      }),
    ).toBe("offline");
  });

  it("uses remote mode when backend is reachable", () => {
    expect(
      resolveAuthMode({
        apiBaseUrl: "http://localhost:3000",
        hasStoredRefreshToken: true,
        remoteError: null,
      }),
    ).toBe("remote");
  });
});
