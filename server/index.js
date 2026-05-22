import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import {
  deleteNewsItem,
  getNewsItem,
  getApprovedProducts,
  initDb,
  listNewsItems,
  registerUser,
  resetDemoData,
  reviewHub,
  reviewProduct,
  setUserRole,
  setUserStatus,
  toAdminState,
  upsertNewsItem,
  validateUser,
} from "./db.js";

const app = express();
const port = process.env.PORT || 8787;
const jwtSecret = process.env.ADMIN_JWT_SECRET || "cpcd-dev-secret";
const deepseekApiKey = process.env.DEEPSEEK_API_KEY || "";
const deepseekBaseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const deepseekModel = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";
const deepseekFallbackModel = process.env.DEEPSEEK_FALLBACK_MODEL || "deepseek-chat";

initDb();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.post("/api/ai/generate-chain", async (req, res) => {
  const { productName = "", enterpriseName = "", modelNumber = "" } = req.body || {};
  const product = String(productName).trim();
  if (!product) {
    return res.status(400).json({ message: "productName is required" });
  }
  if (!deepseekApiKey) {
    return res.status(500).json({ message: "DEEPSEEK_API_KEY is not configured on server" });
  }

  const systemPrompt = [
    "你是产品全生命周期碳排放建模助手。",
    "请仅输出 JSON，不要输出任何解释文字或 markdown。",
    'JSON 格式为 {"nodes":[...],"links":[...]}。',
    'nodes: 每项包含 id,name,stage,carbon,isCore,producer,productName,modelNumber。',
    'links: 每项包含 from,to,type。',
    `stage 只能从以下枚举中选择：${["原材料获取", "材料与零部件生产", "产品制造", "运输分销", "使用阶段", "回收处置"].join("、")}。`,
    "id 形如 N1、N2...，links 中 from/to 必须引用 nodes 的 id。",
    "carbon 为 0-100 的数字。",
    "请生成 8-20 个节点，结构要合理并尽量成链路。",
  ].join("\n");

  const userPrompt = [
    `企业名称：${enterpriseName || "未提供"}`,
    `产品名称：${product}`,
    `型号：${modelNumber || "未提供"}`,
    "请据此生成生命周期碳链模型。",
  ].join("\n");

  try {
    const firstRaw = await callDeepseek({
      model: deepseekModel,
      temperature: 0.3,
      max_tokens: 1800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    let parsed = parseJsonFromModel(firstRaw);
    if (!Array.isArray(parsed?.nodes) || !Array.isArray(parsed?.links)) {
      const repairPrompt = [
        "请把下面内容整理为有效 JSON。",
        "仅输出 JSON，不要任何解释。",
        '格式固定为 {"nodes":[...],"links":[...]}，其中 nodes 字段必须包含 id,name,stage,carbon,isCore,producer,productName,modelNumber，links 包含 from,to,type。',
        "如果原文没有给出完整结构，请你自行补全一个合理的 8-20 节点生命周期链路。",
        "",
        "原始内容：",
        firstRaw,
      ].join("\n");
      const repairedRaw = await callDeepseek({
        model: deepseekModel,
        temperature: 0.1,
        max_tokens: 1800,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: repairPrompt }],
      });
      parsed = parseJsonFromModel(repairedRaw);
    }

    if (!Array.isArray(parsed?.nodes) || !Array.isArray(parsed?.links)) {
      const fallbackPrompt = [
        "Return only a valid JSON object.",
        'Schema: {"nodes":[...],"links":[...]}',
        "Node fields: id,name,stage,carbon,isCore,producer,productName,modelNumber",
        "Link fields: from,to,type",
        "Allowed stage values: 原材料获取, 材料与零部件生产, 产品制造, 运输分销, 使用阶段, 回收处置",
        "Generate 8-20 nodes and connected links for lifecycle carbon chain.",
        `enterprise=${enterpriseName || ""}, product=${product}, model=${modelNumber || ""}`,
      ].join("\n");
      const fallbackRaw = await callDeepseek({
        model: deepseekFallbackModel,
        temperature: 0.2,
        max_tokens: 1800,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: fallbackPrompt }],
      });
      parsed = parseJsonFromModel(fallbackRaw);
    }

    const normalized = normalizeGeneratedChain(parsed, { enterpriseName, productName: product, modelNumber });
    if (!normalized.nodes.length || !normalized.links.length) {
      return res.status(422).json({ message: "model output invalid", raw: String(firstRaw).slice(0, 600) });
    }
    return res.json({ ok: true, source: "deepseek", data: normalized });
  } catch (e) {
    return res.status(500).json({ message: "failed to generate chain", error: String(e) });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }
  const user = validateUser(email, password);
  if (!user) return res.status(401).json({ message: "invalid credentials" });
  if (user.status === "disabled") return res.status(403).json({ message: "account disabled" });
  const token = jwt.sign({ sub: user.id, role: user.role, name: user.name }, jwtSecret, { expiresIn: "12h" });
  return res.json({ token, user });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, org } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email and password are required" });
  }
  if (!email.includes("@")) {
    return res.status(400).json({ message: "invalid email" });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: "password must be at least 6 characters" });
  }
  const result = registerUser({ name, email, password, org: org || "个人用户" });
  if (!result.ok) {
    return res.status(409).json({ message: result.message });
  }
  const token = jwt.sign({ sub: result.user.id, role: result.user.role, name: result.user.name }, jwtSecret, { expiresIn: "12h" });
  return res.json({ token, user: result.user });
});

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "missing token" });
  try {
    req.auth = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: "invalid token" });
  }
}

app.get("/api/admin/state", auth, (_req, res) => {
  res.json(toAdminState());
});

app.patch("/api/admin/users/:id/status", auth, (req, res) => {
  const { status } = req.body || {};
  if (!["active", "disabled"].includes(status)) return res.status(400).json({ message: "invalid status" });
  setUserStatus(req.params.id, status);
  res.json({ ok: true });
});

app.patch("/api/admin/users/:id/role", auth, (req, res) => {
  const { role } = req.body || {};
  if (!["admin", "reviewer", "enterprise", "research"].includes(role)) {
    return res.status(400).json({ message: "invalid role" });
  }
  setUserRole(req.params.id, role);
  res.json({ ok: true });
});

app.post("/api/admin/products/:id/review", auth, (req, res) => {
  const { decision, reviewNote = "" } = req.body || {};
  if (!["approved", "rejected"].includes(decision)) return res.status(400).json({ message: "invalid decision" });
  reviewProduct(req.params.id, decision, req.auth?.name || "审核员", reviewNote);
  res.json({ ok: true });
});

app.post("/api/admin/hub/:id/review", auth, (req, res) => {
  const { decision, reviewNote = "" } = req.body || {};
  if (!["approved", "rejected"].includes(decision)) return res.status(400).json({ message: "invalid decision" });
  reviewHub(req.params.id, decision, req.auth?.name || "审核员", reviewNote);
  res.json({ ok: true });
});

app.post("/api/admin/reset", auth, (_req, res) => {
  resetDemoData();
  res.json({ ok: true });
});

app.get("/api/products/approved", (_req, res) => {
  res.json({ items: getApprovedProducts() });
});

app.get("/api/products/all", (_req, res) => {
  const basePath = path.resolve(process.cwd(), "public", "cpcd-data.json");
  let baseProducts = [];
  try {
    const raw = fs.readFileSync(basePath, "utf8");
    baseProducts = JSON.parse(raw);
  } catch {
    baseProducts = [];
  }
  const approved = getApprovedProducts();
  const approvedMap = new Map(approved.map((item) => [item.id, item]));
  const seen = new Set();
  const merged = baseProducts.map((item) => {
    if (approvedMap.has(item.id)) {
      seen.add(item.id);
      return approvedMap.get(item.id);
    }
    return item;
  });
  approved.forEach((item) => {
    if (!seen.has(item.id) && !baseProducts.some((base) => base.id === item.id)) {
      merged.push(item);
    }
  });
  res.json({ items: merged });
});

app.get("/api/news/realtime", async (_req, res) => {
  if (!listNewsItems().some((x) => x.id.startsWith("EXT-"))) {
    await importRealtimeNewsOnce().catch(() => {});
  }
  const items = listNewsItems()
    .filter((x) => x.id.startsWith("EXT-"))
    .map((x) => ({
      id: x.id,
      title: x.title,
      author: x.author || "",
      date: x.published_at || "",
      href: x.link || "",
      desc: x.author ? `作者：${x.author}` : "CityGHG 新闻资讯",
    }));
  res.json({ items });
});

async function fetchRealtimeNews() {
  const resp = await fetch("https://lca.cityghg.com/pages/articles/news");
  const html = await resp.text();
  const $ = cheerio.load(html);
  const items = [];
  $(".post-preview").each((_, el) => {
    const anchor = $(el).find("a[href*='/pages/article-view/']").first();
    const hrefRaw = anchor.attr("href") || "";
    if (!hrefRaw) return;
    const href = hrefRaw.startsWith("http") ? hrefRaw : `https://lca.cityghg.com${hrefRaw}`;
    const title = $(el).find(".post-title").text().replace(/\s+/g, " ").trim();
    const meta = $(el).find(".post-meta").text().replace(/\s+/g, " ").trim();
    const dateMatch = meta.match(/时间[:：]\s*([0-9]{4}\.[0-9]{2}\.[0-9]{2}\s+[0-9:]{8})/);
    const publishedAt = dateMatch ? dateMatch[1] : "";
    const authorMatch = meta.match(/作者[:：]\s*([^|]+)/);
    const author = authorMatch ? authorMatch[1].trim() : "";
    const idMatch = href.match(/\/pages\/article-view\/(\d+)/);
    const id = idMatch ? `EXT-${idMatch[1]}` : `EXT-${Date.now()}`;
    if (!title) return;
    items.push({ id, title, author, publishedAt, link: href, content: "", source: "realtime" });
  });
  return items;
}

app.get("/api/news/all", async (_req, res) => {
  try {
    if (!listNewsItems().some((x) => x.id.startsWith("EXT-"))) {
      await importRealtimeNewsOnce().catch(() => {});
    }
    const items = listNewsItems().map((x) => ({
      id: x.id,
      title: x.title,
      author: x.author || "",
      publishedAt: x.published_at || "",
      link: x.link || "",
      content: x.content || "",
      source: x.id.startsWith("EXT-") ? "realtime" : "manual",
    }));
    res.json({ items });
  } catch (e) {
    res.status(500).json({ message: "failed to load news", error: String(e) });
  }
});

app.get("/api/news/item/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const row = getNewsItem(id);
    if (!row) return res.status(404).json({ message: "news not found" });
    return res.json({
      id: row.id,
      title: row.title,
      author: row.author || "",
      publishedAt: row.published_at || "",
      link: row.link || "",
      content: row.content || "",
      source: "manual",
    });
  } catch (e) {
    res.status(500).json({ message: "failed to load news detail", error: String(e) });
  }
});

app.get("/api/admin/news", auth, (_req, res) => {
  const items = listNewsItems().map((x) => ({
    id: x.id,
    title: x.title,
    author: x.author || "",
    publishedAt: x.published_at || "",
    link: x.link || "",
    content: x.content || "",
    source: x.id.startsWith("EXT-") ? "realtime" : "manual",
  }));
  res.json({ items });
});

app.post("/api/admin/news", auth, (req, res) => {
  const { id, title, author, publishedAt, link, content } = req.body || {};
  if (!title) return res.status(400).json({ message: "title is required" });
  const newsId = upsertNewsItem({ id, title, author, publishedAt, link, content });
  res.json({ ok: true, id: newsId });
});

app.delete("/api/admin/news/:id", auth, (req, res) => {
  deleteNewsItem(req.params.id);
  res.json({ ok: true });
});

if (!process.env.NETLIFY) {
  app.listen(port, () => {
    console.log(`CPCD admin API running on http://localhost:${port}`);
  });
}

async function importRealtimeNewsOnce() {
  const exists = listNewsItems().some((x) => x.id.startsWith("EXT-"));
  if (exists) return;
  const realtime = await fetchRealtimeNews().catch(() => []);
  for (const item of realtime) {
    upsertNewsItem({
      id: item.id,
      title: item.title,
      author: item.author,
      publishedAt: item.publishedAt,
      link: item.link,
      content: "",
    });
  }
}

importRealtimeNewsOnce().catch(() => {});

function parseJsonFromModel(text) {
  if (!text) return {};
  const trimmed = String(text).trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) {
      try {
        return JSON.parse(fenced[1]);
      } catch {
      }
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
      }
    }
    return {};
  }
}

async function callDeepseek(payload) {
  const aiResp = await fetch(`${deepseekBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${deepseekApiKey}`,
    },
    body: JSON.stringify(payload),
  });
  if (!aiResp.ok) {
    const errText = await aiResp.text().catch(() => "");
    throw new Error(`deepseek request failed (${aiResp.status}): ${errText.slice(0, 300)}`);
  }
  const aiData = await aiResp.json();
  const message = aiData?.choices?.[0]?.message || {};
  return String(message?.content || message?.reasoning_content || "");
}

function normalizeGeneratedChain(raw, context) {
  const validStages = new Set(["原材料获取", "材料与零部件生产", "产品制造", "运输分销", "使用阶段", "回收处置"]);
  const nodesInput = Array.isArray(raw?.nodes) ? raw.nodes : [];
  const linksInput = Array.isArray(raw?.links) ? raw.links : [];
  const nodes = [];
  const idMap = new Set();

  nodesInput.forEach((node, index) => {
    const id = String(node?.id || `N${index + 1}`).trim();
    const name = String(node?.name || "").trim();
    const stage = validStages.has(node?.stage) ? node.stage : "产品制造";
    const carbonNum = Number(node?.carbon);
    const carbon = Number.isFinite(carbonNum) ? Math.max(0, Math.min(100, carbonNum)) : 50;
    if (!id || !name || idMap.has(id)) return;
    idMap.add(id);
    nodes.push({
      id,
      name,
      stage,
      carbon,
      isCore: Boolean(node?.isCore),
      producer: String(node?.producer || context.enterpriseName || "").trim(),
      productName: String(node?.productName || context.productName || "").trim(),
      modelNumber: String(node?.modelNumber || context.modelNumber || "").trim(),
    });
  });

  const links = [];
  linksInput.forEach((link) => {
    const from = String(link?.from || "").trim();
    const to = String(link?.to || "").trim();
    if (!from || !to || from === to) return;
    if (!idMap.has(from) || !idMap.has(to)) return;
    links.push({
      from,
      to,
      type: String(link?.type || "碳流向").trim() || "碳流向",
    });
  });

  return { nodes, links };
}

export default app;
