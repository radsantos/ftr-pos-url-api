export function resolveBackendUrl(): string {
  if (typeof window !== "undefined") {
    return "http://localhost:3000";
  }

  return "http://api:3000";
}

export const BACKEND = resolveBackendUrl();
export const SHORT_CODE_REGEX = /^[0-9A-Za-z_-]{1,64}$/;
