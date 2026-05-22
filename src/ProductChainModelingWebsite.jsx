import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Network,
  Factory,
  PackageSearch,
  Truck,
  Store,
  Download,
  Wand2,
  Loader2,
  BrainCircuit,
  Recycle,
  CloudCog,
  Save,
  FolderOpen,
  Search,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STAGES = ["原材料获取", "材料与零部件生产", "产品制造", "运输分销", "使用阶段", "回收处置"];
const INFINITE_ORIGIN = { x: 6000, y: 6000 };

const stageIcons = {
  原材料获取: PackageSearch,
  材料与零部件生产: CloudCog,
  产品制造: Factory,
  运输分销: Truck,
  使用阶段: Store,
  回收处置: Recycle,
};

const chainTemplates = {
  新能源汽车: {
    nodes: [
      { id: "N1", name: "铁矿石/废钢", stage: "原材料获取", carbon: 72 },
      { id: "N2", name: "铝土矿/氧化铝", stage: "原材料获取", carbon: 76 },
      { id: "N3", name: "铜矿/铜精矿", stage: "原材料获取", carbon: 58 },
      { id: "N4", name: "锂镍钴锰资源", stage: "原材料获取", carbon: 82 },
      { id: "N5", name: "石墨/硅碳材料", stage: "原材料获取", carbon: 64 },
      { id: "N6", name: "稀土资源", stage: "原材料获取", carbon: 55 },
      { id: "N7", name: "石油化工原料", stage: "原材料获取", carbon: 62 },
      { id: "N8", name: "天然/合成橡胶", stage: "原材料获取", carbon: 48 },
      { id: "N9", name: "石英砂/纯碱", stage: "原材料获取", carbon: 44 },
      { id: "N10", name: "汽车板/高强钢", stage: "材料与零部件生产", carbon: 78, producer: "示例钢铁企业", productName: "汽车板", modelNumber: "HC340LA" },
      { id: "N11", name: "铝合金结构件", stage: "材料与零部件生产", carbon: 70 },
      { id: "N12", name: "铜材/高压线束", stage: "材料与零部件生产", carbon: 52 },
      { id: "N13", name: "正极/负极材料", stage: "材料与零部件生产", carbon: 68 },
      { id: "N14", name: "电解液/隔膜", stage: "材料与零部件生产", carbon: 50 },
      { id: "N15", name: "稀土永磁材料", stage: "材料与零部件生产", carbon: 46 },
      { id: "N16", name: "塑料内外饰件", stage: "材料与零部件生产", carbon: 42 },
      { id: "N17", name: "轮胎", stage: "材料与零部件生产", carbon: 40 },
      { id: "N18", name: "汽车玻璃", stage: "材料与零部件生产", carbon: 38 },
      { id: "N19", name: "动力电池系统", stage: "材料与零部件生产", carbon: 72 },
      { id: "N20", name: "电机系统", stage: "材料与零部件生产", carbon: 44 },
      { id: "N21", name: "电控/车规芯片", stage: "材料与零部件生产", carbon: 48 },
      { id: "N22", name: "车身与底盘总成", stage: "产品制造", carbon: 58 },
      { id: "N23", name: "新能源汽车整车", stage: "产品制造", carbon: 64, isCore: true, producer: "示例车企", productName: "新能源汽车整车", modelNumber: "EV-2026" },
      { id: "N24", name: "整车物流交付", stage: "运输分销", carbon: 28 },
      { id: "N25", name: "车辆使用/充电", stage: "使用阶段", carbon: 32 },
      { id: "N26", name: "电池回收", stage: "回收处置", carbon: 22 },
      { id: "N27", name: "整车拆解回收", stage: "回收处置", carbon: 18 },
    ],
    links: [
      { from: "N1", to: "N10", type: "钢铁原料" },
      { from: "N2", to: "N11", type: "铝材原料" },
      { from: "N3", to: "N12", type: "铜材原料" },
      { from: "N4", to: "N13", type: "电池金属" },
      { from: "N5", to: "N13", type: "负极材料" },
      { from: "N4", to: "N14", type: "电池材料" },
      { from: "N6", to: "N15", type: "稀土材料" },
      { from: "N7", to: "N16", type: "化工材料" },
      { from: "N8", to: "N17", type: "橡胶材料" },
      { from: "N9", to: "N18", type: "玻璃原料" },
      { from: "N13", to: "N19", type: "电池材料" },
      { from: "N14", to: "N19", type: "电池材料" },
      { from: "N15", to: "N20", type: "电机材料" },
      { from: "N12", to: "N20", type: "铜材配套" },
      { from: "N12", to: "N21", type: "线束配套" },
      { from: "N10", to: "N22", type: "车身材料" },
      { from: "N11", to: "N22", type: "轻量化材料" },
      { from: "N16", to: "N23", type: "内外饰配套" },
      { from: "N17", to: "N23", type: "轮胎配套" },
      { from: "N18", to: "N23", type: "玻璃配套" },
      { from: "N19", to: "N23", type: "动力系统" },
      { from: "N20", to: "N23", type: "驱动系统" },
      { from: "N21", to: "N23", type: "控制系统" },
      { from: "N22", to: "N23", type: "车身底盘" },
      { from: "N23", to: "N24", type: "产品交付" },
      { from: "N24", to: "N25", type: "使用流" },
      { from: "N25", to: "N26", type: "退役电池" },
      { from: "N25", to: "N27", type: "报废整车" },
      { from: "N26", to: "N13", type: "再生金属" },
      { from: "N27", to: "N10", type: "废钢回收" },
      { from: "N27", to: "N11", type: "再生铝" },
    ],
  },
  光伏组件: {
    nodes: [
      { id: "N1", name: "工业硅", stage: "原材料获取", carbon: 76 },
      { id: "N2", name: "多晶硅", stage: "材料与零部件生产", carbon: 72 },
      { id: "N3", name: "硅片", stage: "材料与零部件生产", carbon: 54 },
      { id: "N4", name: "电池片", stage: "产品制造", carbon: 46 },
      { id: "N5", name: "组件封装", stage: "产品制造", carbon: 38, isCore: true },
      { id: "N6", name: "运输安装", stage: "运输分销", carbon: 24 },
      { id: "N7", name: "发电使用", stage: "使用阶段", carbon: 8 },
      { id: "N8", name: "组件回收", stage: "回收处置", carbon: 20 },
    ],
    links: [
      { from: "N1", to: "N2", type: "原料流" },
      { from: "N2", to: "N3", type: "材料流" },
      { from: "N3", to: "N4", type: "部件流" },
      { from: "N4", to: "N5", type: "组件流" },
      { from: "N5", to: "N6", type: "产品流" },
      { from: "N6", to: "N7", type: "使用流" },
      { from: "N7", to: "N8", type: "回收流" },
    ],
  },
  智能手机: {
    nodes: [
      { id: "N1", name: "金属矿物材料", stage: "原材料获取", carbon: 58 },
      { id: "N2", name: "芯片传感器", stage: "材料与零部件生产", carbon: 48 },
      { id: "N3", name: "屏幕摄像模组", stage: "材料与零部件生产", carbon: 42 },
      { id: "N4", name: "电池结构件", stage: "材料与零部件生产", carbon: 38 },
      { id: "N5", name: "整机组装", stage: "产品制造", carbon: 32, isCore: true },
      { id: "N6", name: "渠道运输", stage: "运输分销", carbon: 20 },
      { id: "N7", name: "用户使用", stage: "使用阶段", carbon: 12 },
      { id: "N8", name: "电子废弃物回收", stage: "回收处置", carbon: 18 },
    ],
    links: [
      { from: "N1", to: "N2", type: "材料流" },
      { from: "N1", to: "N3", type: "材料流" },
      { from: "N2", to: "N5", type: "部件流" },
      { from: "N3", to: "N5", type: "部件流" },
      { from: "N4", to: "N5", type: "部件流" },
      { from: "N5", to: "N6", type: "产品流" },
      { from: "N6", to: "N7", type: "使用流" },
      { from: "N7", to: "N8", type: "回收流" },
    ],
  },
};

const initialNodes = chainTemplates["新能源汽车"].nodes;
const initialLinks = chainTemplates["新能源汽车"].links;

function clampNumber(value, fallback = 0) {
  const n = Number(value);
  if (Number.isNaN(n)) return fallback;
  return Math.max(0, Math.min(100, n));
}

function toNonNegativeNumber(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, n);
}

function calcCarbonByFactor(node) {
  const factor = toNonNegativeNumber(node?.emissionFactor, toNonNegativeNumber(node?.carbon, 0));
  const activity = toNonNegativeNumber(node?.activityLevel, 1);
  return Number((factor * activity).toFixed(4));
}

function hydrateNodesWithCarbonCalc(nodes = []) {
  return nodes.map((node) => {
    const emissionFactor = toNonNegativeNumber(node?.emissionFactor, toNonNegativeNumber(node?.carbon, 0));
    const activityLevel = toNonNegativeNumber(node?.activityLevel, 1);
    return {
      ...node,
      emissionFactor,
      activityLevel,
      carbon: Number((emissionFactor * activityLevel).toFixed(4)),
    };
  });
}

function parseFactorValue(input) {
  const text = String(input ?? "");
  const match = text.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const value = Number(match[0]);
  if (!Number.isFinite(value)) return null;
  return Math.max(0, value);
}

function createDefaultPositions(nodeList, linkList = []) {
  const byId = new Map(nodeList.map((node) => [node.id, node]));
  const incoming = new Map();
  const outgoing = new Map();
  nodeList.forEach((node) => {
    incoming.set(node.id, []);
    outgoing.set(node.id, []);
  });
  linkList.forEach((link) => {
    if (!byId.has(link.from) || !byId.has(link.to)) return;
    incoming.get(link.to).push(link.from);
    outgoing.get(link.from).push(link.to);
  });

  const stageBuckets = STAGES.map((stage) => nodeList.filter((node) => node.stage === stage));
  const yMap = new Map();
  const rowGap = 112;
  const baseY = 80;
  const scoreMap = new Map();

  // Forward pass: align each stage by predecessor center to reduce crossings.
  stageBuckets.forEach((bucket) => {
    const sorted = [...bucket].sort((a, b) => {
      const aIns = incoming.get(a.id) || [];
      const bIns = incoming.get(b.id) || [];
      const avgPred = (ids) => {
        const ys = ids.map((id) => yMap.get(id)).filter((y) => typeof y === "number");
        if (!ys.length) return Number.POSITIVE_INFINITY;
        return ys.reduce((sum, y) => sum + y, 0) / ys.length;
      };
      const aScore = avgPred(aIns);
      const bScore = avgPred(bIns);
      if (aScore === bScore) return a.name.localeCompare(b.name, "zh-CN");
      return aScore - bScore;
    });
    sorted.forEach((node, index) => {
      const y = baseY + index * rowGap;
      yMap.set(node.id, y);
      scoreMap.set(node.id, y);
    });
  });

  // Backward pass: nudge ordering by successor alignment, preserving flow order.
  for (let stageIndex = stageBuckets.length - 2; stageIndex >= 0; stageIndex -= 1) {
    const bucket = stageBuckets[stageIndex];
    const rescored = [...bucket].map((node) => {
      const outs = outgoing.get(node.id) || [];
      const ys = outs.map((id) => scoreMap.get(id)).filter((y) => typeof y === "number");
      const nextScore = ys.length ? ys.reduce((sum, y) => sum + y, 0) / ys.length : scoreMap.get(node.id) || 0;
      return { node, score: nextScore };
    }).sort((a, b) => a.score - b.score || a.node.name.localeCompare(b.node.name, "zh-CN"));
    rescored.forEach((item, index) => {
      const y = baseY + index * rowGap;
      yMap.set(item.node.id, y);
      scoreMap.set(item.node.id, y);
    });
  }

  return Object.fromEntries(
    nodeList.map((node) => {
      const stageIndex = Math.max(0, STAGES.indexOf(node.stage));
      return [
        node.id,
        {
          x: INFINITE_ORIGIN.x + 64 + stageIndex * 250,
          y: INFINITE_ORIGIN.y + (yMap.get(node.id) ?? 120),
        },
      ];
    })
  );
}

function normalizeCoreNode(nodes, productName) {
  const target = String(productName || "").trim();
  if (!nodes?.length) return nodes || [];
  const normalized = nodes.map((node) => ({ ...node, isCore: false }));
  const findByName = normalized.findIndex((node) => String(node.name || "").includes(target));
  const findByProductName = normalized.findIndex((node) => String(node.productName || "").includes(target));
  const findByStage = normalized.findIndex((node) => node.stage === "产品制造");
  const coreIndex = findByName >= 0 ? findByName : (findByProductName >= 0 ? findByProductName : (findByStage >= 0 ? findByStage : 0));
  normalized[coreIndex].isCore = true;
  if (target) {
    normalized[coreIndex].name = target;
    normalized[coreIndex].productName = target;
  }
  return normalized;
}

function inputClass() {
  return "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100";
}

function Field({ label, children }) {
  return (
    <label className="space-y-1.5 text-sm">
      <div className="font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}

function generateFallbackChain(productName) {
  const product = productName.trim() || "目标产品";
  return {
    nodes: [
      { id: "N1", name: `${product}原材料`, stage: "原材料获取", carbon: 60 },
      { id: "N2", name: `${product}零部件`, stage: "材料与零部件生产", carbon: 52 },
      { id: "N3", name: `${product}制造`, stage: "产品制造", carbon: 48, isCore: true },
      { id: "N4", name: `${product}运输`, stage: "运输分销", carbon: 30 },
      { id: "N5", name: `${product}使用`, stage: "使用阶段", carbon: 36 },
      { id: "N6", name: `${product}回收`, stage: "回收处置", carbon: 24 },
    ],
    links: [
      { from: "N1", to: "N2", type: "原料流" },
      { from: "N2", to: "N3", type: "部件流" },
      { from: "N3", to: "N4", type: "产品流" },
      { from: "N4", to: "N5", type: "使用流" },
      { from: "N5", to: "N6", type: "回收流" },
    ],
  };
}

function ChainMap({
  nodes,
  links,
  selectedStage,
  onRemoveNode,
  nodePositions,
  setNodePositions,
  newNode,
  setNewNode,
  addNode,
  newLink,
  setNewLink,
  addLink,
  onEditNode,
  factorOptions,
  enterpriseName,
  setEnterpriseName,
  productInput,
  setProductInput,
  modelNumber,
  setModelNumber,
  currentModelName,
}) {
  const filteredNodes = selectedStage === "全部" ? nodes : nodes.filter((node) => node.stage === selectedStage);
  const visibleIds = new Set(filteredNodes.map((node) => node.id));
  const visibleLinks = links.filter((link) => visibleIds.has(link.from) && visibleIds.has(link.to));
  const [pan, setPan] = useState({ x: -INFINITE_ORIGIN.x + 120, y: -INFINITE_ORIGIN.y + 120 });
  const [canvasDragging, setCanvasDragging] = useState(false);
  const [nodeDragging, setNodeDragging] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, panX: 0, panY: 0, nodeX: 0, nodeY: 0 });
  const viewportRef = useRef(null);

  const canvasWidth = 12000;
  const canvasHeight = 12000;
  const nodeSize = 86;
  const nodeRadius = nodeSize / 2;

  const positions = useMemo(() => {
    const fallback = createDefaultPositions(filteredNodes, visibleLinks);
    return Object.fromEntries(filteredNodes.map((node) => [node.id, nodePositions?.[node.id] || fallback[node.id] || { x: 120, y: 160 }]));
  }, [filteredNodes, visibleLinks, nodePositions]);

  const graphCenter = useMemo(() => {
    if (!filteredNodes.length) return { x: INFINITE_ORIGIN.x, y: INFINITE_ORIGIN.y };
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    filteredNodes.forEach((node) => {
      const pos = positions[node.id] || { x: INFINITE_ORIGIN.x, y: INFINITE_ORIGIN.y };
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x + nodeSize);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y + nodeSize);
    });
    return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  }, [filteredNodes, positions, nodeSize]);

  function setZoomKeepingGraphCenter(nextZoom) {
    const viewport = viewportRef.current;
    if (!viewport) {
      setZoom(nextZoom);
      return;
    }
    const cx = viewport.clientWidth / 2;
    const cy = viewport.clientHeight / 2;
    setZoom(nextZoom);
    setPan({
      x: cx - graphCenter.x * nextZoom,
      y: cy - graphCenter.y * nextZoom,
    });
  }

  function startCanvasDrag(event) {
    if (event.button !== 0) return;
    setCanvasDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y, nodeX: 0, nodeY: 0 });
  }

  function startNodeDrag(event, nodeId) {
    event.stopPropagation();
    if (event.button !== 0) return;
    const pos = positions[nodeId] || { x: 0, y: 0 };
    setNodeDragging(nodeId);
    setDragStart({ x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y, nodeX: pos.x, nodeY: pos.y });
  }

  function moveDrag(event) {
    if (nodeDragging) {
      const nextX = dragStart.nodeX + (event.clientX - dragStart.x) / zoom;
      const nextY = dragStart.nodeY + (event.clientY - dragStart.y) / zoom;
      setNodePositions((prev) => ({ ...prev, [nodeDragging]: { x: nextX, y: nextY } }));
      return;
    }
    if (!canvasDragging) return;
    setPan({ x: dragStart.panX + event.clientX - dragStart.x, y: dragStart.panY + event.clientY - dragStart.y });
  }

  function stopDrag() {
    setCanvasDragging(false);
    setNodeDragging(null);
  }

  function resetView() {
    setZoomKeepingGraphCenter(1);
  }

  function zoomIn() {
    const next = Math.min(2, Number((zoom + 0.1).toFixed(2)));
    setZoomKeepingGraphCenter(next);
  }

  function zoomOut() {
    const next = Math.max(0.6, Number((zoom - 0.1).toFixed(2)));
    setZoomKeepingGraphCenter(next);
  }

  function autoLayout() {
    setNodePositions(createDefaultPositions(nodes, links));
  }

  const focusNodeId = nodeDragging || hoveredNode;

  return (
    <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none border-0 bg-slate-950 shadow-2xl" : "rounded-none border border-slate-800 bg-slate-950 shadow-2xl"}>
      <CardContent className="p-2">
        <div className="mb-2 flex flex-col gap-2 px-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold text-white">全生命周期碳排放图谱</div>
            <div className="text-sm text-slate-300">圆形节点可自由拖动，连线自动跟随；绿色节点表示链条核心产品节点</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setIsFullscreen((value) => !value)} className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-950 transition hover:bg-emerald-300">
              {isFullscreen ? <Minimize2 className="mr-1 inline" size={13} /> : <Maximize2 className="mr-1 inline" size={13} />}
              {isFullscreen ? "退出全屏" : "全屏编辑"}
            </button>
            <button type="button" onClick={() => setActivePanel(activePanel === "node" ? null : "node")} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900 transition hover:bg-slate-100">+ 添加节点</button>
            <button type="button" onClick={() => setActivePanel(activePanel === "link" ? null : "link")} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/20">+ 添加流向</button>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">{filteredNodes.length} 个碳节点 · {visibleLinks.length} 条流向</div>
            <button type="button" onClick={zoomOut} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/20"><ZoomOut className="mr-1 inline" size={13} />缩小</button>
            <button type="button" onClick={zoomIn} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/20"><ZoomIn className="mr-1 inline" size={13} />放大</button>
            <button type="button" onClick={autoLayout} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/20">自动排布</button>
            <button type="button" onClick={resetView} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/20">复位</button>
          </div>
        </div>

        <div className="mb-2 rounded-2xl border border-white/15 bg-white/10 p-3 text-white">
          <div className="mb-2 text-sm font-semibold text-white">当前模型命名</div>
          <div className="grid gap-2 md:grid-cols-3">
            <Field label="企业名称">
              <input
                className={inputClass()}
                value={enterpriseName}
                onChange={(event) => setEnterpriseName(event.target.value)}
                placeholder="请输入企业名称"
              />
            </Field>
            <Field label="产品名称">
              <input
                className={inputClass()}
                value={productInput}
                onChange={(event) => setProductInput(event.target.value)}
                placeholder="请输入产品名称"
              />
            </Field>
            <Field label="型号">
              <input
                className={inputClass()}
                value={modelNumber}
                onChange={(event) => setModelNumber(event.target.value)}
                placeholder="请输入产品型号"
              />
            </Field>
          </div>
          <div className="mt-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-emerald-300">
            模型名称：{currentModelName}
          </div>
        </div>

        <div
          ref={viewportRef}
          className={isFullscreen ? "relative h-[calc(100vh-72px)] overflow-hidden border border-slate-800 bg-slate-900" : "relative h-[860px] overflow-hidden border border-slate-800 bg-slate-900"}
          onMouseDown={startCanvasDrag}
          onMouseMove={moveDrag}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onWheel={(event) => {
            if (!event.ctrlKey) return;
            event.preventDefault();
            const next = Math.min(2, Math.max(0.6, Number((zoom + (event.deltaY < 0 ? 0.05 : -0.05)).toFixed(2))));
            setZoomKeepingGraphCenter(next);
          }}
          style={{ cursor: nodeDragging ? "grabbing" : canvasDragging ? "grabbing" : "grab" }}
        >
          <div className="absolute left-4 top-4 z-20 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">拖动节点调整图谱；拖动空白处移动视图；Ctrl+滚轮缩放</div>

          {activePanel === "node" && (
            <div className="absolute right-4 top-4 z-30 w-[360px] rounded-3xl bg-white p-4 text-slate-900 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="font-semibold">添加碳排放节点</div>
                <button className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500" onClick={() => setActivePanel(null)}>关闭</button>
              </div>
              <div className="space-y-3">
                <Field label="节点名称"><input className={inputClass()} value={newNode.name} onChange={(event) => setNewNode({ ...newNode, name: event.target.value })} placeholder="如：汽车板/高强钢" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="生产企业名称"><input className={inputClass()} value={newNode.producer || ""} onChange={(event) => setNewNode({ ...newNode, producer: event.target.value })} placeholder="如：某某钢铁公司" /></Field>
                  <Field label="产品名称"><input className={inputClass()} value={newNode.productName || ""} onChange={(event) => setNewNode({ ...newNode, productName: event.target.value })} placeholder="如：汽车板" /></Field>
                </div>
                <Field label="产品型号/规格"><input className={inputClass()} value={newNode.modelNumber || ""} onChange={(event) => setNewNode({ ...newNode, modelNumber: event.target.value })} placeholder="如：HC340LA / 1.2mm" /></Field>
                <Field label="生命周期阶段"><select className={inputClass()} value={newNode.stage} onChange={(event) => setNewNode({ ...newNode, stage: event.target.value })}>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></Field>
                <Field label="碳排放因子（支持搜索产品库）">
                  <input
                    list="factor-options"
                    className={inputClass()}
                    value={newNode.factorSearch ?? newNode.emissionFactor}
                    onChange={(event) => {
                      const next = event.target.value;
                      const parsed = parseFactorValue(next);
                      setNewNode({ ...newNode, factorSearch: next, emissionFactor: parsed ?? newNode.emissionFactor });
                    }}
                    placeholder="输入或搜索产品名称/因子"
                  />
                </Field>
                <Field label="活动水平">
                  <input type="number" className={inputClass()} value={newNode.activityLevel ?? 1} onChange={(event) => setNewNode({ ...newNode, activityLevel: event.target.value })} />
                </Field>
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  该阶段碳排放量（自动计算）: {Number((toNonNegativeNumber(newNode.emissionFactor, 0) * toNonNegativeNumber(newNode.activityLevel, 1)).toFixed(4))}
                </div>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <input type="checkbox" checked={!!newNode.isCore} onChange={(event) => setNewNode({ ...newNode, isCore: event.target.checked })} />
                  标记为核心产品节点
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="上游节点"><select className={inputClass()} value={newNode.upstreamId || ""} onChange={(event) => setNewNode({ ...newNode, upstreamId: event.target.value })}><option value="">不选择</option>{nodes.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}</select></Field>
                  <Field label="下游节点"><select className={inputClass()} value={newNode.downstreamId || ""} onChange={(event) => setNewNode({ ...newNode, downstreamId: event.target.value })}><option value="">不选择</option>{nodes.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}</select></Field>
                </div>
                <Button className="w-full rounded-xl bg-slate-900" onClick={() => { addNode(); setActivePanel(null); }}><Plus className="mr-2" size={16} />添加到画布并连接</Button>
              </div>
            </div>
          )}

          {activePanel === "link" && (
            <div className="absolute right-4 top-4 z-30 w-[320px] rounded-3xl bg-white p-4 text-slate-900 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="font-semibold">添加碳流向</div>
                <button className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500" onClick={() => setActivePanel(null)}>关闭</button>
              </div>
              <div className="space-y-3">
                <Field label="上游节点"><select className={inputClass()} value={newLink.from} onChange={(event) => setNewLink({ ...newLink, from: event.target.value })}><option value="">请选择</option>{nodes.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}</select></Field>
                <Field label="下游节点"><select className={inputClass()} value={newLink.to} onChange={(event) => setNewLink({ ...newLink, to: event.target.value })}><option value="">请选择</option>{nodes.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}</select></Field>
                <Field label="流向类型"><input className={inputClass()} value={newLink.type} onChange={(event) => setNewLink({ ...newLink, type: event.target.value })} /></Field>
                <Button className="w-full rounded-xl bg-slate-900" onClick={() => { addLink(); setActivePanel(null); }}><Plus className="mr-2" size={16} />连接节点</Button>
              </div>
            </div>
          )}

          {activePanel === "edit" && editingNode && (
            <div className="absolute right-4 top-4 z-30 w-[360px] rounded-3xl bg-white p-4 text-slate-900 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="font-semibold">编辑节点</div>
                <button
                  className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500"
                  onClick={() => {
                    setActivePanel(null);
                    setEditingNode(null);
                  }}
                >
                  关闭
                </button>
              </div>
              <div className="space-y-3">
                <Field label="节点名称"><input className={inputClass()} value={editingNode.name || ""} onChange={(event) => setEditingNode({ ...editingNode, name: event.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="生产企业名称"><input className={inputClass()} value={editingNode.producer || ""} onChange={(event) => setEditingNode({ ...editingNode, producer: event.target.value })} /></Field>
                  <Field label="产品名称"><input className={inputClass()} value={editingNode.productName || ""} onChange={(event) => setEditingNode({ ...editingNode, productName: event.target.value })} /></Field>
                </div>
                <Field label="产品型号/规格"><input className={inputClass()} value={editingNode.modelNumber || ""} onChange={(event) => setEditingNode({ ...editingNode, modelNumber: event.target.value })} /></Field>
                <Field label="生命周期阶段"><select className={inputClass()} value={editingNode.stage || "产品制造"} onChange={(event) => setEditingNode({ ...editingNode, stage: event.target.value })}>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></Field>
                <Field label="碳排放因子（支持搜索产品库）">
                  <input
                    list="factor-options"
                    className={inputClass()}
                    value={editingNode.factorSearch ?? editingNode.emissionFactor ?? editingNode.carbon ?? 0}
                    onChange={(event) => {
                      const next = event.target.value;
                      const parsed = parseFactorValue(next);
                      setEditingNode({ ...editingNode, factorSearch: next, emissionFactor: parsed ?? editingNode.emissionFactor });
                    }}
                    placeholder="输入或搜索产品名称/因子"
                  />
                </Field>
                <Field label="活动水平">
                  <input type="number" className={inputClass()} value={editingNode.activityLevel ?? 1} onChange={(event) => setEditingNode({ ...editingNode, activityLevel: event.target.value })} />
                </Field>
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  该阶段碳排放量（自动计算）: {Number((toNonNegativeNumber(editingNode.emissionFactor, toNonNegativeNumber(editingNode.carbon, 0)) * toNonNegativeNumber(editingNode.activityLevel, 1)).toFixed(4))}
                </div>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <input type="checkbox" checked={!!editingNode.isCore} onChange={(event) => setEditingNode({ ...editingNode, isCore: event.target.checked })} />
                  标记为核心产品节点
                </label>
                <Button
                  className="w-full rounded-xl bg-slate-900"
                  onClick={() => {
                    onEditNode({
                      ...editingNode,
                      name: String(editingNode.name || "").trim(),
                      producer: String(editingNode.producer || "").trim(),
                      productName: String(editingNode.productName || "").trim(),
                      modelNumber: String(editingNode.modelNumber || "").trim(),
                      emissionFactor: toNonNegativeNumber(editingNode.emissionFactor, toNonNegativeNumber(editingNode.carbon, 0)),
                      activityLevel: toNonNegativeNumber(editingNode.activityLevel, 1),
                    });
                    setActivePanel(null);
                    setEditingNode(null);
                  }}
                >
                  保存修改
                </Button>
              </div>
            </div>
          )}
          <datalist id="factor-options">
            {factorOptions.map((option) => (
              <option key={option.key} value={option.label} />
            ))}
          </datalist>

          <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)", backgroundSize: "24px 24px" }} />

          <div className="absolute left-0 top-0 origin-top-left" style={{ width: canvasWidth, height: canvasHeight, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
            <svg className="absolute left-0 top-0" width={canvasWidth} height={canvasHeight}>
              <defs>
                <marker id="arrow-carbon" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="rgba(255,255,255,0.72)" />
                </marker>
              </defs>
              {visibleLinks.map((link, index) => {
                const from = positions[link.from];
                const to = positions[link.to];
                if (!from || !to) return null;
                const isFocused = !!focusNodeId && (link.from === focusNodeId || link.to === focusNodeId);
                const hasFocus = !!focusNodeId;
                const x1 = from.x + nodeRadius;
                const y1 = from.y + nodeRadius;
                const x2 = to.x + nodeRadius;
                const y2 = to.y + nodeRadius;
                const dx = x2 - x1;
                const dy = y2 - y1;
                const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                const sx = x1 + (dx / dist) * (nodeRadius - 3);
                const sy = y1 + (dy / dist) * (nodeRadius - 3);
                const ex = x2 - (dx / dist) * (nodeRadius - 3);
                const ey = y2 - (dy / dist) * (nodeRadius - 3);
                const curve = Math.min(90, Math.max(30, dist / 5));
                return (
                  <path
                    key={`${link.from}-${link.to}-${index}`}
                    d={`M ${sx} ${sy} C ${sx + curve} ${sy - curve}, ${ex - curve} ${ey + curve}, ${ex} ${ey}`}
                    fill="none"
                    stroke={isFocused ? "rgba(16,185,129,0.95)" : hasFocus ? "rgba(148,163,184,0.25)" : "rgba(255,255,255,0.62)"}
                    strokeWidth={isFocused ? "3.2" : "2.2"}
                    markerEnd="url(#arrow-carbon)"
                  />
                );
              })}
            </svg>

            {filteredNodes.map((node) => {
              const pos = positions[node.id] || { x: 120, y: 160 };
              const Icon = stageIcons[node.stage] || Network;
              return (
                <div
                  key={node.id}
                  className={`group absolute flex h-[86px] w-[86px] select-none flex-col items-center justify-center rounded-full p-2 text-center text-white shadow-xl ring-2 transition hover:scale-105 hover:shadow-2xl ${node.isCore ? "bg-emerald-500 ring-emerald-200/70 shadow-emerald-500/30" : "bg-slate-900 ring-white/20"}`}
                  style={{ left: pos.x, top: pos.y, cursor: nodeDragging === node.id ? "grabbing" : "grab" }}
                  onMouseDown={(event) => startNodeDrag(event, node.id)}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    setEditingNode({ ...node });
                    setActivePanel("edit");
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode((prev) => (prev === node.id ? null : prev))}
                >
                  <button type="button" onClick={(event) => { event.stopPropagation(); onRemoveNode(node.id); }} className="absolute -right-1 -top-1 rounded-full bg-white p-1 text-slate-500 opacity-0 shadow transition hover:text-slate-900 group-hover:opacity-100" title="删除节点">
                    <Trash2 size={12} />
                  </button>
                  <Icon size={14} className={node.isCore ? "mb-1 text-white" : "mb-1 text-slate-300"} />
                  <div className="line-clamp-2 max-w-[66px] text-[10px] font-semibold leading-3">{node.name}</div>
                  <div className={node.isCore ? "mt-1 text-[9px] font-semibold text-emerald-50" : "mt-1 text-[9px] text-slate-300"}>{node.isCore ? "核心产品" : node.stage.slice(0, 4)}</div>
                  <div className="mt-0.5 text-lg font-bold leading-none">{node.carbon}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductChainModelingWebsite() {
  const [nodes, setNodes] = useState(hydrateNodesWithCarbonCalc(initialNodes));
  const [links, setLinks] = useState(initialLinks);
  const [enterpriseName, setEnterpriseName] = useState("示例企业");
  const [productInput, setProductInput] = useState("新能源汽车");
  const [modelNumber, setModelNumber] = useState("示例型号");
  const [modelStatus, setModelStatus] = useState("输入产品名称后生成图谱，可在画布中继续编辑。");
  const [isMatching, setIsMatching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newNode, setNewNode] = useState({ name: "", stage: "原材料获取", emissionFactor: 50, activityLevel: 1, producer: "", productName: "", modelNumber: "", upstreamId: "", downstreamId: "", isCore: false, factorSearch: "" });
  const [newLink, setNewLink] = useState({ from: "", to: "", type: "碳流向" });
  const [nodePositions, setNodePositions] = useState(createDefaultPositions(hydrateNodesWithCarbonCalc(initialNodes), initialLinks));
  const [factorOptions, setFactorOptions] = useState([]);
  const [savedModels, setSavedModels] = useState([
    {
      id: "M1",
      name: "示例企业-新能源汽车-示例型号产业链排放模型",
      enterprise: "示例企业",
      product: "新能源汽车",
      modelNumber: "示例型号",
      nodeCount: initialNodes.length,
      linkCount: initialLinks.length,
      totalCarbon: initialNodes.reduce((sum, node) => sum + Number(node.carbon || 0), 0),
      updatedAt: "当前示例",
      nodes: hydrateNodesWithCarbonCalc(initialNodes),
      links: initialLinks,
      nodePositions: createDefaultPositions(hydrateNodesWithCarbonCalc(initialNodes), initialLinks),
    },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("/api/products/all");
        const data = await resp.json().catch(() => ({}));
        const items = Array.isArray(data?.items) ? data.items : [];
        const parsed = items
          .map((item) => {
            const factor = parseFactorValue(item?.footprint);
            if (factor === null) return null;
            return {
              key: item?.id || `${item?.name || ""}-${factor}`,
              label: `${item?.name || "未命名"}（${item?.footprint || factor}）`,
              factor,
            };
          })
          .filter(Boolean)
          .slice(0, 800);
        setFactorOptions(parsed);
      } catch {
        setFactorOptions([]);
      }
    })();
  }, []);

  const currentModelName = `${enterpriseName.trim() || "未填写企业"}-${productInput.trim() || "未命名产品"}-${modelNumber.trim() || "未填写型号"}`;

  function matchProductChain() {
    const raw = productInput.trim();
    if (!raw) return;
    setIsMatching(true);
    (async () => {
      try {
        const resp = await fetch("/api/ai/generate-chain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: raw,
            enterpriseName: enterpriseName.trim(),
            modelNumber: modelNumber.trim(),
          }),
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(data.message || "AI 生成失败");
        const result = data?.data;
        if (!result?.nodes?.length || !result?.links?.length) throw new Error("AI 返回数据结构不完整");
        const normalizedNodes = hydrateNodesWithCarbonCalc(normalizeCoreNode(result.nodes, raw));
        setNodes(normalizedNodes);
        setLinks(result.links);
        setNodePositions(createDefaultPositions(normalizedNodes, result.links));
        setModelStatus(`已通过大模型生成“${raw}”碳排放图谱。`);
      } catch (e) {
        const matchedKey = Object.keys(chainTemplates).find((key) => raw.includes(key) || key.includes(raw));
        const result = matchedKey ? chainTemplates[matchedKey] : generateFallbackChain(raw);
        const normalizedNodes = hydrateNodesWithCarbonCalc(normalizeCoreNode(result.nodes, raw));
        setNodes(normalizedNodes);
        setLinks(result.links);
        setNodePositions(createDefaultPositions(normalizedNodes, result.links));
        setModelStatus(`AI 生成失败，已回退本地模板：${e?.message || "未知错误"}`);
      } finally {
        setIsMatching(false);
      }
    })();
  }

  function addNode() {
    if (!newNode.name.trim()) return;
    const id = `N${Date.now().toString().slice(-6)}`;
    const node = {
      id,
      name: newNode.name.trim(),
      stage: newNode.stage,
      emissionFactor: toNonNegativeNumber(newNode.emissionFactor, 0),
      activityLevel: toNonNegativeNumber(newNode.activityLevel, 1),
      carbon: Number((toNonNegativeNumber(newNode.emissionFactor, 0) * toNonNegativeNumber(newNode.activityLevel, 1)).toFixed(4)),
      producer: newNode.producer?.trim() || "",
      productName: newNode.productName?.trim() || "",
      modelNumber: newNode.modelNumber?.trim() || "",
      isCore: !!newNode.isCore,
    };
    setNodes((prev) => {
      if (!node.isCore) return [...prev, node];
      return prev.map((item) => ({ ...item, isCore: false })).concat(node);
    });

    const upstreamPos = newNode.upstreamId ? nodePositions[newNode.upstreamId] : null;
    const downstreamPos = newNode.downstreamId ? nodePositions[newNode.downstreamId] : null;
    let position = {
      x: 120 + STAGES.indexOf(newNode.stage) * 250,
      y: 120 + (nodes.filter((item) => item.stage === newNode.stage).length % 6) * 92,
    };
    if (upstreamPos && downstreamPos) {
      position = { x: (upstreamPos.x + downstreamPos.x) / 2, y: (upstreamPos.y + downstreamPos.y) / 2 + 80 };
    } else if (upstreamPos) {
      position = { x: upstreamPos.x + 210, y: upstreamPos.y + 20 };
    } else if (downstreamPos) {
      position = { x: downstreamPos.x - 210, y: downstreamPos.y + 20 };
    }
    setNodePositions((prev) => ({ ...prev, [id]: position }));

    const nextLinks = [];
    if (newNode.upstreamId) nextLinks.push({ from: newNode.upstreamId, to: id, type: "碳流向" });
    if (newNode.downstreamId) nextLinks.push({ from: id, to: newNode.downstreamId, type: "碳流向" });
    if (nextLinks.length) setLinks((prev) => [...prev, ...nextLinks]);

    setNewNode({ name: "", stage: "原材料获取", emissionFactor: 50, activityLevel: 1, producer: "", productName: "", modelNumber: "", upstreamId: "", downstreamId: "", isCore: false, factorSearch: "" });
  }

  function removeNode(id) {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setLinks((prev) => prev.filter((link) => link.from !== id && link.to !== id));
    setNodePositions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function editNode(updatedNode) {
    if (!updatedNode?.id) return;
    setNodes((prev) => {
      const normalized = prev.map((node) => {
        if (node.id !== updatedNode.id) return node;
        const emissionFactor = toNonNegativeNumber(updatedNode.emissionFactor, toNonNegativeNumber(node.emissionFactor, toNonNegativeNumber(node.carbon, 0)));
        const activityLevel = toNonNegativeNumber(updatedNode.activityLevel, toNonNegativeNumber(node.activityLevel, 1));
        return {
          ...node,
          ...updatedNode,
          emissionFactor,
          activityLevel,
          carbon: Number((emissionFactor * activityLevel).toFixed(4)),
        };
      });
      if (!updatedNode.isCore) return normalized;
      return normalized.map((node) => ({ ...node, isCore: node.id === updatedNode.id }));
    });
    if (updatedNode.stage) {
      setNodePositions((prev) => {
        const current = prev?.[updatedNode.id] || { x: INFINITE_ORIGIN.x + 120, y: INFINITE_ORIGIN.y + 120 };
        const nextStageIndex = Math.max(0, STAGES.indexOf(updatedNode.stage));
        return {
          ...prev,
          [updatedNode.id]: {
            x: INFINITE_ORIGIN.x + 64 + nextStageIndex * 250,
            y: current.y,
          },
        };
      });
    }
  }

  function addLink() {
    if (!newLink.from || !newLink.to || newLink.from === newLink.to) return;
    setLinks((prev) => [...prev, { ...newLink }]);
    setNewLink({ from: "", to: "", type: "碳流向" });
  }

  function saveCurrentModel() {
    const totalCarbon = nodes.reduce((sum, node) => sum + Number(node.carbon || 0), 0);
    const enterprise = enterpriseName.trim() || "未填写企业";
    const product = productInput.trim() || "未命名产品";
    const specification = modelNumber.trim() || "未填写型号";
    const model = {
      id: `M${Date.now()}`,
      name: `${enterprise}-${product}-${specification}`,
      enterprise,
      product,
      modelNumber: specification,
      nodeCount: nodes.length,
      linkCount: links.length,
      totalCarbon,
      updatedAt: new Date().toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
      nodes: JSON.parse(JSON.stringify(nodes)),
      links: JSON.parse(JSON.stringify(links)),
      nodePositions: JSON.parse(JSON.stringify(nodePositions)),
    };
    setSavedModels((prev) => [model, ...prev]);
    setModelStatus(`已保存“${model.name}”。`);
  }

  function loadModel(model) {
    setEnterpriseName(model.enterprise || "");
    setProductInput(model.product);
    setModelNumber(model.modelNumber || "");
    const normalizedNodes = hydrateNodesWithCarbonCalc(normalizeCoreNode(model.nodes, model.product || ""));
    setNodes(normalizedNodes);
    setLinks(model.links);
    setNodePositions(model.nodePositions || createDefaultPositions(normalizedNodes, model.links || []));
    setModelStatus(`已载入“${model.name}”。`);
  }

  function deleteSavedModel(id) {
    setSavedModels((prev) => prev.filter((model) => model.id !== id));
  }

  function exportJson() {
    const data = JSON.stringify({ enterprise: enterpriseName, product: productInput, modelNumber, boundary: "cradle-to-grave", nodes, links, nodePositions, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "life-cycle-carbon-chain-model.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-2 text-white"><Network size={22} /></div>
            <div>
              <div className="text-xl font-bold tracking-tight">产品碳链建模平台</div>
              <div className="text-xs text-slate-500">Cradle-to-Grave Product Carbon Chain Studio</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline" className="rounded-xl" onClick={() => { window.location.href = "/"; }}>
              返回 LCA-Hub
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={saveCurrentModel}><Save className="mr-2" size={16} />保存模型</Button>
            <Button variant="outline" className="rounded-xl" onClick={exportJson}><Download className="mr-2" size={16} />导出碳链</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[360px] overflow-visible bg-slate-950 px-6 py-8 text-white shadow-2xl lg:px-16 lg:py-10">
          <div className="absolute inset-0 opacity-55" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2400&q=80')", backgroundSize: "cover", backgroundPosition: "center right" }} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.98)_0%,rgba(15,23,42,0.88)_42%,rgba(15,23,42,0.42)_78%,rgba(15,23,42,0.18)_100%),radial-gradient(circle_at_18%_28%,rgba(34,197,94,0.28),transparent_30%),radial-gradient(circle_at_78%_38%,rgba(56,189,248,0.28),transparent_34%)]" />
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-5">
            <div className="mt-7 max-w-5xl text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs text-slate-100 shadow-lg backdrop-blur">
                <BrainCircuit size={14} /> 产品大模型自动匹配生命周期碳链
              </div>
              <h1 className="whitespace-nowrap text-3xl font-bold leading-tight tracking-tight md:text-5xl">输入一个产品，生成从摇篮到坟墓的碳排放图谱</h1>
              <p className="mt-3 whitespace-nowrap text-sm leading-7 text-slate-200 md:text-base">
                系统按原材料获取、材料与零部件生产、产品制造、运输分销、使用阶段、回收处置六个阶段，自动生成碳排放节点与碳流向关系。
              </p>
            </div>

            <div className="relative mx-auto mt-14 w-full max-w-5xl text-left">
              <div className="flex items-center gap-3 rounded-full border border-white/25 bg-white/95 p-1.5 pl-6 shadow-2xl backdrop-blur-xl">
                <Search className="shrink-0 text-slate-400" size={20} />
                <input
                  className="min-h-11 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                  value={productInput}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(event) => { setProductInput(event.target.value); setSearchOpen(true); }}
                  onKeyDown={(event) => event.key === "Enter" && matchProductChain()}
                  placeholder="搜索产品名称，如：新能源汽车、光伏组件、智能手机"
                />
                <Button className="h-12 !rounded-full bg-slate-900 px-9" onClick={matchProductChain} disabled={isMatching}>
                  {isMatching ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Wand2 className="mr-2" size={18} />}
                  生成图谱
                </Button>
              </div>
              <div className="mt-3 rounded-xl border border-white/20 bg-slate-900/70 px-4 py-2 text-sm text-emerald-200">
                {modelStatus}
              </div>

              {searchOpen && (
                <div className="absolute left-0 right-0 top-[64px] z-[120] rounded-[1.75rem] border border-white/30 bg-white/95 p-4 text-slate-900 shadow-2xl backdrop-blur-xl">
                  <div className="mb-3 flex items-center justify-between px-1 text-xs font-semibold text-slate-500">
                    <span>常用搜索</span>
                    <button className="rounded-full bg-slate-100 px-2 py-1 text-slate-500 hover:bg-slate-200" onClick={() => setSearchOpen(false)}>关闭</button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {["新能源汽车", "光伏组件", "智能手机", "储能电池", "工业机器人", "动力电池", "风电叶片", "绿色建材", "数据服务器"].map((item) => (
                      <button key={item} onClick={() => { setProductInput(item); setSearchOpen(false); }} className="rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-900 hover:text-white">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        <div className="px-2 py-4">
          <section>
            <ChainMap
              nodes={nodes}
              links={links}
              selectedStage="全部"
              onRemoveNode={removeNode}
              nodePositions={nodePositions}
              setNodePositions={setNodePositions}
              newNode={newNode}
              setNewNode={setNewNode}
              addNode={addNode}
              newLink={newLink}
              setNewLink={setNewLink}
              addLink={addLink}
              onEditNode={editNode}
              factorOptions={factorOptions}
              enterpriseName={enterpriseName}
              setEnterpriseName={setEnterpriseName}
              productInput={productInput}
              setProductInput={setProductInput}
              modelNumber={modelNumber}
              setModelNumber={setModelNumber}
              currentModelName={currentModelName}
            />
          </section>

          <section className="mx-auto mt-6 max-w-7xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xl font-bold text-slate-900"><FolderOpen size={20} />已保存的产业链排放模型</div>
                <div className="mt-1 text-sm text-slate-500">用于保存上方画布生成和调整后的产品生命周期碳排放模型</div>
              </div>
              <Button className="rounded-xl bg-slate-900" onClick={saveCurrentModel}><Save className="mr-2" size={16} />保存当前模型</Button>
            </div>

            <div className="grid gap-4">
              {savedModels.map((model) => (
                <div key={model.id} className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-slate-900">{model.name}</div>
                    <div className="mt-1 text-sm text-slate-500">企业：{model.enterprise || "—"} · 产品：{model.product} · 型号：{model.modelNumber || "—"}</div>
                    <div className="mt-1 text-sm text-slate-500">节点 {model.nodeCount} 个 · 流向 {model.linkCount} 条 · 碳排放指数 {model.totalCarbon}</div>
                    <div className="mt-1 text-xs text-slate-400">保存时间：{model.updatedAt}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" className="rounded-xl" onClick={() => loadModel(model)}>载入</Button>
                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:text-slate-900" onClick={() => deleteSavedModel(model.id)}><Trash2 size={16} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
