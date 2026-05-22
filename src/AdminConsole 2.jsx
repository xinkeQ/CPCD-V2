import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  GitPullRequest,
  History,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import {
  getAdminState,
  resetAdminState,
  reviewHubSubmission,
  reviewProductSubmission,
  setUserStatus,
} from "./data/adminStore";

const adminMenus = [
  { key: "dashboard", label: "概览", icon: LayoutDashboard },
  { key: "users", label: "注册用户", icon: Users },
  { key: "products", label: "产品库审核", icon: ClipboardCheck },
  { key: "hub", label: "LCA-Hub 审核", icon: GitPullRequest },
  { key: "audit", label: "审核日志", icon: History },
];

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

export default function AdminConsole() {
  const [active, setActive] = useState("dashboard");
  const [tick, setTick] = useState(0);
  const [reviewer] = useState("后台审核员");

  const state = useMemo(() => getAdminState(), [tick]);
  const pendingProducts = state.productSubmissions.filter((x) => x.status === "pending");
  const pendingHub = state.hubSubmissions.filter((x) => x.status === "pending");

  const refresh = () => setTick((n) => n + 1);

  const decideProduct = (id, decision) => {
    reviewProductSubmission(id, decision, reviewer, decision === "approved" ? "字段完整，审核通过" : "请补充边界与参考来源");
    refresh();
  };

  const decideHub = (id, decision) => {
    reviewHubSubmission(id, decision, reviewer, decision === "approved" ? "模型描述与变更记录完整" : "请补充测试说明与变更详情");
    refresh();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[270px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-950 p-5 text-slate-200">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs tracking-wider text-emerald-300">CPCD ADMIN</div>
            <div className="mt-1 text-lg font-semibold text-white">后台管理中心</div>
            <p className="mt-2 text-xs leading-5 text-slate-400">管理注册用户、产品库条目审核、LCA-Hub 发布与更新审核。</p>
          </div>
          <nav className="mt-5 space-y-1">
            {adminMenus.map((m) => {
              const Icon = m.icon;
              const isActive = active === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setActive(m.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                    isActive ? "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} />
                  {m.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-8 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs text-amber-100">
            当前是前端演示版后台。后续可对接真实 API（NestJS/Express + MySQL/PostgreSQL + JWT/RBAC）。
          </div>
        </aside>

        <main className="p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">运营后台</h1>
              <p className="mt-1 text-sm text-slate-500">左侧菜单右侧内容布局，已打通前台产品数据联动（审核通过即同步到前台产品库）。</p>
            </div>
            <div className="flex items-center gap-2">
              <a href="/" className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">返回前台</a>
              <button onClick={() => { resetAdminState(); refresh(); }} className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
                重置演示数据
              </button>
            </div>
          </div>

          {active === "dashboard" && (
            <section className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card title="注册用户" value={state.users.length} desc="用户与审核角色总数" />
                <Card title="产品待审" value={pendingProducts.length} desc="待处理产品库条目" />
                <Card title="Hub 待审" value={pendingHub.length} desc="待处理发布/更新请求" />
                <Card title="已入前台产品库" value={state.approvedProducts.length} desc="来自后台审核通过同步" />
              </div>
              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">审核联动说明</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  当前后台审核通过的产品条目会写入本地持久化，并在前台产品库读取时自动合并展示。你可以在“产品库审核”里点通过，然后回前台“产品库”页面验证新增数据。
                </p>
              </div>
            </section>
          )}

          {active === "users" && (
            <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">注册用户管理</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="py-2">用户ID</th><th className="py-2">姓名</th><th className="py-2">邮箱</th><th className="py-2">角色</th><th className="py-2">机构</th><th className="py-2">状态</th><th className="py-2">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.users.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3 font-mono text-xs text-slate-500">{u.id}</td>
                        <td className="py-3 font-medium text-slate-900">{u.name}</td>
                        <td className="py-3 text-slate-600">{u.email}</td>
                        <td className="py-3 text-slate-600">{u.role}</td>
                        <td className="py-3 text-slate-600">{u.org}</td>
                        <td className="py-3"><StatusPill status={u.status} /></td>
                        <td className="py-3">
                          {u.status === "active" ? (
                            <button onClick={() => { setUserStatus(u.id, "disabled"); refresh(); }} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200">禁用</button>
                          ) : (
                            <button onClick={() => { setUserStatus(u.id, "active"); refresh(); }} className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-100">激活</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                        <p className="mt-2 text-sm text-slate-600">核算边界：{item.payload.boundary} · 数据来源：{item.payload.source} · 质量等级：{item.payload.quality}</p>
                      </div>
                      <StatusPill status={item.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button disabled={item.status !== "pending"} onClick={() => decideProduct(item.id, "approved")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs text-white disabled:opacity-40">
                        <CheckCircle2 size={14} /> 通过
                      </button>
                      <button disabled={item.status !== "pending"} onClick={() => decideProduct(item.id, "rejected")} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs text-white disabled:opacity-40">
                        <XCircle size={14} /> 驳回
                      </button>
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
                      <button disabled={item.status !== "pending"} onClick={() => decideHub(item.id, "approved")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs text-white disabled:opacity-40">
                        <ShieldCheck size={14} /> 通过
                      </button>
                      <button disabled={item.status !== "pending"} onClick={() => decideHub(item.id, "rejected")} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs text-white disabled:opacity-40">
                        <XCircle size={14} /> 驳回
                      </button>
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
                    {state.auditLogs.length === 0 && (
                      <tr><td colSpan={6} className="py-10 text-center text-slate-400">暂无日志，先去审核一条试试。</td></tr>
                    )}
                    {state.auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-3 text-slate-500">{log.time}</td>
                        <td className="py-3 text-slate-700">{log.module}</td>
                        <td className="py-3 text-slate-700">{log.action}</td>
                        <td className="py-3 font-mono text-xs text-slate-500">{log.target}</td>
                        <td className="py-3 text-slate-700">{log.operator}</td>
                        <td className="py-3 text-slate-600">{log.note}</td>
                      </tr>
                    ))}
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
