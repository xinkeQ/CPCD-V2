const STORAGE_KEY = "cpcd_admin_state_v1";
const UPDATE_EVENT = "cpcd-admin-updated";

const seedState = {
  users: [],
  productSubmissions: [
    {
      id: "PS-2026-001",
      submitter: "李晨",
      org: "华东制造集团",
      status: "pending",
      submittedAt: "2026-05-20 10:26",
      reviewer: "",
      reviewNote: "",
      reviewTime: "",
      payload: {
        id: "P-NEW-2026-001",
        name: "高性能光伏逆变器",
        english: "High-efficiency PV Inverter",
        cat1: "金属制品、机械和设备",
        cat2: "电气设备",
        cat3: "发电与输配电设备",
        cat4: "光伏逆变器",
        footprint: "386.2 kgCO2e",
        quality: "4",
        unit: "kgCO2e",
        tech: "工艺模型",
        source: "企业数据",
        desc: "基于企业生产和供应链核算边界形成的产品碳足迹数据。",
        boundary: "摇篮到大门",
        region: "中国",
        year: "2025",
        stages: "生产:320; 运输:40; 包装:26.2",
        stagesUnit: "kgCO2e",
        note: "企业自主提交，待审核",
        process: "铝型材加工、PCB组装、总装测试",
        ref: "企业核算报告 2025",
        dataset: "全部数据",
      },
    },
    {
      id: "PS-2026-002",
      submitter: "王敏",
      org: "低碳研究院",
      status: "pending",
      submittedAt: "2026-05-21 09:12",
      reviewer: "",
      reviewNote: "",
      reviewTime: "",
      payload: {
        id: "P-NEW-2026-002",
        name: "生物基包装薄膜",
        english: "Bio-based Packaging Film",
        cat1: "农业、林业和水产品",
        cat2: "生物基材料",
        cat3: "包装材料",
        cat4: "可降解薄膜",
        footprint: "52.8 kgCO2e",
        quality: "5",
        unit: "kgCO2e",
        tech: "文献与实测融合",
        source: "文献数据",
        desc: "基于公开文献与实测样本加权估算得到。",
        boundary: "摇篮到坟墓",
        region: "中国",
        year: "2024",
        stages: "原料:18; 生产:20; 运输:5; 使用与处置:9.8",
        stagesUnit: "kgCO2e",
        note: "附论文 DOI",
        process: "发酵、聚合、吹膜",
        ref: "LCA Journal 2024",
        dataset: "涉外产品",
      },
    },
  ],
  hubSubmissions: [
    {
      id: "HS-2026-001",
      modelName: "steel-lca-open-model",
      type: "发布",
      version: "v0.9.0",
      owner: "CPCD 社区维护组",
      status: "pending",
      submittedAt: "2026-05-20 15:08",
      reviewer: "",
      reviewNote: "",
      reviewTime: "",
      summary: "新增钢铁流程清单并补充参数边界说明。",
    },
    {
      id: "HS-2026-002",
      modelName: "textile-factor-kit",
      type: "更新",
      version: "v1.2.3",
      owner: "纺织专项组",
      status: "pending",
      submittedAt: "2026-05-21 11:20",
      reviewer: "",
      reviewNote: "",
      reviewTime: "",
      summary: "修复蒸汽折算系数并更新 QA 文档。",
    },
  ],
  approvedProducts: [],
  auditLogs: [],
};

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function emitUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { at: Date.now() } }));
  }
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function nowLabel() {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function getAdminUpdateEventName() {
  return UPDATE_EVENT;
}

export function getAdminState() {
  if (!canUseStorage()) return cloneState(seedState);
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = cloneState(seedState);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    const cleaned = sanitizeLegacyState(parsed);
    if (JSON.stringify(cleaned) !== JSON.stringify(parsed)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    const seeded = cloneState(seedState);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function sanitizeLegacyState(state) {
  const bannedIds = new Set(["U-1001", "U-1002", "U-1003"]);
  const bannedEmails = new Set(["lichen@demo.com", "wangmin@demo.com", "zhaohang@demo.com"]);
  const next = { ...state };
  next.users = (state.users || []).filter((u) => !bannedIds.has(u.id) && !bannedEmails.has(u.email));
  return next;
}

export function saveAdminState(nextState) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  emitUpdate();
}

export function resetAdminState() {
  saveAdminState(cloneState(seedState));
}

export function setUserStatus(userId, status) {
  const state = getAdminState();
  const users = state.users.map((u) => (u.id === userId ? { ...u, status } : u));
  saveAdminState({ ...state, users });
}

export function reviewProductSubmission(submissionId, decision, reviewer, reviewNote) {
  const state = getAdminState();
  const reviewTime = nowLabel();
  const productSubmissions = state.productSubmissions.map((p) => {
    if (p.id !== submissionId) return p;
    return {
      ...p,
      status: decision,
      reviewer,
      reviewNote,
      reviewTime,
    };
  });

  const target = state.productSubmissions.find((p) => p.id === submissionId);
  const approvedProducts =
    decision === "approved" && target
      ? [...state.approvedProducts.filter((p) => p.id !== target.payload.id), target.payload]
      : state.approvedProducts;

  const auditLogs = [
    {
      id: `LOG-${Date.now()}`,
      module: "产品库审核",
      action: decision === "approved" ? "审核通过" : "审核驳回",
      operator: reviewer,
      target: submissionId,
      note: reviewNote,
      time: reviewTime,
    },
    ...state.auditLogs,
  ];

  saveAdminState({ ...state, productSubmissions, approvedProducts, auditLogs });
}

export function reviewHubSubmission(submissionId, decision, reviewer, reviewNote) {
  const state = getAdminState();
  const reviewTime = nowLabel();
  const hubSubmissions = state.hubSubmissions.map((item) => {
    if (item.id !== submissionId) return item;
    return {
      ...item,
      status: decision,
      reviewer,
      reviewNote,
      reviewTime,
    };
  });

  const auditLogs = [
    {
      id: `LOG-${Date.now()}`,
      module: "LCA-Hub 审核",
      action: decision === "approved" ? "审核通过" : "审核驳回",
      operator: reviewer,
      target: submissionId,
      note: reviewNote,
      time: reviewTime,
    },
    ...state.auditLogs,
  ];

  saveAdminState({ ...state, hubSubmissions, auditLogs });
}

export function getApprovedProductEntries() {
  return getAdminState().approvedProducts || [];
}
