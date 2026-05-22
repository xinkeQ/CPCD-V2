const rawBase = (import.meta.env.VITE_API_BASE_URL || "").trim();
const normalizedBase = rawBase ? rawBase.replace(/\/+$/, "") : "";

export function withApiBase(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (!normalizedBase) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

