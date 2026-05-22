import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Clock3,
  Mail,
  Database,
  MapPinned,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  Leaf,
  Factory,
  Globe2,
  CalendarDays,
  Home,
  LibraryBig,
  Network,
  Route,
  Users,
  ClipboardCheck,
  GitBranch,
  RefreshCw,
  Star,
  Download,
  CheckCircle2,
  AlertTriangle,
  Workflow,
  MessageSquare,
  UploadCloud,
  Menu,
  X,
  ArrowUp,
  ChevronDown,
  LogOut,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { useUnifiedProductData } from "./data/cpcdDataBridge";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "./data/userAuth";

const categoryData = [
  { name: "其他可运输货物", value: 994 },
  { name: "金属制品、机械和设备", value: 920 },
  { name: "农业、林业和水产品", value: 717 },
  { name: "食品饮料纺织皮革", value: 660 },
  { name: "矿石矿物与能源", value: 525 },
  { name: "运输及公用事业服务", value: 446 },
  { name: "建筑和建筑服务", value: 140 },
];

const sourceData = [
  { name: "文献数据", value: 3424 },
  { name: "企业数据", value: 852 },
  { name: "核心数据", value: 474 },
];

const qualityData = [
  { name: "质量等级 5", value: 2116 },
  { name: "质量等级 4", value: 2040 },
  { name: "质量等级 3", value: 594 },
];

const boundaryData = [
  { name: "摇篮到大门", value: 2848 },
  { name: "摇篮到坟墓", value: 1664 },
  { name: "大门到大门", value: 140 },
  { name: "大门到坟墓", value: 98 },
];

const yearData = [
  { year: "2010", value: 82 },
  { year: "2011", value: 184 },
  { year: "2012", value: 179 },
  { year: "2013", value: 131 },
  { year: "2014", value: 106 },
  { year: "2015", value: 188 },
  { year: "2016", value: 121 },
  { year: "2017", value: 162 },
  { year: "2018", value: 304 },
  { year: "2019", value: 383 },
  { year: "2020", value: 573 },
  { year: "2021", value: 702 },
  { year: "2022", value: 608 },
  { year: "2023", value: 308 },
  { year: "2024", value: 174 },
];

const regionData = [
  { name: "中国", value: 1315 },
  { name: "全球", value: 720 },
  { name: "英国", value: 173 },
  { name: "欧洲", value: 161 },
  { name: "中国北京", value: 117 },
  { name: "中国浙江", value: 112 },
  { name: "美国", value: 101 },
  { name: "中国江苏", value: 99 },
];

const partnerOrganizations = [
  {
    name: "碳迹通",
    href: "https://cyacle.carbonnt.com/shell?instances=instance_1_1779376328765&activePrimary=instance_1_1779376328765&profile=default",
    logo: "https://cyacle.carbonnt.com/favicon.ico",
    note: "产品碳足迹与低碳管理相关平台入口。",
  },
  {
    name: "有问必答",
    href: "https://walle.carbonnt.com/cpcd",
    logo: "https://walle.carbonnt.com/favicon.ico",
    note: "围绕 CPCD 场景的智能问答服务入口。",
  },
  {
    name: "一米一低碳学院",
    href: "https://study.1mi1.org/course",
    logo: "https://study.1mi1.org/images/logo_3.png",
    note: "低碳课程、工具教学与案例学习平台。",
  },
  {
    name: "碳云",
    href: "https://ccloud.carbonstop.com/carbonFootprint3/footprintAccount",
    logo: "https://ccloud.carbonstop.com/favicon.png",
    note: "碳足迹核算与业务协同相关平台入口。",
  },
];

const coBuilderOrganizations = [
  { name: "生态环境部环境规划院", logo: "/caep.jpeg" },
  { name: "中国城市温室气体工作组", logo: "/city-logo.png" },
  { name: "公众环境研究中心", logo: "/ipe-logo.jpeg" },
];

const PAGE_SIZE = 20;

const factorCategories = [
  ["固定源燃料燃烧", "Scope 1", "燃料单位 / MJ", "国家温室气体排放因子库优先"],
  ["道路车辆移动源燃烧", "Scope 1", "L、kg、km、t·km、p·km", "燃料库 + 中国文献互审"],
  ["外购电力", "Scope 2", "kg CO₂/kWh", "生态环境部电网因子"],
  ["外购热力", "Scope 2", "kg CO₂/GJ、吨蒸汽", "工作论文 + 文献补充"],
  ["外购产品", "Scope 3 Cat.1", "物理单位 / 万元支出", "CPCD、国家库、CLCD合作"],
  ["资本商品", "Scope 3 Cat.2", "万元固定资产投资", "EEIO 方法学"],
  ["能源相关活动", "Scope 3 Cat.3", "单位燃料", "上游开采加工文献"],
  ["货物运输", "Scope 3 Cat.4/Cat.9", "t·km", "行业统计、GLEC本土化"],
  ["旅客运输", "Scope 3 Cat.6/Cat.7", "p·km / km", "交通统计与出行调查"],
  ["运营废弃物处理", "Scope 3 Cat.5", "吨废弃物", "环境工程文献系统检索"],
];

const navItems = [
  { key: "home", label: "首页", icon: Home },
  { key: "library", label: "产品库", icon: LibraryBig },
  { key: "hub", label: "LCA-Hub", icon: Network },
  { key: "roadmap", label: "因子库建设", icon: Route },
];

const navDropdowns = [
  {
    key: "community",
    label: "CPCD 社区",
    items: ["新闻资讯", "社区论坛", "专家文章"],
  },
  {
    key: "about",
    label: "关于我们",
    items: ["平台介绍", "建设者", "数据共建"],
  },
];

const palette = ["#0f766e", "#2563eb", "#7c3aed", "#ea580c", "#16a34a", "#0891b2", "#9333ea", "#64748b"];

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function useScrollTop(dep) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dep]);
}

function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handler = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/25 transition-colors hover:bg-emerald-700"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function StatCard({ icon: Icon, label, value, note, dark = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-2xl p-5 shadow-sm ring-1 transition-shadow duration-300 hover:shadow-lg ${dark ? "bg-slate-900 text-white ring-white/10" : "bg-white/90 text-slate-900 ring-slate-200"}`}
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-3 ${dark ? "bg-white/10 text-emerald-300" : "bg-emerald-50 text-emerald-700"}`}>
          <Icon size={22} />
        </div>
        <span className={`text-xs font-medium tracking-wider ${dark ? "text-white/35" : "text-slate-400"}`}>CPCD</span>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight">{value}</div>
      <div className={`mt-1 text-sm font-medium ${dark ? "text-white/80" : "text-slate-700"}`}>{label}</div>
      <div className={`mt-2 text-xs leading-5 ${dark ? "text-white/55" : "text-slate-500"}`}>{note}</div>
    </motion.div>
  );
}

function Chip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ${active ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"}`}
    >
      {children}
    </button>
  );
}

function AuthModal({ mode, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      const user = isRegister
        ? await registerUser(name || "新用户", email, password, org || "个人用户")
        : await loginUser(email, password);
      onSuccess(user);
      onClose();
    } catch (e) {
      setError(e.message || "操作失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="fixed left-1/2 top-1/2 z-[71] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <h3 className="text-xl font-semibold text-slate-900">{isRegister ? "邮箱注册" : "邮箱登录"}</h3>
        <div className="mt-4 space-y-3">
          {isRegister && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="姓名" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />}
          {isRegister && <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="机构（选填）" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />}
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="邮箱" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="密码（至少 6 位）" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-700">取消</button>
            <button disabled={busy} onClick={submit} className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white">{busy ? "处理中..." : (isRegister ? "注册并登录" : "登录")}</button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function MobileMenu({ active, setActive, open, setOpen, user, onLogin, onRegister, onLogout }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="fixed left-4 right-4 top-20 z-50 rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-slate-200 md:hidden"
          >
            {navItems.map((item) => {
              return (
                <button
                  key={item.key}
                  onClick={() => { setActive(item.key); setOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${active === item.key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="my-2 border-t border-slate-100" />
            {navDropdowns.map((group) => (
              <div key={group.key} className="px-2 py-2">
                <div className="px-2 text-xs font-semibold tracking-wide text-slate-400">{group.label}</div>
                <div className="mt-1">
                  {group.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        if (group.key === "community" && item === "新闻资讯") setActive("news");
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <ChevronDown size={14} className="rotate-[-90deg] text-slate-400" />
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <a
              href="/admin"
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              后台管理
            </a>
            {!user ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button onClick={() => { onRegister(); setOpen(false); }} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-700">注册</button>
                <button onClick={() => { onLogin(); setOpen(false); }} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white">登录</button>
              </div>
            ) : (
              <button onClick={() => { onLogout(); setOpen(false); }} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-700">
                <LogOut size={15} /> 退出登录
              </button>
            )}
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}

function PageShell({ active, setActive, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [active]);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <button onClick={() => setActive("home")} className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="h-12 w-12 overflow-hidden rounded-2xl ring-1 ring-slate-200">
              <img
                src="/logo.jpeg"
                alt="CPCD logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-left">
              <div className="text-base font-semibold sm:text-lg">中国产品全生命周期温室气体排放系数库</div>
              <div className="hidden text-xs text-slate-500 sm:block">CPCD · China Products Carbon Footprint Factor Database</div>
            </div>
          </button>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                >
                  {item.label}
                </button>
              );
            })}
            {navDropdowns.map((group) => {
              const isOpen = openDropdown === group.key;
              return (
                <div
                  key={group.key}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(group.key)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : group.key)}
                    className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
                  >
                    {group.label}
                    <ChevronDown size={15} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-12 z-50 min-w-[170px] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
                      >
                        {group.items.map((item) => (
                          <a
                            key={item}
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (group.key === "community" && item === "新闻资讯") setActive("news");
                              setOpenDropdown(null);
                            }}
                            className="block rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                          >
                            {item}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            <a
              href="/admin"
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
            >
              后台管理
            </a>
            {!user ? (
              <>
                <button onClick={() => setAuthMode("register")} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200">注册</button>
                <button onClick={() => setAuthMode("login")} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800">登录</button>
              </>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                <span className="max-w-[120px] truncate">{user.name || user.email}</span>
                <button onClick={() => { logoutUser(); setUser(null); }} className="rounded-full bg-white px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">
                  退出
                </button>
              </div>
            )}
          </nav>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>
      <MobileMenu
        active={active}
        setActive={setActive}
        open={mobileOpen}
        setOpen={setMobileOpen}
        user={user}
        onLogin={() => setAuthMode("login")}
        onRegister={() => setAuthMode("register")}
        onLogout={() => { logoutUser(); setUser(null); }}
      />
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSuccess={(u) => setUser(u)} />}
      <AnimatePresence mode="wait">
        <motion.div key={active} variants={pageVariants} initial="initial" animate="animate" exit="exit">
          {children}
        </motion.div>
      </AnimatePresence>
      <ScrollToTop />
      <footer className="mt-12 border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h3 className="text-center text-3xl font-semibold tracking-tight text-slate-900">联系我们</h3>

          <div className="mt-7 grid gap-6 text-base text-slate-700 md:grid-cols-2 xl:grid-cols-[260px_300px_300px_328px] xl:justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/wechat-logo.png"
                alt="微信公众号二维码"
                className="h-20 w-20 rounded-lg border border-slate-200 bg-white object-cover p-1"
              />
              <div className="text-sm">
                <div className="text-slate-400">微信公众号</div>
                <div className="font-semibold text-slate-700">扫码关注</div>
              </div>
            </div>
            <div className="flex items-center gap-3 xl:justify-self-start">
              <Clock3 size={20} className="text-emerald-500" />
              <span className="whitespace-nowrap text-slate-400">工作时间:</span>
              <span className="whitespace-nowrap font-semibold">周一至周五 9:00-18:00</span>
            </div>
            <div className="flex items-center gap-3 xl:justify-self-start">
              <Mail size={20} className="text-emerald-500" />
              <span className="whitespace-nowrap text-slate-400">官方邮箱:</span>
              <span className="whitespace-nowrap font-semibold">cpcd@caep.org.cn</span>
            </div>
            <div className="flex w-[328px] items-center gap-3 xl:justify-self-end xl:-translate-x-3">
              <MapPinned size={20} className="text-emerald-500" />
              <span className="whitespace-nowrap text-slate-400">联系地址:</span>
              <span className="whitespace-nowrap font-semibold">北京市石景山区实兴大街15号</span>
            </div>
          </div>

          <div className="mt-7 border-t border-slate-200 pt-6">
            <div className="flex flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
              <span>© 2024-2026 中国产品全生命周期温室气体排放系数库 版权所有. | 京ICP备12345678号</span>
              <div className="flex items-center gap-6">
                <button onClick={() => setActive("notice")} className="transition-colors hover:text-emerald-700">重要说明</button>
                <button onClick={() => setActive("privacy")} className="transition-colors hover:text-emerald-700">隐私策略</button>
                <a href="#" className="transition-colors hover:text-emerald-700">Q&A</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CustomTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl">
      <div className="font-medium text-slate-900">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="mt-1 text-slate-600">
          {p.name}: <span className="font-semibold text-emerald-700">{p.value.toLocaleString()}{unit}</span>
        </div>
      ))}
    </div>
  );
}

function HomePage({ setActive }) {
  useScrollTop("home");
  const { allData } = useUnifiedProductData();
  const productCount = allData.length ? allData.length.toLocaleString() : "4,750";
  return (
    <main>
      <section className="relative overflow-hidden bg-[url('/hero-bg.png')] bg-cover bg-center text-white">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#dff0ff]/54 via-[#d2e9ff]/26 to-[#8bc6ff]/4" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a2f6d]/12 via-[#0a2f6d]/5 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_42%,rgba(255,255,255,0.24),rgba(255,255,255,0)_54%)]" />
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8">
          <motion.div variants={stagger} initial="initial" animate="animate">
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/78 px-4 py-2 text-sm font-medium text-[#176f88] ring-1 ring-white/85 backdrop-blur-sm shadow-sm">
              <ShieldCheck size={16} /> 已审核通过数据 {productCount} 条
            </motion.div>
            <motion.h1 variants={fadeUp} className="max-w-4xl text-2xl font-bold leading-tight text-[#0a2f6d] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)] sm:text-3xl md:text-5xl">开放 · 透明 · 协作 · 共建</motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-4xl text-2xl font-semibold leading-tight text-[#0f3567] sm:text-3xl">
              构建中国本土化碳数据基础设施
            </motion.p>
            <motion.p variants={fadeUp} className="mt-5 max-w-4xl text-sm font-semibold leading-8 text-[#143a6a] sm:text-base">
              产品碳足迹数据库 ｜ 碳排放因子库 ｜ LCA 开源模型平台
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => setActive("library")}
                className="group rounded-full border border-white/70 bg-white/26 px-6 py-3 text-sm font-semibold text-[#0d3569] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_10px_28px_rgba(10,47,109,0.24)] transition-all duration-300 hover:bg-white/38 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_14px_34px_rgba(10,47,109,0.3)] active:scale-[0.98]"
              >
                进入产品库 <ChevronRight size={16} className="ml-1 inline transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => setActive("hub")}
                className="rounded-full border border-white/55 bg-white/18 px-6 py-3 text-sm font-semibold text-[#0d3569] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_24px_rgba(15,118,110,0.2)] transition-all duration-300 hover:bg-white/28 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.62),0_14px_30px_rgba(15,118,110,0.26)] active:scale-[0.98]"
              >
                查看 LCA-Hub
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <AnalysisSwitcher />
          <StructureSwitcher />
        </div>

        <NewsModule setActive={setActive} />
        <PartnersModule />
      </section>
    </main>
  );
}

function AnalysisSwitcher() {
  const [mode, setMode] = useState("time");

  const config = {
    time: {
      title: "结构分析：按数据时间看覆盖情况",
      description: "展示数据库时效性和样本集中年份。",
      icon: CalendarDays,
    },
    region: {
      title: "结构分析：按地域看覆盖情况",
      description: "查看主要地区的数据覆盖与代表性分布。",
      icon: Globe2,
    },
    category: {
      title: "结构分析：按分类看覆盖情况",
      description: "对比一级分类之间的样本数量差异。",
      icon: BarChart3,
    },
  };

  const current = config[mode];
  const CurrentIcon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-shadow duration-300 hover:shadow-md sm:p-6 lg:col-span-2"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold sm:text-xl">{current.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{current.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Chip active={mode === "time"} onClick={() => setMode("time")}>时间</Chip>
          <Chip active={mode === "region"} onClick={() => setMode("region")}>地域</Chip>
          <Chip active={mode === "category"} onClick={() => setMode("category")}>分类</Chip>
          <CurrentIcon className="ml-1 hidden text-slate-400 sm:block" />
        </div>
      </div>

      <div className="h-60 sm:h-72">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="h-full"
          >
            {mode === "time" ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearData} margin={{ left: 0, right: 16, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip unit=" 条" />} />
                  <Line type="monotone" dataKey="value" name="记录数" stroke="#0f766e" strokeWidth={3} dot={{ r: 3, fill: "#0f766e" }} activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mode === "region" ? regionData : categoryData}
                  layout="vertical"
                  margin={{ left: 10, right: 20, top: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={mode === "region" ? 78 : 126}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip unit=" 条" />} />
                  <Bar dataKey="value" name="记录数" radius={[0, 8, 8, 0]} fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function StructureSwitcher() {
  const [mode, setMode] = useState("source");

  const config = {
    source: {
      title: "结构分析：数据来源",
      description: "区分文献、企业和核心数据。",
      icon: Factory,
      data: sourceData,
    },
    quality: {
      title: "结构分析：数据质量",
      description: "查看不同质量等级的数据分布情况。",
      icon: ShieldCheck,
      data: qualityData,
    },
    boundary: {
      title: "结构分析：核算边界",
      description: "对比不同核算边界的样本占比。",
      icon: Workflow,
      data: boundaryData,
    },
  };

  const current = config[mode];
  const CurrentIcon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-shadow duration-300 hover:shadow-md sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">{current.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{current.description}</p>
          </div>
          <CurrentIcon className="hidden shrink-0 text-slate-400 sm:block" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={mode === "source"} onClick={() => setMode("source")}>来源</Chip>
          <Chip active={mode === "quality"} onClick={() => setMode("quality")}>质量</Chip>
          <Chip active={mode === "boundary"} onClick={() => setMode("boundary")}>边界</Chip>
        </div>
      </div>

      <div className="h-60 sm:h-72">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={current.data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  animationBegin={300}
                  animationDuration={800}
                >
                  {current.data.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip unit=" 条" />} />
                <Legend verticalAlign="bottom" height={32} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function NewsModule({ setActive }) {
  const [newsType, setNewsType] = useState("policy");
  const [realtimeItems, setRealtimeItems] = useState([]);
  const [realtimeLoading, setRealtimeLoading] = useState(false);

  const policyItems = [
    {
      tag: "政策动态",
      title: "全国温室气体自愿减排与企业碳披露要求持续完善",
      desc: "跟踪国家和地方碳核算、碳披露、产品碳足迹、绿色金融相关政策变化，为企业数据应用提供政策背景。",
      date: "2026-01-05",
    },
    {
      tag: "平台更新",
      title: "LCA-Hub 开源模型仓库机制上线设计",
      desc: "支持模型发布、Issue反馈、Pull Request协作更新和版本管理，推动因子模型持续共建。",
      date: "2026-01-03",
    },
    {
      tag: "数据观察",
      title: "产品碳足迹数据库中制造业与农业食品类数据占比较高",
      desc: "从一级分类、数据来源、核算边界和地域代表性分析数据库结构，为后续补库提供依据。",
      date: "2025-12-28",
    },
  ];

  useEffect(() => {
    if (newsType !== "realtime") return;
    setRealtimeLoading(true);
    fetch("/api/news/realtime")
      .then((r) => r.json())
      .then((data) => setRealtimeItems(Array.isArray(data.items) ? data.items : []))
      .catch(() => setRealtimeItems([]))
      .finally(() => setRealtimeLoading(false));
  }, [newsType]);

  const newsItems = newsType === "policy"
    ? policyItems
    : realtimeItems.map((x) => ({
      tag: "实时资讯",
      title: x.title,
      desc: x.desc || "来自 CityGHG LCA 新闻页面。",
      date: x.date || "",
      href: x.href,
    }));

  const latestThree = [...newsItems]
    .sort((a, b) => {
      const parse = (v) => {
        if (!v) return 0;
        const t = Date.parse(String(v).replace(/\./g, "-"));
        return Number.isNaN(t) ? 0 : t;
      };
      return parse(b.date) - parse(a.date);
    })
    .slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="mt-10 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6"
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-700 ring-1 ring-emerald-100">
            <MessageSquare size={16} /> 新闻资讯
          </div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">政策动态与实时资讯</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            “实时资讯”同步展示
            <a
              href="https://lca.cityghg.com/pages/articles/news"
              target="_blank"
              rel="noreferrer"
              className="mx-1 text-emerald-700 hover:text-emerald-600"
            >
              CityGHG 新闻页
            </a>
            的新闻内容。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip active={newsType === "policy"} onClick={() => setNewsType("policy")}>政策动态</Chip>
            <Chip active={newsType === "realtime"} onClick={() => setNewsType("realtime")}>实时资讯</Chip>
          </div>
        </div>
        <button className="group inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98]" onClick={() => setActive("news")}>
          查看更多 <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      {newsType === "realtime" && realtimeLoading && (
        <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200">正在拉取实时资讯...</div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {latestThree.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="group cursor-pointer rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100 transition-all duration-300 hover:bg-white hover:shadow-lg hover:ring-slate-200"
            onClick={() => item.href && window.open(item.href, "_blank", "noopener,noreferrer")}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">{item.tag}</span>
              <span className="text-xs text-slate-400">{item.date}</span>
            </div>
            <h3 className="mt-4 text-base font-semibold leading-snug text-slate-900 sm:text-lg">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">{item.desc}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 transition-colors group-hover:text-emerald-600">
              阅读详情 <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}

function NewsPage() {
  useScrollTop("news");
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetch("/api/news/all")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data.items) ? data.items : [];
        setItems(list);
        if (list.length) setSelected(list[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (item) => {
    setSelected(item);
    setDetailLoading(true);
    try {
      const r = await fetch(`/api/news/item/${encodeURIComponent(item.id)}`);
      const detail = await r.json();
      setSelected(detail);
    } catch {
      setSelected(item);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <main>
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(56,189,248,0.35),transparent_50%),radial-gradient(circle_at_80%_10%,rgba(20,184,166,0.25),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-cyan-200 ring-1 ring-white/15">
            <FileText size={16} /> CPCD 社区 · 新闻资讯
          </div>
          <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">政策动态与实时资讯</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200/85 sm:text-base">
            实时资讯同步来源于
            <a className="mx-1 text-emerald-300 hover:text-emerald-200" href="https://lca.cityghg.com/pages/articles/news" target="_blank" rel="noreferrer">
              CityGHG 新闻页面
            </a>
            ，支持查看具体内容。
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[360px_1fr]">
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="px-2 text-lg font-semibold text-slate-900">新闻列表</h2>
          <div className="mt-3 max-h-[72vh] space-y-2 overflow-y-auto pr-1">
            {loading && <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">正在加载新闻...</div>}
            {!loading && items.length === 0 && <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">暂无新闻数据</div>}
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => openDetail(item)}
                className={`w-full rounded-xl px-3 py-3 text-left transition ${selected?.id === item.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
              >
                <div className="line-clamp-2 text-sm font-medium">{item.title}</div>
                <div className={`mt-2 text-xs ${selected?.id === item.id ? "text-white/70" : "text-slate-400"}`}>{item.publishedAt || "未标注时间"}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          {!selected ? (
            <div className="text-sm text-slate-500">请选择左侧一条新闻查看内容。</div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-slate-900">{selected.title}</h2>
              <div className="mt-3 text-sm text-slate-500">
                {selected.author ? `作者：${selected.author}` : "作者：未知"} {selected.publishedAt ? `｜时间：${selected.publishedAt}` : ""}
              </div>
              {selected.link && (
                <a href={selected.link} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm text-emerald-700 hover:text-emerald-600">
                  查看原文链接
                </a>
              )}
              <div className="mt-6 whitespace-pre-wrap text-sm leading-8 text-slate-700">
                {detailLoading ? "正在加载正文..." : (selected.content || selected.desc || "该新闻暂无正文，请点击“查看原文链接”。")}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function PartnersModule() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6"
    >
      <div className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm text-sky-700 ring-1 ring-sky-100">
          <Users size={16} /> 合作机构
        </div>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">碳足迹建模工具</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          汇集合作平台、学习入口与业务协同工具，方便从 CPCD 继续进入相关服务。
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {partnerOrganizations.map((partner, index) => (
          <motion.a
            key={partner.name}
            href={partner.href}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            className="group rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100 transition-all duration-300 hover:bg-white hover:shadow-lg hover:ring-slate-200"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="truncate text-lg font-semibold text-slate-900">{partner.name}</h3>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                官方入口
              </span>
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-500">{partner.note}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 transition-colors group-hover:text-emerald-600">
              访问主页 <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
          </motion.a>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">共建单位</h3>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
            联合支持
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {coBuilderOrganizations.map((item) => (
            <div key={item.name} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <img
                src={item.logo}
                alt={item.name}
                className="h-16 w-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function Pagination({ current, total, onChange }) {
  const pages = [];
  const show = 7;
  let start = Math.max(1, current - Math.floor(show / 2));
  let end = Math.min(total, start + show - 1);
  if (end - start < show - 1) start = Math.max(1, end - show + 1);
  if (start > 1) { pages.push(1); if (start > 2) pages.push("..."); }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total) { if (end < total - 1) pages.push("..."); pages.push(total); }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-2">
      <button disabled={current === 1} onClick={() => onChange(current - 1)} className="rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30">上一页</button>
      {pages.map((p, i) =>
        p === "..." ? <span key={`e${i}`} className="px-1 text-slate-400">…</span> : (
          <button key={p} onClick={() => onChange(p)} className={`min-w-[36px] rounded-lg px-2 py-2 text-sm font-medium transition-all ${p === current ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>
        )
      )}
      <button disabled={current === total} onClick={() => onChange(current + 1)} className="rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30">下一页</button>
    </div>
  );
}

function LibraryPage() {
  useScrollTop("library");
  const { allData, loading } = useUnifiedProductData();
  const [query, setQuery] = useState("");
  const [dataset, setDataset] = useState("全部");
  const [source, setSource] = useState("全部");
  const [boundary, setBoundary] = useState("全部");
  const [catFilter, setCatFilter] = useState({ level: 0, cat1: "", cat2: "", cat3: "", cat4: "" });
  const [quality, setQuality] = useState("全部");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const listRef = useRef(null);

  const datasetCounts = useMemo(() => {
    const counts = {};
    allData.forEach((p) => { counts[p.dataset] = (counts[p.dataset] || 0) + 1; });
    return counts;
  }, [allData]);

  const scopedData = useMemo(() => {
    if (dataset === "全部") return allData;
    return allData.filter((p) => p.dataset === dataset);
  }, [allData, dataset]);

  const catTree = useMemo(() => {
    const tree = {};
    scopedData.forEach((p) => {
      const c1 = p.cat1 || "(未分类)";
      const c2 = p.cat2 || "";
      const c3 = p.cat3 || "";
      const c4 = p.cat4 || "";
      if (!tree[c1]) tree[c1] = { count: 0, children: {} };
      tree[c1].count++;
      if (c2) {
        if (!tree[c1].children[c2]) tree[c1].children[c2] = { count: 0, children: {} };
        tree[c1].children[c2].count++;
        if (c3) {
          if (!tree[c1].children[c2].children[c3]) tree[c1].children[c2].children[c3] = { count: 0, children: {} };
          tree[c1].children[c2].children[c3].count++;
          if (c4) {
            if (!tree[c1].children[c2].children[c3].children[c4]) tree[c1].children[c2].children[c3].children[c4] = { count: 0 };
            tree[c1].children[c2].children[c3].children[c4].count++;
          }
        }
      }
    });
    return tree;
  }, [scopedData]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const { level, cat1, cat2, cat3, cat4 } = catFilter;
    return scopedData.filter((item) => {
      if (q) {
        const text = [item.name, item.english, item.cat1, item.cat2, item.cat3, item.cat4, item.region, item.id].join(" ").toLowerCase();
        if (!text.includes(q)) return false;
      }
      if (source !== "全部" && item.source !== source) return false;
      if (boundary !== "全部" && item.boundary !== boundary) return false;
      if (quality !== "全部" && String(item.quality) !== quality) return false;
      if (level >= 1 && item.cat1 !== cat1) return false;
      if (level >= 2 && item.cat2 !== cat2) return false;
      if (level >= 3 && item.cat3 !== cat3) return false;
      if (level >= 4 && item.cat4 !== cat4) return false;
      return true;
    });
  }, [scopedData, query, source, boundary, catFilter, quality]);

  useEffect(() => { setPage(1); }, [query, dataset, source, boundary, catFilter, quality]);
  useEffect(() => { setCatFilter({ level: 0, cat1: "", cat2: "", cat3: "", cat4: "" }); setSource("全部"); setBoundary("全部"); setQuality("全部"); }, [dataset]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (!selected && allData.length) setSelected(allData[0]);
  }, [allData, selected]);

  const handleSelect = (item) => {
    setSelected(item);
    setShowDetail(true);
  };

  const handlePageChange = (p) => {
    setPage(p);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <main className="mx-auto flex max-w-7xl items-center justify-center px-6 py-32">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          <p className="text-sm text-slate-500">正在加载产品数据…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="rounded-3xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-emerald-200 ring-1 ring-white/15"><LibraryBig size={16} /> 产品碳足迹数据库</div>
            <h1 className="text-3xl font-semibold sm:text-4xl">产品库</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">共收录 <span className="font-semibold text-emerald-300">{allData.length.toLocaleString()}</span> 条产品碳足迹数据，支持多维筛选与检索。</p>
          </div>
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索产品名称、英文名、分类、地区、ID" className="w-full rounded-2xl border border-white/10 bg-white/10 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/40 transition-colors focus:border-emerald-400 focus:bg-white/15" />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {["全部", "全部数据", "核心数据", "涉外产品"].map((ds) => (
            <button key={ds} onClick={() => setDataset(ds)} className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${dataset === ds ? "bg-emerald-400 text-slate-950 shadow-md" : "bg-white/10 text-white/80 ring-1 ring-white/15 hover:bg-white/15"}`}>
              {ds === "全部" ? "全部" : ds}
              <span className={`ml-1.5 text-xs ${dataset === ds ? "text-slate-950/60" : "text-white/40"}`}>
                {ds === "全部" ? allData.length.toLocaleString() : (datasetCounts[ds] || 0).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      <div ref={listRef} className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr_380px]">
        <aside className="self-start rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5 lg:sticky lg:top-20">
          <div className="mb-4 flex items-center gap-2 font-semibold"><Filter size={18} />筛选条件</div>
          <div className="space-y-5">
            <CategoryTree tree={catTree} filter={catFilter} onChange={setCatFilter} total={scopedData.length} />
            <FilterGroup title="数据来源" values={["全部", "文献数据", "企业数据", "核心数据"]} active={source} onChange={setSource} />
            <FilterGroup title="核算边界" values={["全部", "摇篮到大门", "摇篮到坟墓", "大门到大门", "大门到坟墓"]} active={boundary} onChange={setBoundary} />
            <FilterGroup title="数据质量" values={["全部", "5", "4", "3"]} active={quality} onChange={setQuality} />
            <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900 ring-1 ring-amber-200">
              <div className="mb-1 flex items-center gap-2 font-semibold"><AlertTriangle size={16} />比较提醒</div>
              只有功能单元、核算边界、地域代表性、时间范围相近的数据，才建议横向比较。
            </div>
          </div>
        </aside>

        <section className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:p-4">
            <div className="text-sm text-slate-500">
              共 <span className="font-semibold text-slate-900">{filtered.length.toLocaleString()}</span> 条结果
              {filtered.length !== allData.length && <span className="ml-2 text-slate-400">/ {allData.length.toLocaleString()}</span>}
              <span className="ml-3 text-slate-400">第 {page}/{totalPages} 页</span>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-200"><Download size={16} /> 导出</button>
          </div>
          {paged.map((item, index) => (
            <motion.div
              key={item.id + index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
            >
              <ProductCard item={item} selected={selected?.id === item.id} onClick={() => handleSelect(item)} />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center ring-1 ring-slate-200">
              <Search size={32} className="text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">未找到匹配的产品</p>
              <button onClick={() => { setQuery(""); setDataset("全部"); setSource("全部"); setBoundary("全部"); setCatFilter({ level: 0, cat1: "", cat2: "", cat3: "", cat4: "" }); setQuality("全部"); }} className="mt-3 text-sm font-medium text-emerald-700 hover:text-emerald-600">清除筛选条件</button>
            </div>
          )}
          {totalPages > 1 && <Pagination current={page} total={totalPages} onChange={handlePageChange} />}
        </section>

        <div className="hidden lg:block">
          {selected && <ProductDetail selected={selected} />}
        </div>
      </div>

      <AnimatePresence>
        {showDetail && selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setShowDetail(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md overflow-y-auto lg:hidden">
              <div className="relative min-h-full">
                <button onClick={() => setShowDetail(false)} className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white"><X size={18} /></button>
                <ProductDetail selected={selected} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

function CategoryTree({ tree, filter, onChange, total }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  const isActive = filter.level === 0;

  return (
    <div>
      <div className="mb-2 text-sm font-medium text-slate-600">产品分类</div>
      <div className="max-h-[420px] space-y-0.5 overflow-y-auto pr-1">
        <button
          onClick={() => onChange({ level: 0, cat1: "", cat2: "", cat3: "", cat4: "" })}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-all ${isActive ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
        >
          <span>全部分类</span>
          <span className={`text-xs ${isActive ? "text-white/50" : "text-slate-400"}`}>{total.toLocaleString()}</span>
        </button>
        {Object.keys(tree).sort().map((c1) => {
          const node1 = tree[c1];
          const k1 = `1:${c1}`;
          const is1 = filter.level >= 1 && filter.cat1 === c1;
          const open1 = expanded[k1] || is1;
          const hasChildren1 = Object.keys(node1.children).length > 0;
          return (
            <div key={c1}>
              <div className="flex items-center">
                {hasChildren1 ? (
                  <button onClick={() => toggle(k1)} className="flex h-6 w-6 shrink-0 items-center justify-center text-slate-400 hover:text-slate-600">
                    <ChevronRight size={14} className={`transition-transform duration-200 ${open1 ? "rotate-90" : ""}`} />
                  </button>
                ) : <span className="w-6" />}
                <button
                  onClick={() => onChange({ level: 1, cat1: c1, cat2: "", cat3: "", cat4: "" })}
                  className={`flex flex-1 items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition-all ${is1 && filter.level === 1 ? "bg-emerald-100 font-medium text-emerald-900" : is1 ? "text-emerald-700" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  <span className="line-clamp-1">{c1}</span>
                  <span className="ml-1 shrink-0 text-xs text-slate-400">{node1.count}</span>
                </button>
              </div>
              {open1 && hasChildren1 && (
                <div className="ml-3 border-l border-slate-200 pl-2">
                  {Object.keys(node1.children).sort().map((c2) => {
                    const node2 = node1.children[c2];
                    const k2 = `2:${c1}/${c2}`;
                    const is2 = is1 && filter.level >= 2 && filter.cat2 === c2;
                    const open2 = expanded[k2] || is2;
                    const hasChildren2 = Object.keys(node2.children).length > 0;
                    return (
                      <div key={c2}>
                        <div className="flex items-center">
                          {hasChildren2 ? (
                            <button onClick={() => toggle(k2)} className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-400 hover:text-slate-600">
                              <ChevronRight size={12} className={`transition-transform duration-200 ${open2 ? "rotate-90" : ""}`} />
                            </button>
                          ) : <span className="w-5" />}
                          <button
                            onClick={() => onChange({ level: 2, cat1: c1, cat2: c2, cat3: "", cat4: "" })}
                            className={`flex flex-1 items-center justify-between rounded-md px-2 py-1 text-left text-xs transition-all ${is2 && filter.level === 2 ? "bg-emerald-100 font-medium text-emerald-900" : is2 ? "text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
                          >
                            <span className="line-clamp-1">{c2}</span>
                            <span className="ml-1 shrink-0 text-slate-400">{node2.count}</span>
                          </button>
                        </div>
                        {open2 && hasChildren2 && (
                          <div className="ml-2.5 border-l border-slate-100 pl-2">
                            {Object.keys(node2.children).sort().map((c3) => {
                              const node3 = node2.children[c3];
                              const k3 = `3:${c1}/${c2}/${c3}`;
                              const is3 = is2 && filter.level >= 3 && filter.cat3 === c3;
                              const open3 = expanded[k3] || is3;
                              const hasChildren3 = node3.children && Object.keys(node3.children).length > 0;
                              return (
                                <div key={c3}>
                                  <div className="flex items-center">
                                    {hasChildren3 ? (
                                      <button onClick={() => toggle(k3)} className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-400 hover:text-slate-600">
                                        <ChevronRight size={11} className={`transition-transform duration-200 ${open3 ? "rotate-90" : ""}`} />
                                      </button>
                                    ) : <span className="w-5" />}
                                    <button
                                      onClick={() => onChange({ level: 3, cat1: c1, cat2: c2, cat3: c3, cat4: "" })}
                                      className={`flex flex-1 items-center justify-between rounded-md px-1.5 py-1 text-left text-xs transition-all ${is3 && filter.level === 3 ? "bg-emerald-50 font-medium text-emerald-800" : is3 ? "text-emerald-600" : "text-slate-500 hover:bg-slate-50"}`}
                                    >
                                      <span className="line-clamp-1">{c3}</span>
                                      <span className="ml-1 shrink-0 text-slate-400">{node3.count}</span>
                                    </button>
                                  </div>
                                  {open3 && hasChildren3 && (
                                    <div className="ml-2.5 border-l border-slate-100 pl-1.5">
                                      {Object.keys(node3.children).sort().map((c4) => {
                                        const node4 = node3.children[c4];
                                        const is4 = is3 && filter.level === 4 && filter.cat4 === c4;
                                        return (
                                          <button
                                            key={c4}
                                            onClick={() => onChange({ level: 4, cat1: c1, cat2: c2, cat3: c3, cat4: c4 })}
                                            className={`flex w-full items-center justify-between rounded px-1.5 py-0.5 text-left text-xs transition-all ${is4 ? "bg-emerald-50 font-medium text-emerald-800" : "text-slate-500 hover:bg-slate-50"}`}
                                          >
                                            <span className="line-clamp-1">{c4}</span>
                                            <span className="ml-1 shrink-0 text-slate-400">{node4.count}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {filter.level > 0 && (
        <button
          onClick={() => onChange({ level: 0, cat1: "", cat2: "", cat3: "", cat4: "" })}
          className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 transition-colors hover:bg-slate-100"
        >
          清除分类筛选
        </button>
      )}
    </div>
  );
}

function FilterGroup({ title, values, active, onChange, vertical = false }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-slate-600">{title}</div>
      <div className={vertical ? "space-y-1.5" : "flex flex-wrap gap-2"}>
        {values.map((value) => vertical ? (
          <button key={value} onClick={() => onChange(value)} className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-all duration-200 ${active === value ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>{value}</button>
        ) : (
          <Chip key={value} active={active === value} onClick={() => onChange(value)}>{value}</Chip>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ item, selected, onClick }) {
  return (
    <button onClick={onClick} className={`w-full rounded-2xl p-4 text-left ring-1 transition-all duration-200 hover:shadow-md ${selected ? "bg-emerald-50 ring-emerald-300 shadow-sm" : "bg-white ring-slate-200 hover:ring-slate-300"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold sm:text-lg">{item.name}</h3>
            <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs text-white">质量 {item.quality}</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-800">{item.source}</span>
          </div>
          <div className="mt-1 truncate text-sm text-slate-500">{item.english}</div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-slate-500">
            {[item.cat1, item.cat2, item.boundary, item.region, item.year].filter(Boolean).map((tag, i) => <span key={tag + i} className="rounded-full bg-slate-100 px-2.5 py-0.5">{tag}</span>)}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-lg font-semibold text-emerald-700 sm:text-xl">{item.footprint}</div>
          <div className="mt-1 text-xs text-slate-400">功能单元：{item.unit}</div>
          <ChevronRight className="ml-auto mt-3 text-slate-300" />
        </div>
      </div>
    </button>
  );
}

function ProductDetail({ selected }) {
  return (
    <aside className="sticky top-20 self-start rounded-3xl bg-slate-950 p-5 text-white">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium tracking-wider text-white/50">产品详情</div>
          <h3 className="mt-1 text-xl font-semibold sm:text-2xl">{selected.name}</h3>
          <div className="mt-1 text-xs text-white/40">{selected.english}</div>
        </div>
        <MapPinned className="text-emerald-300" />
      </div>
      <motion.div key={selected.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
        <div className="text-xs font-medium text-white/50">产品碳足迹</div>
        <div className="mt-1 text-3xl font-semibold text-emerald-300 sm:text-4xl">{selected.footprint}</div>
        <div className="mt-2 text-sm text-white/60">功能单元：{selected.unit}</div>
      </motion.div>
      <div className="mt-4 grid grid-cols-2 gap-2.5 text-sm sm:gap-3">
        <DetailCell label="数据质量" value={`等级 ${selected.quality}`} />
        <DetailCell label="数据来源" value={selected.source} />
        <DetailCell label="核算边界" value={selected.boundary} />
        <DetailCell label="地域代表性" value={selected.region || "—"} />
        <DetailCell label="数据时间" value={selected.year} />
        <DetailCell label="技术代表性" value={selected.tech || "—"} />
      </div>
      <div className="mt-3 rounded-2xl bg-white/8 p-3 text-xs text-white/40">
        <span className="text-white/60">分类：</span>{[selected.cat1, selected.cat2, selected.cat3, selected.cat4].filter(Boolean).join(" › ")}
      </div>
      {selected.desc && <DetailBlock title="产品描述" content={selected.desc} />}
      {selected.stages && <DetailBlock title="生命周期各阶段碳足迹" content={selected.stages} />}
      {selected.process && <DetailBlock title="生产工艺" content={selected.process} />}
      {selected.note && <DetailBlock title="说明" content={selected.note} />}
      {selected.ref && <DetailBlock title="参考文献" content={selected.ref} />}
    </aside>
  );
}

function DetailCell({ label, value }) {
  return <div className="rounded-2xl bg-white/8 p-3 sm:p-4"><div className="text-xs text-white/45">{label}</div><div className="mt-1 text-sm font-semibold">{value}</div></div>;
}

function DetailBlock({ title, content }) {
  return <div className="mt-4 rounded-2xl bg-white/8 p-4 ring-1 ring-white/10"><div className="mb-2 text-sm font-semibold text-emerald-200">{title}</div><p className="text-sm leading-7 text-white/70">{content}</p></div>;
}

function HubPage() {
  useScrollTop("hub");
  const modelCards = [
    { name: "中国电网排放因子模型", owner: "生态环境数据组", tag: "Scope 2", desc: "按年度、区域电网、是否含线损等参数组织的外购电力排放因子模型。", stars: 128, forks: 34, version: "v2024.1", status: "官方优先" },
    { name: "商务旅行排放因子模型", owner: "交通碳核算社区", tag: "Scope 3 Cat.6", desc: "覆盖飞机、高铁、地铁、网约车等出行方式，支持p·km与行程数据换算。", stars: 96, forks: 21, version: "v0.3.2", status: "社区共建" },
    { name: "废弃物处理LCA模型", owner: "固废方法学小组", tag: "Scope 3 Cat.5", desc: "按填埋、焚烧、回收、堆肥等处理方式构建，保留文献来源和审查记录。", stars: 72, forks: 18, version: "v0.1.8", status: "互审中" },
    { name: "钢铁产品碳足迹模型", owner: "材料LCA实验室", tag: "Cat.1 原材料", desc: "区分高炉-转炉、电炉等技术路线，用于外购产品和供应链核算。", stars: 154, forks: 41, version: "v1.0.0", status: "稳定版" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0f172a,#064e3b)] text-white">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <motion.div variants={stagger} initial="initial" animate="animate">
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-emerald-200 ring-1 ring-white/15"><Network size={16} /> LCA-Hub Open Models</motion.div>
            <motion.h1 variants={fadeUp} className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">面向LCA模型和碳因子的开源协作平台</motion.h1>
            <motion.p variants={fadeUp} className="mt-5 max-w-3xl text-sm leading-8 text-white/70">参考 GitHub 架构，每个模型都是一个独立仓库。机构、研究者、企业和志愿者可以发布模型，其他人可以提 Issue、提交 Pull Request、参与互审、Fork 复用和追踪版本。</motion.p>
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3">
              <button
                className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-300 active:scale-[0.98]"
                onClick={() => {
                  window.location.href = "/hub/publish";
                }}
              >
                发布模型
              </button>
              <button className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition-all hover:bg-white/15 active:scale-[0.98]">发起更新请求</button>
              <button className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition-all hover:bg-white/15 active:scale-[0.98]">浏览开源模型</button>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/15 sm:p-5">
            <div className="rounded-2xl bg-slate-950 p-4 ring-1 ring-white/10 sm:p-5">
              <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-medium tracking-wider text-white/50">Repository</div>
                  <div className="mt-1 text-lg font-semibold sm:text-xl">transport-business-travel-cn</div>
                </div>
                <span className="w-fit rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200 ring-1 ring-emerald-300/20">Public</span>
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <RepoMetric icon={Star} label="Stars" value="96" color="text-amber-300" />
                <RepoMetric icon={GitBranch} label="Forks" value="21" color="text-blue-300" />
                <RepoMetric icon={ClipboardCheck} label="PRs" value="8" color="text-emerald-300" />
              </div>
              <div className="mt-4 rounded-2xl bg-white/8 p-4 text-sm leading-7 text-white/65">README：本模型用于中国企业Scope 3 Cat.6商务旅行核算，支持航空、高铁、出租车、地铁等出行活动数据换算。</div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mt-6 flex flex-wrap gap-1.5 overflow-x-auto rounded-3xl bg-white p-2 shadow-sm ring-1 ring-slate-200 sm:gap-2 sm:p-3">
        {["Explore", "Models", "Issues", "Pull Requests", "Docs"].map((tab, index) => (
          <button key={tab} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 sm:px-5 sm:py-2.5 ${index === 0 ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>{tab}</button>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <h2 className="text-lg font-semibold sm:text-xl">开源模型分类</h2>
            <div className="mt-5 space-y-1.5 text-sm">
              {["产品碳足迹模型", "企业排放因子模型", "Scope 3 计算模型", "运输与物流模型", "能源与电力模型", "废弃物处理模型", "材料与工业品模型"].map((item, index) => (
                <button key={item} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all duration-200 ${index === 0 ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                  <span>{item}</span><ChevronRight size={16} className={index === 0 ? "" : "text-slate-400"} />
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100 sm:p-6">
            <h2 className="text-lg font-semibold text-emerald-950 sm:text-xl">平台规则</h2>
            <p className="mt-3 text-sm leading-7 text-emerald-900/75">所有模型必须公开核心字段、数据来源、适用边界、版本记录和贡献者信息。模型可以被复用、Fork、评论和提交更新，但正式发布需通过质量闸口。</p>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input placeholder="搜索模型、因子、Scope、Category、行业或贡献者" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-emerald-500 focus:bg-white" />
            </div>
            <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98]">New Repository</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {modelCards.map((model, index) => (
              <motion.div
                key={model.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <ModelCard model={model} />
              </motion.div>
            ))}
          </div>
        </section>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {[
          ["Repository", "每个LCA模型/因子模型都是一个独立仓库，包含数据、方法学、版本、问题和贡献记录。"],
          ["Issue", "用于提交缺失因子、数据错误、边界争议、单位换算问题和方法学讨论。"],
          ["Pull Request", "贡献者通过PR提交新因子、修订参数、补充文献、完善方法学摘要。"],
          ["Release", "每次正式发布形成版本号，可回溯历史数据、更新原因和审核记录。"],
        ].map(([title, desc], index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md sm:p-6"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-emerald-300 sm:h-11 sm:w-11">{index + 1}</div>
            <h3 className="text-base font-semibold sm:text-lg">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">{desc}</p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}

function RepoMetric({ icon: Icon, label, value, color }) {
  return <div className="rounded-2xl bg-white/8 p-3 sm:p-4"><Icon className={`mb-2 ${color}`} size={18} />{value} {label}</div>;
}

function ModelCard({ model }) {
  return (
    <div className="group rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:shadow-lg hover:ring-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{model.name}</h3>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-100">{model.status}</span>
          </div>
          <div className="mt-1 text-sm text-slate-500">{model.owner} · {model.tag}</div>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{model.version}</span>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">{model.desc}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 transition-colors group-hover:bg-amber-50 group-hover:text-amber-700"><Star size={14} />{model.stars}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1"><GitBranch size={14} />{model.forks}</span>
        <span className="rounded-full bg-slate-50 px-3 py-1">README</span>
        <span className="rounded-full bg-slate-50 px-3 py-1">Issues</span>
        <span className="rounded-full bg-slate-50 px-3 py-1">Pull Requests</span>
      </div>
    </div>
  );
}

function NoticePage() {
  useScrollTop("notice");
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">重要说明</h1>
        <div className="mt-6 space-y-8 text-sm leading-8 text-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">1.CPCD免责声明</h2>
            <p>（1）中国产品全生命周期温室气体排放系数库（以下简称“CPCD”）不对数据可能产生、引起的纠纷承担任何责任。</p>
            <p>（2）数据使用者通过CPCD平台检索或引用产品碳足迹数据，即表明已知悉前述CPCD数据声明，因使用该等数据产生任何纠纷，与CPCD无关。</p>
            <p className="text-slate-500">作者：中国城市温室气体工作组</p>
            <p className="text-slate-500">时间：2023.09.19 00:40:46</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">2.关于数据共建、修改、补充和下载的说明</h2>
            <p><span className="font-semibold">Q：</span>发现词条信息有错误或者需要补充修改，如何操作？</p>
            <p><span className="font-semibold">A：</span>您可以在产品详情页，选择“我要修改”，并填写修改内容和修改理由（理由越具体越详细越好），再点击提交即可。我们会在后台审核后，修正该词条。</p>
            <p><span className="font-semibold">Q：</span>为什么提的意见或者问题没有被采纳？</p>
            <p><span className="font-semibold">A：</span>有两种情况，一是您的用户名未修改为真实姓名；二是您提交的修改内容和理由不充分，未诠释清楚。若您觉得需要进一步沟通和解释，可以通过邮件与我们联系，需要您将产品名称、产品ID、需要修改的内容以及支持材料（如文献、报告等），一并发送至ghglca@163.com。</p>
            <p><span className="font-semibold">Q：</span>若我有新的产品排放因子数据，如何提交？</p>
            <p><span className="font-semibold">A：</span>请您将您的用户名修改为真实姓名，并在前台的“数据共建”页面上传相关内容。</p>
            <p><span className="font-semibold">Q：</span>如何下载数据？</p>
            <p><span className="font-semibold">A：</span>目前下载功能只针对VIP用户开放。若您想成为VIP用户，可积极参与“数据共建”，当您提交的新词条的数量超过30条，即可成为VIP用户。</p>
            <p><span className="font-semibold">Q：</span>平台数据之后会更新吗？</p>
            <p><span className="font-semibold">A：</span>CPCD平台会持续补充、修改词条信息和数据。每月月初会将上月修改情况以邮件形式发至您邮箱，若您未收到该邮件，请检查您的用户信息中填写的邮箱是否正确。若无误，请您检查是否将ghglca@163.com或ghglca@vip.163.com发送的邮件识别为垃圾邮件。</p>
            <p><span className="font-semibold">Q：</span>如果有关于平台建设相关的建议，如何反馈？</p>
            <p><span className="font-semibold">A：</span>您可以将内容发送邮件至ghglca@163.com，我们收到后会及时与您联系。</p>
            <p className="text-slate-500">作者：张哲</p>
            <p className="text-slate-500">时间：2023.03.31 22:58:50</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">3关于建立中国产品全生命周期温室气体排放系数库的说明</h2>
            <p>为方便组织机构、企业和个人准确、便捷、统一地计算碳足迹，中国城市温室气体工作组（CCG）组织54名专业研究人员，无偿、志愿地建设中国产品全生命周期温室气体排放系数集（2022）并且全部公开。核算、计量和评估产品全生命周期温室气体排放，对于从消费端管理温室气体排放和基于产业链推动碳减排具有重要的意义，也是推动中国实现碳达峰碳中和重要数据支撑。</p>
            <p>建立完全公开、透明、动态更新且覆盖较全面的中国产品温室气体排放系数集是一项非常艰巨的基础性工作。中国城市温室气体工作组（CCG）是一个志愿性组织，自2017年成立以来，大量研究人员志愿、无偿工作地建设中国2005-2020年城市温室气体排放清单，初见成效。</p>
            <p>中国产品全生命周期温室气体排放系数集是中国城市温室气体工作组一项重要、长期的工作目标和成果。本版数据集是第一期成果，初步实现可以持续更新迭代的数据初始版本，错误在所难免，且存在一些较为显著的内在逻辑矛盾（例如由于数据来源不同，一条完整生产链条中的不同阶段产品的排放系数可能存在不一致）。</p>
            <p>我们希望社会各界不因我们是志愿团队而降低对我们的要求。相反，我们希望能得到更加严苛的要求，我们也承诺会不断验证、校对数据并持续更新，并且建立数据平台（http://lca.cityghg.com/）。我们更加希望批评者本人能加入中国城市温室气体工作组，加入到数据建设（http://lca.cityghg.com/，实名注册即可），把自己对基础数据的苛求和期望付诸实践，成为中国产品全生命周期温室气体排放系数的建设者、监督者和长期批评者。</p>
            <p className="text-slate-500">作者：蔡博峰</p>
            <p className="text-slate-500">时间：2023.03.21 19:25:35</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function PrivacyPage() {
  useScrollTop("privacy");
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">隐私策略</h1>
        <div className="mt-6 space-y-6 text-sm leading-8 text-slate-700">
          <p>欢迎访问我们的网站。我们深知您的隐私对您的重要性，因此我们致力于保护您个人信息的隐私和安全。请仔细阅读以下关于我们隐私策略的详细说明：</p>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">1. 信息收集与使用</h2>
            <p>在您使用我们网站的过程中，我们可能会收集一些您自愿提供的个人信息，例如您的姓名、电子邮件地址等。这些信息将被用于与您进行联系、提供服务以及改善我们的网站。我们承诺不会出售、出租或分享您的个人信息给第三方。</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">2. Cookie技术的使用</h2>
            <p>为提供个性化的用户体验，我们可能使用Cookie技术。这些Cookie将保存在您的浏览器中，用于识别您的身份和记录偏好。您可以通过浏览器设置随时选择拒绝或删除Cookie。</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">3. 邮件通讯</h2>
            <p>如果您选择订阅我们的邮件通讯服务，我们可能会向您发送与我们服务和产品相关的信息。您可以随时选择取消订阅，我们将尊重您的选择。</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">4. 信息安全</h2>
            <p>我们采取了一系列合理的安全措施，以保护您的个人信息免受未经授权的访问、披露、更改或销毁。</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">5. 外部链接</h2>
            <p>我们的网站可能包含指向第三方网站的链接，但请注意，我们对这些网站的隐私做法不负任何责任。在访问这些链接之前，请仔细阅读它们的隐私策略。</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">6. 未成年人隐私</h2>
            <p>我们不会故意收集未满18岁的未成年人的个人信息。如果您是未成年人，请在父母或监护人的指导下使用我们的服务。</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">7. 隐私政策的修改</h2>
            <p>我们保留随时修改本隐私政策的权利。在进行重大更改时，我们将在网站上发布通知。</p>
          </div>

          <p>通过使用我们的网站，即表示您同意本隐私策略。如果您对我们的隐私策略有任何疑问或疑虑，请随时联系我们。感谢您对我们隐私策略的关注。</p>
        </div>
      </section>
    </main>
  );
}

function RoadmapPage() {
  useScrollTop("roadmap");
  const workflowSteps = [
    ["需求识别", "围绕企业披露、Scope 3核算和高频查询需求，形成待建设因子清单。", Search],
    ["来源判定", "优先判断是否已有官方发布、CPCD文献线索、行业数据或需专家补充。", GitBranch],
    ["任务拆解", "将检索、整理、计算、方法学摘要、互审拆成可认领的小任务。", ClipboardCheck],
    ["质量把关", "通过字段完整性、单位一致性、双人互审、核心审核和来源透明控制质量。", ShieldCheck],
    ["版本发布", "按版本号发布数据、方法学说明、更新日志和争议处理记录。", RefreshCw],
  ];

  const mvpFields = [
    ["因子名称", "标准化命名，便于检索和归类", "国内航空飞行排放因子"],
    ["GHG Protocol范围", "Scope 1 / Scope 2 / Scope 3", "Scope 3"],
    ["Category", "Scope 3需细分到具体类别", "Cat.6 商务旅行"],
    ["活动数据单位", "用户实际填报的活动数据单位", "人·公里"],
    ["CO₂e因子数值", "平台计算和展示的核心数据", "0.15"],
    ["CO₂e因子单位", "明确结果量纲，避免误用", "kg CO₂e/人·公里"],
    ["数据来源", "来源机构、文献名称、年份、链接", "研究机构工作论文，2024"],
    ["方法学摘要", "200字以内说明数据如何得到", "基于统计数据和文献参数测算"],
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#022c22,#0f172a)] text-white">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <motion.div variants={stagger} initial="initial" animate="animate">
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-emerald-200 ring-1 ring-white/15"><Route size={16} /> 因子库建设工作台</motion.div>
            <motion.h1 variants={fadeUp} className="text-3xl font-semibold leading-tight sm:text-4xl">把建设原则落成可操作页面</motion.h1>
            <motion.p variants={fadeUp} className="mt-4 max-w-3xl text-sm leading-8 text-white/65">该页面围绕"因子从哪里来、谁来建、怎么审、如何发布、如何持续更新"设计，形成需求池、字段模板、任务看板、质量闸口、版本发布和反馈迭代。</motion.p>
          </motion.div>
          <motion.div variants={stagger} initial="initial" animate="animate" className="grid gap-3 sm:grid-cols-2">
            <StatCard dark icon={Database} label="最小字段模板" value="8项" note="保证先能用、能查、能追溯。" delay={0.1} />
            <StatCard dark icon={ShieldCheck} label="质量控制闸口" value="6类" note="字段、单位、来源、互审、审核、版本留痕。" delay={0.2} />
          </motion.div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <h2 className="text-xl font-semibold sm:text-2xl">一、因子需求池</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">把"企业需要什么因子"作为入口，自动归入Scope、Category、活动数据类型和紧急程度。</p>
          <div className="mt-5 space-y-2.5">
            {[
              ["待补充", "Scope 3 Cat.5 废弃物处理", "高频但来源分散", "bg-amber-50 text-amber-700 ring-amber-200"],
              ["待互审", "Scope 3 Cat.6 商务旅行", "数据来源集中", "bg-blue-50 text-blue-700 ring-blue-200"],
              ["可发布", "Scope 2 外购电力", "官方年度更新", "bg-emerald-50 text-emerald-700 ring-emerald-200"],
              ["需专家", "资本商品 EEIO 因子", "方法学待确认", "bg-purple-50 text-purple-700 ring-purple-200"],
            ].map(([status, name, note, colors]) => (
              <motion.div
                key={name}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100"
              >
                <div>
                  <div className="font-medium text-slate-900">{name}</div>
                  <div className="mt-1 text-xs text-slate-500">{note}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${colors}`}>{status}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <h2 className="text-xl font-semibold sm:text-2xl">二、因子建设流程</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-5 sm:gap-4">
            {workflowSteps.map(([title, desc, Icon], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-slate-50 p-4 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-emerald-300">
                  <Icon size={18} />
                </div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">三、因子录入模板</h2>
            <p className="mt-2 text-sm text-slate-500">提供可填报、可校验、可入库的标准模板。</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white transition-all hover:bg-slate-800 active:scale-[0.98]"><ClipboardCheck size={16} /> 新建因子条目</button>
        </div>
        <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3 font-medium">必填字段</th><th className="px-4 py-3 font-medium">页面校验规则</th><th className="px-4 py-3 font-medium">示例值</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{mvpFields.map((row) => <tr key={row[0]} className="transition-colors hover:bg-slate-50/80"><td className="px-4 py-3 font-medium text-slate-800">{row[0]}</td><td className="px-4 py-3 text-slate-600">{row[1]}</td><td className="px-4 py-3 text-slate-500">{row[2]}</td></tr>)}</tbody>
          </table>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">四、第一期覆盖类别</h2>
        <div className="mt-5 overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3 font-medium">数据类别</th><th className="px-4 py-3 font-medium">范围/类别</th><th className="px-4 py-3 font-medium">核心单位</th><th className="px-4 py-3 font-medium">主要来源逻辑</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{factorCategories.map((row) => <tr key={row[0]} className="transition-colors hover:bg-slate-50/80">{row.map((cell) => <td key={cell} className="px-4 py-3 text-slate-700">{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </motion.section>
    </main>
  );
}

export default function CPCDWebsitePrototype() {
  const [active, setActive] = useState("home");
  return (
    <PageShell active={active} setActive={setActive}>
      {active === "home" && <HomePage setActive={setActive} />}
      {active === "news" && <NewsPage />}
      {active === "notice" && <NoticePage />}
      {active === "privacy" && <PrivacyPage />}
      {active === "library" && <LibraryPage />}
      {active === "hub" && <HubPage />}
      {active === "roadmap" && <RoadmapPage />}
    </PageShell>
  );
}
