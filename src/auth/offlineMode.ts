export type AuthMode = "offline" | "remote";

export interface ResolveAuthModeInput {
  apiBaseUrl?: string;
  hasStoredRefreshToken: boolean;
  remoteError: Error | null;
}

export function resolveAuthMode({
  apiBaseUrl,
  hasStoredRefreshToken,
  remoteError,
}: ResolveAuthModeInput): AuthMode {
  if (!apiBaseUrl) {
    return "offline";
  }

  if (remoteError) {
    return "offline";
  }

  if (!hasStoredRefreshToken) {
    return "offline";
  }

  return "remote";
}
