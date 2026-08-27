export function getPreferredPort(rawPort: string | undefined, fallback = 3000) {
  const parsed = Number.parseInt(rawPort ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65535 ? parsed : fallback;
}

export function shouldProbeForPort(rawPort: string | undefined) {
  return !rawPort;
}
