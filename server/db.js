import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const dataDir = process.env.NETLIFY
  ? path.resolve("/tmp", "cpcd-server-data")
  : path.resolve(process.cwd(), "server", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "admin.sqlite"));

function ensureTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      org TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_submissions (
      id TEXT PRIMARY KEY,
      submitter TEXT NOT NULL,
      org TEXT NOT NULL,
      status TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      reviewer TEXT,
      review_note TEXT,
      review_time TEXT,
      payload_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hub_submissions (
      id TEXT PRIMARY KEY,
      model_name TEXT NOT NULL,
      type TEXT NOT NULL,
      version TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      reviewer TEXT,
      review_note TEXT,
      review_time TEXT,
      summary TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS approved_products (
      id TEXT PRIMARY KEY,
      payload_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      module TEXT NOT NULL,
      action TEXT NOT NULL,
      operator TEXT NOT NULL,
      target TEXT NOT NULL,
      note TEXT NOT NULL,
      time TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS news_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT,
      published_at TEXT,
      link TEXT,
      content TEXT,
      updated_at TEXT NOT NULL
    );
  `);
}

function nowLabel() {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function seedIfEmpty() {
  const userCount = db.prepare("SELECT COUNT(*) AS count FROM admin_users").get().count;
  if (userCount > 0) return;

  const hash = bcrypt.hashSync("Admin@123456", 10);
  const insertUser = db.prepare(`
    INSERT INTO admin_users (id, name, email, password_hash, role, org, status, created_at)
    VALUES (@id, @name, @email, @password_hash, @role, @org, @status, @created_at)
  `);
  [
    { id: "U-1000", name: "系统管理员", email: "admin@cpcd.local", password_hash: hash, role: "admin", org: "CPCD 平台", status: "active", created_at: "2026-05-01" },
  ].forEach((u) => insertUser.run(u));
}

export function initDb() {
  ensureTables();
  cleanupLegacyDemoUsers();
  cleanupLegacyDemoRecords();
  seedIfEmpty();
}

function cleanupLegacyDemoUsers() {
  db.prepare(`
    DELETE FROM admin_users
    WHERE email IN ('lichen@demo.com', 'wangmin@demo.com', 'zhaohang@demo.com')
      OR id IN ('U-1001', 'U-1002', 'U-1003')
  `).run();
}

function cleanupLegacyDemoRecords() {
  db.prepare(`
    DELETE FROM product_submissions
    WHERE id IN ('PS-2026-001', 'PS-2026-002')
  `).run();
  db.prepare(`
    DELETE FROM hub_submissions
    WHERE id IN ('HS-2026-001', 'HS-2026-002')
  `).run();
  db.prepare(`
    DELETE FROM approved_products
    WHERE id IN ('P-NEW-2026-001', 'P-NEW-2026-002')
  `).run();
}

export function toAdminState() {
  const users = db.prepare("SELECT id, name, email, role, org, status, created_at as createdAt FROM admin_users ORDER BY created_at DESC").all();
  const products = db.prepare("SELECT * FROM product_submissions ORDER BY submitted_at DESC").all().map((row) => ({
    id: row.id,
    submitter: row.submitter,
    org: row.org,
    status: row.status,
    submittedAt: row.submitted_at,
    reviewer: row.reviewer || "",
    reviewNote: row.review_note || "",
    reviewTime: row.review_time || "",
    payload: JSON.parse(row.payload_json),
  }));
  const hubs = db.prepare("SELECT * FROM hub_submissions ORDER BY submitted_at DESC").all().map((row) => ({
    id: row.id,
    modelName: row.model_name,
    type: row.type,
    version: row.version,
    owner: row.owner,
    status: row.status,
    submittedAt: row.submitted_at,
    reviewer: row.reviewer || "",
    reviewNote: row.review_note || "",
    reviewTime: row.review_time || "",
    summary: row.summary,
  }));
  const approvedProducts = db.prepare("SELECT payload_json FROM approved_products").all().map((x) => JSON.parse(x.payload_json));
  const auditLogs = db.prepare("SELECT * FROM audit_logs ORDER BY time DESC").all();
  return { users, productSubmissions: products, hubSubmissions: hubs, approvedProducts, auditLogs };
}

export function setUserStatus(userId, status) {
  db.prepare("UPDATE admin_users SET status = ? WHERE id = ?").run(status, userId);
}

export function setUserRole(userId, role) {
  db.prepare("UPDATE admin_users SET role = ? WHERE id = ?").run(role, userId);
}

export function reviewProduct(submissionId, decision, reviewer, reviewNote) {
  const reviewTime = nowLabel();
  db.prepare("UPDATE product_submissions SET status = ?, reviewer = ?, review_note = ?, review_time = ? WHERE id = ?")
    .run(decision, reviewer, reviewNote, reviewTime, submissionId);
  const row = db.prepare("SELECT payload_json FROM product_submissions WHERE id = ?").get(submissionId);
  if (decision === "approved" && row) {
    const payload = JSON.parse(row.payload_json);
    db.prepare("INSERT OR REPLACE INTO approved_products (id, payload_json) VALUES (?, ?)").run(payload.id, JSON.stringify(payload));
  }
  addLog("产品库审核", decision === "approved" ? "审核通过" : "审核驳回", reviewer, submissionId, reviewNote, reviewTime);
}

export function reviewHub(submissionId, decision, reviewer, reviewNote) {
  const reviewTime = nowLabel();
  db.prepare("UPDATE hub_submissions SET status = ?, reviewer = ?, review_note = ?, review_time = ? WHERE id = ?")
    .run(decision, reviewer, reviewNote, reviewTime, submissionId);
  addLog("LCA-Hub 审核", decision === "approved" ? "审核通过" : "审核驳回", reviewer, submissionId, reviewNote, reviewTime);
}

export function validateUser(email, plainPassword) {
  const user = db.prepare("SELECT * FROM admin_users WHERE email = ?").get(email);
  if (!user) return null;
  const ok = bcrypt.compareSync(plainPassword, user.password_hash);
  if (!ok) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role, org: user.org, status: user.status };
}

export function registerUser({ name, email, password, org = "个人用户" }) {
  const existing = db.prepare("SELECT id FROM admin_users WHERE email = ?").get(email);
  if (existing) {
    return { ok: false, message: "email already exists" };
  }
  const id = `U-${Date.now().toString().slice(-8)}`;
  const hash = bcrypt.hashSync(password, 10);
  const createdAt = nowLabel().slice(0, 10);
  db.prepare(`
    INSERT INTO admin_users (id, name, email, password_hash, role, org, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, email, hash, "enterprise", org, "active", createdAt);
  return {
    ok: true,
    user: { id, name, email, role: "enterprise", org, status: "active" },
  };
}

export function getApprovedProducts() {
  return db.prepare("SELECT payload_json FROM approved_products").all().map((x) => JSON.parse(x.payload_json));
}

export function resetDemoData() {
  db.exec(`
    DELETE FROM admin_users;
    DELETE FROM product_submissions;
    DELETE FROM hub_submissions;
    DELETE FROM approved_products;
    DELETE FROM audit_logs;
  `);
  seedIfEmpty();
}

function addLog(module, action, operator, target, note, time) {
  db.prepare("INSERT INTO audit_logs (id, module, action, operator, target, note, time) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(`LOG-${Date.now()}`, module, action, operator, target, note, time);
}

export function listNewsItems() {
  return db.prepare("SELECT * FROM news_items ORDER BY published_at DESC, updated_at DESC").all();
}

export function upsertNewsItem(item) {
  const id = item.id || `NEWS-${Date.now()}`;
  const updatedAt = nowLabel();
  db.prepare(`
    INSERT INTO news_items (id, title, author, published_at, link, content, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title=excluded.title,
      author=excluded.author,
      published_at=excluded.published_at,
      link=excluded.link,
      content=excluded.content,
      updated_at=excluded.updated_at
  `).run(
    id,
    item.title || "",
    item.author || "",
    item.publishedAt || "",
    item.link || "",
    item.content || "",
    updatedAt
  );
  return id;
}

export function deleteNewsItem(id) {
  db.prepare("DELETE FROM news_items WHERE id = ?").run(id);
}

export function getNewsItem(id) {
  return db.prepare("SELECT * FROM news_items WHERE id = ?").get(id);
}
