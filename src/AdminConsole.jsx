import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  GitPullRequest,
  History,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  LogOut,
  RefreshCw,
  FileText,
} from "lucide-react";
import {
  checkApiHealth,
  fetchAdminState,
  fetchAdminNews,
  loginAdmin,
  logoutAdmin,
  reviewHubApi,
  reviewProductApi,
  saveAdminNews,
  deleteAdminNews,
  updateUserRole,
  updateUserStatus,
} from "./data/adminApi";
import {
  getAdminState,
  reviewHubSubmission,
  reviewProductSubmission,
  setUserStatus,
} from "./data/adminStore";

const adminMenus = [
  { key: "dashboard", label: "概览", icon: LayoutDashboard },
  { key: "users", label: "注册用户", icon: Users },
  { key: "news", label: "新闻资讯", icon: FileText },
  { key: "products", label: "产品库审核", icon: ClipboardCheck },
  { key: "hub", label: "LCA-Hub 审核", icon: GitPullRequest },
  { key: "audit", label: "审核日志", icon: History },
];

const roleLabel = {
  admin: "管理员",
  reviewer: "审核员",
  enterprise: "企业用户",
  research: "研究机构",
};

function StatusPill({ status }) {
  const map = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rejected: "bg-rose-50 text-rose-700 ring-rose-200",
    active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    disabled: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  const text = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已驳回",
    active: "已激活",
    disabled: "已禁用",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs ring-1 ${map[status] || map.pending}`}>{text[status] || status}</span>;
}

function Card({ title, value, desc }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
      <div className="mt-2 text-xs text-slate-500">{desc}</div>
    </div>
  );
}

function LoginPanel({ onLogin }) {
  const [email, setEmail] = useState("admin@cpcd.local");
  const [password, setPassword] = useState("Admin@123456");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">CPCD 后台登录</h1>
        <div className="mt-4 space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="邮箱" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="密码" />
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const user = await loginAdmin(email, password);
                onLogin(user);
              } catch (e) {
                setError(e.message || "登录失败");
              } finally {
                setBusy(false);
              }
            }}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            {busy ? "登录中..." : "登录"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminConsole() {
  const [active, setActive] = useState("dashboard");
  const [state, setState] = useState(getAdminState());
  const [apiMode, setApiMode] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [newsForm, setNewsForm] = useState({ id: "", title: "", author: "", publishedAt: "", link: "", content: "" });

  const pendingProducts = useMemo(() => state.productSubmissions.filter((x) => x.status === "pending"), [state]);
  const pendingHub = useMemo(() => state.hubSubmissions.filter((x) => x.status === "pending"), [state]);

  const refresh = async () => {
    if (apiMode && authed) {
      const data = await fetchAdminState();
      setState(data);
      const news = await fetchAdminNews().catch(() => []);
      setNewsItems(news);
    } else {
      setState(getAdminState());
    }
  };

  useEffect(() => {
    (async () => {
      const online = await checkApiHealth();
      setApiMode(online);
    })();
  }, []);

  useEffect(() => {
    if (!(apiMode && authed)) return;
    const timer = window.setInterval(() => {
      refresh().catch(() => {});
    }, 5000);
    return () => window.clearInterval(timer);
  }, [apiMode, authed]);

  const decideProduct = async (id, decision) => {
    setBusy(true);
    try {
      if (apiMode && authed) {
        await reviewProductApi(id, decision, decision === "approved" ? "字段完整，审核通过" : "请补充边界与参考来源");
      } else {
        reviewProductSubmission(id, decision, "本地审核员", decision === "approved" ? "字段完整，审核通过" : "请补充边界与参考来源");
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const decideHub = async (id, decision) => {
    setBusy(true);
    try {
      if (apiMode && authed) {
        await reviewHubApi(id, decision, decision === "approved" ? "模型描述与变更记录完整" : "请补充测试说明与变更详情");
      } else {
        reviewHubSubmission(id, decision, "本地审核员", decision === "approved" ? "模型描述与变更记录完整" : "请补充测试说明与变更详情");
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  if (apiMode && !authed) return <LoginPanel onLogin={async () => { setAuthed(true); await refresh(); }} />;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[270px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-950 p-5 text-slate-200">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs tracking-wider text-emerald-300">CPCD ADMIN</div>
            <div className="mt-1 text-lg font-semibold text-white">后台管理中心</div>
            <p className="mt-2 text-xs leading-5 text-slate-400">{apiMode ? "已连接真实后端 API（JWT + SQLite）。" : "当前为离线演示模式（未检测到后端 API）。"}</p>
          </div>
          <nav className="mt-5 space-y-1">
            {adminMenus.map((m) => {
              const Icon = m.icon;
              const isActive = active === m.key;
              return <button key={m.key} onClick={() => setActive(m.key)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${isActive ? "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30" : "text-slate-300 hover:bg-white/5"}`}><Icon size={16} />{m.label}</button>;
            })}
          </nav>
        </aside>

        <main className="p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">运营后台</h1>
              <p className="mt-1 text-sm text-slate-500">当前展示真实注册用户；可管理用户权限角色与状态，并与前台保持同步。</p>
            </div>
            <div className="flex items-center gap-2">
              <a href="/" className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">返回前台</a>
              <button
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await refresh();
                  } finally {
                    setBusy(false);
                  }
                }}
                className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={14} /> 刷新
              </button>
              {apiMode && authed && <button onClick={() => { logoutAdmin(); setAuthed(false); }} className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200"><LogOut size={14} />退出</button>}
            </div>
          </div>

          {active === "dashboard" && (
            <section className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card title="注册用户" value={state.users.length} desc="用户与审核角色总数" />
                <Card title="产品待审" value={pendingProducts.length} desc="待处理产品库条目" />
                <Card title="Hub 待审" value={pendingHub.length} desc="待处理发布/更新请求" />
                <Card title="已入前台产品库" value={state.approvedProducts.length} desc="审核通过后自动同步" />
              </div>
            </section>
          )}

          {active === "users" && (
            <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">注册用户管理</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="py-2">用户ID</th>
                      <th className="py-2">姓名</th>
                      <th className="py-2">邮箱</th>
                      <th className="py-2">角色权限</th>
                      <th className="py-2">机构</th>
                      <th className="py-2">状态</th>
                      <th className="py-2">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.users.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3 font-mono text-xs text-slate-500">{u.id}</td>
                        <td className="py-3 font-medium text-slate-900">{u.name}</td>
                        <td className="py-3 text-slate-600">{u.email}</td>
                        <td className="py-3">
                          <select
                            value={u.role}
                            disabled={busy || u.email === "admin@cpcd.local"}
                            onChange={async (e) => {
                              setBusy(true);
                              try {
                                if (apiMode && authed) {
                                  await updateUserRole(u.id, e.target.value);
                                }
                                await refresh();
                              } finally {
                                setBusy(false);
                              }
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
                          >
                            <option value="enterprise">{roleLabel.enterprise}</option>
                            <option value="research">{roleLabel.research}</option>
                            <option value="reviewer">{roleLabel.reviewer}</option>
                            <option value="admin">{roleLabel.admin}</option>
                          </select>
                        </td>
                        <td className="py-3 text-slate-600">{u.org}</td>
                        <td className="py-3"><StatusPill status={u.status} /></td>
                        <td className="py-3">
                          {u.status === "active" ? (
                            <button
                              disabled={busy || u.email === "admin@cpcd.local"}
                              onClick={async () => {
                                setBusy(true);
                                try {
                                  if (apiMode && authed) await updateUserStatus(u.id, "disabled");
                                  else setUserStatus(u.id, "disabled");
                                  await refresh();
                                } finally {
                                  setBusy(false);
                                }
                              }}
                              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200 disabled:opacity-40"
                            >
                              禁用
                            </button>
                          ) : (
                            <button
                              disabled={busy}
                              onClick={async () => {
                                setBusy(true);
                                try {
                                  if (apiMode && authed) await updateUserStatus(u.id, "active");
                                  else setUserStatus(u.id, "active");
                                  await refresh();
                                } finally {
                                  setBusy(false);
                                }
                              }}
                              className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-100"
                            >
                              激活
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {active === "news" && (
            <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">新闻编辑</h2>
                <div className="space-y-3">
                  <input value={newsForm.title} onChange={(e) => setNewsForm((p) => ({ ...p, title: e.target.value }))} placeholder="标题" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  <input value={newsForm.author} onChange={(e) => setNewsForm((p) => ({ ...p, author: e.target.value }))} placeholder="作者" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  <input value={newsForm.publishedAt} onChange={(e) => setNewsForm((p) => ({ ...p, publishedAt: e.target.value }))} placeholder="时间（例如 2026.05.22 10:20:00）" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  <input value={newsForm.link} onChange={(e) => setNewsForm((p) => ({ ...p, link: e.target.value }))} placeholder="原文链接" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  <textarea value={newsForm.content} onChange={(e) => setNewsForm((p) => ({ ...p, content: e.target.value }))} placeholder="正文内容" rows={8} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  <div className="flex gap-2">
                    <button
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await saveAdminNews(newsForm);
                          setNewsForm({ id: "", title: "", author: "", publishedAt: "", link: "", content: "" });
                          await refresh();
                        } finally {
                          setBusy(false);
                        }
                      }}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
                    >
                      {newsForm.id ? "保存更新" : "新增新闻"}
                    </button>
                    <button onClick={() => setNewsForm({ id: "", title: "", author: "", publishedAt: "", link: "", content: "" })} className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
                      清空
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">已发布新闻（后台可维护）</h2>
                <div className="space-y-3">
                  {newsItems.length === 0 && <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">暂无后台新闻，可先新增。</div>}
                  {newsItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium text-slate-900">{item.title}</div>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] ring-1 ${
                          item.source === "realtime"
                            ? "bg-blue-50 text-blue-700 ring-blue-200"
                            : item.source === "override"
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                              : "bg-slate-100 text-slate-600 ring-slate-200"
                        }`}>
                          {item.source === "realtime" ? "实时源" : item.source === "override" ? "已覆盖" : "后台发布"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{item.author || "未知作者"} ｜ {item.publishedAt || "未填写时间"}</div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => setNewsForm(item)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700">编辑</button>
                        <button
                          disabled={busy}
                          onClick={async () => {
                            setBusy(true);
                            try {
                              await deleteAdminNews(item.id);
                              await refresh();
                            } finally {
                              setBusy(false);
                            }
                          }}
                          className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-700"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {active === "products" && (
            <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">产品库条目审核</h2>
              <div className="space-y-4">
                {state.productSubmissions.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900">{item.payload.name} <span className="ml-2 font-mono text-xs text-slate-400">{item.id}</span></div>
                        <p className="mt-1 text-sm text-slate-500">{item.payload.cat1} / {item.payload.cat2} / {item.payload.cat3}</p>
                        <p className="mt-1 text-xs text-slate-500">提交人：{item.submitter}（{item.org}） · {item.submittedAt}</p>
                      </div>
                      <StatusPill status={item.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button disabled={busy || item.status !== "pending"} onClick={() => decideProduct(item.id, "approved")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs text-white disabled:opacity-40"><CheckCircle2 size={14} />通过</button>
                      <button disabled={busy || item.status !== "pending"} onClick={() => decideProduct(item.id, "rejected")} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs text-white disabled:opacity-40"><XCircle size={14} />驳回</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "hub" && (
            <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">LCA-Hub 发布与更新审核</h2>
              <div className="space-y-4">
                {state.hubSubmissions.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900">{item.modelName} <span className="ml-2 text-xs text-slate-500">{item.version}</span></div>
                        <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
                        <p className="mt-1 text-xs text-slate-500">类型：{item.type} · 提交方：{item.owner} · {item.submittedAt}</p>
                      </div>
                      <StatusPill status={item.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button disabled={busy || item.status !== "pending"} onClick={() => decideHub(item.id, "approved")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs text-white disabled:opacity-40"><ShieldCheck size={14} />通过</button>
                      <button disabled={busy || item.status !== "pending"} onClick={() => decideHub(item.id, "rejected")} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs text-white disabled:opacity-40"><XCircle size={14} />驳回</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "audit" && (
            <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">审核日志</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="py-2">时间</th><th className="py-2">模块</th><th className="py-2">动作</th><th className="py-2">对象</th><th className="py-2">操作人</th><th className="py-2">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.auditLogs.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-slate-400">暂无日志，先去审核一条试试。</td></tr>}
                    {state.auditLogs.map((log) => <tr key={log.id}><td className="py-3 text-slate-500">{log.time}</td><td className="py-3 text-slate-700">{log.module}</td><td className="py-3 text-slate-700">{log.action}</td><td className="py-3 font-mono text-xs text-slate-500">{log.target}</td><td className="py-3 text-slate-700">{log.operator}</td><td className="py-3 text-slate-600">{log.note}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
