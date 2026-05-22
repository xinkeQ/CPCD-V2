import { withApiBase } from "./apiBase";
const TOKEN_KEY = "cpcd_admin_jwt";

function getToken() {
  return typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : "";
}

function setToken(token) {
  if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(withApiBase(path), { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function loginAdmin(email, password) {
  const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  setToken(data.token);
  return data.user;
}

export function logoutAdmin() {
  clearToken();
}

export async function fetchAdminState() {
  return api("/api/admin/state");
}

export async function updateUserStatus(userId, status) {
  return api(`/api/admin/users/${encodeURIComponent(userId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateUserRole(userId, role) {
  return api(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function reviewProductApi(id, decision, reviewNote) {
  return api(`/api/admin/products/${encodeURIComponent(id)}/review`, {
    method: "POST",
    body: JSON.stringify({ decision, reviewNote }),
  });
}

export async function reviewHubApi(id, decision, reviewNote) {
  return api(`/api/admin/hub/${encodeURIComponent(id)}/review`, {
    method: "POST",
    body: JSON.stringify({ decision, reviewNote }),
  });
}

export async function resetDemoApi() {
  return api("/api/admin/reset", { method: "POST" });
}

export async function fetchApprovedProductsApi() {
  const data = await api("/api/products/approved");
  return data.items || [];
}

export async function fetchAllProductsApi() {
  const data = await api("/api/products/all");
  return data.items || [];
}

export async function checkApiHealth() {
  try {
    const res = await fetch(withApiBase("/api/health"));
    if (!res.ok) return false;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return false;
    const data = await res.json().catch(() => null);
    return Boolean(data?.ok);
  } catch {
    return false;
  }
}

export async function fetchAdminNews() {
  const data = await api("/api/admin/news");
  return data.items || [];
}

export async function saveAdminNews(item) {
  return api("/api/admin/news", {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function deleteAdminNews(id) {
  return api(`/api/admin/news/${encodeURIComponent(id)}`, { method: "DELETE" });
}
