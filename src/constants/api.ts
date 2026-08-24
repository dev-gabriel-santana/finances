// Reads the public env var set in .env.local or EAS environment
export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ?? 'http://localhost:3000';
