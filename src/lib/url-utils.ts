const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export function isAllowedUrl(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;

  try {
    const url = new URL(trimmed);
    return ALLOWED_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}
