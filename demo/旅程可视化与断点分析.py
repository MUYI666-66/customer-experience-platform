"""
╔══════════════════════════════════════════════════════════════╗
║  功能点3: 客户旅程可视化与断点分析                            ║
║  Customer Journey Visualization & Breakpoint Analysis       ║
╚══════════════════════════════════════════════════════════════╝

自动生成客户旅程地图，直观展示每个阶段的触点、用户行为，
并利用分析工具快速识别出体验的薄弱环节和高流失点。
"""
import os
import sys
import io
import time
import json
import random
import numpy as np

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import matplotlib
matplotlib.use("TkAgg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Arc
from matplotlib.font_manager import FontProperties
import matplotlib.ticker as ticker

# ── 配置 ───────────────────────────────────────────────
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei", "PingFang SC",
                                     "Noto Sans CJK SC", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 模拟字体查找
FONT_PATH = None
for fp in ["C:/Windows/Fonts/msyh.ttc",
           "C:/Windows/Fonts/simhei.ttf",
           "C:/Windows/Fonts/msyhbd.ttc"]:
    if os.path.exists(fp):
        FONT_PATH = fp
        break
if FONT_PATH:
    CN_FONT = FontProperties(fname=FONT_PATH, size=12)
    CN_FONT_SM = FontProperties(fname=FONT_PATH, size=10)
    CN_FONT_LG = FontProperties(fname=FONT_PATH, size=14)
    CN_FONT_TITLE = FontProperties(fname=FONT_PATH, size=16)
else:
    CN_FONT = FontProperties(size=12)
    CN_FONT_SM = FontProperties(size=10)
    CN_FONT_LG = FontProperties(size=14)
    CN_FONT_TITLE = FontProperties(size=16)


# ── 模拟客户旅程数据 ──────────────────────────────────

# 定义旅程阶段
STAGES = [
    "认知发现", "信息搜索", "比较评估", "购买办理",
    "使用体验", "客服咨询", "续费/流失"
]

# 每个阶段的触点和行为
TOUCHPOINTS = {
    "认知发现": [
        {"name": "线上广告", "type": "digital", "volume": 450, "satisfaction": 3.8},
        {"name": "朋友推荐", "type": "social", "volume": 320, "satisfaction": 4.2},
        {"name": "营业厅路过", "type": "offline", "volume": 180, "satisfaction": 3.5},
        {"name": "短信营销", "type": "digital", "volume": 250, "satisfaction": 2.8},
    ],
    "信息搜索": [
        {"name": "APP搜索", "type": "digital", "volume": 380, "satisfaction": 3.6},
        {"name": "官网浏览", "type": "digital", "volume": 290, "satisfaction": 3.9},
        {"name": "拨打10086", "type": "phone", "volume": 200, "satisfaction": 3.2},
        {"name": "营业厅咨询", "type": "offline", "volume": 150, "satisfaction": 3.8},
    ],
    "比较评估": [
        {"name": "套餐对比", "type": "digital", "volume": 350, "satisfaction": 3.1},
        {"name": "查看评价", "type": "social", "volume": 200, "satisfaction": 3.5},
        {"name": "咨询客服", "type": "phone", "volume": 180, "satisfaction": 3.3},
        {"name": "亲友咨询", "type": "social", "volume": 140, "satisfaction": 3.9},
    ],
    "购买办理": [
        {"name": "APP在线办理", "type": "digital", "volume": 300, "satisfaction": 3.7},
        {"name": "营业厅办理", "type": "offline", "volume": 160, "satisfaction": 3.5},
        {"name": "电话办理", "type": "phone", "volume": 80, "satisfaction": 3.0},
        {"name": "扫码办理", "type": "digital", "volume": 120, "satisfaction": 3.8},
    ],
    "使用体验": [
        {"name": "套餐使用", "type": "core", "volume": 400, "satisfaction": 3.4},
        {"name": "流量消耗", "type": "core", "volume": 380, "satisfaction": 3.2},
        {"name": "账单查询", "type": "digital", "volume": 250, "satisfaction": 3.8},
        {"name": "增值服务", "type": "digital", "volume": 120, "satisfaction": 3.1},
    ],
    "客服咨询": [
        {"name": "在线客服", "type": "digital", "volume": 280, "satisfaction": 3.3},
        {"name": "10086热线", "type": "phone", "volume": 220, "satisfaction": 3.0},
        {"name": "营业厅咨询", "type": "offline", "volume": 100, "satisfaction": 3.6},
        {"name": "FAQ自助", "type": "digital", "volume": 180, "satisfaction": 3.7},
    ],
    "续费/流失": [
        {"name": "续费提醒", "type": "digital", "volume": 300, "satisfaction": 3.5},
        {"name": "优惠挽留", "type": "phone", "volume": 150, "satisfaction": 3.0},
        {"name": "自动续费", "type": "core", "volume": 280, "satisfaction": 3.9},
        {"name": "携号转网", "type": "offline", "volume": 120, "satisfaction": 2.5},
    ],
}

# 模拟漏斗数据 (从认知到续费的用户转化)
FUNNEL_DATA = [
    ("认知发现", 1000, 1000, "✅"),
    ("信息搜索", 650, 650, "⚠️"),
    ("比较评估", 420, 420, "⚠️"),
    ("购买办理", 280, 280, "🔴"),
    ("使用体验", 250, 250, "✅"),
    ("客服咨询", 180, 180, "⚠️"),
    ("续费/流失", 140, 140, "🔴"),
]

# 薄弱环节分析数据
PAIN_POINTS = [
    {
        "stage": "比较评估",
        "issue": "套餐信息不透明",
        "impact": "高",
        "drop_rate": 35.4,
        "affected_users": "42%的用户在此阶段流失",
        "root_cause": "套餐对比功能复杂，价格展示不清晰",
        "suggestion": "简化套餐对比页面，增加智能推荐和一键比较功能",
    },
    {
        "stage": "购买办理",
        "issue": "办理流程繁琐",
        "impact": "高",
        "drop_rate": 33.3,
        "affected_users": "33%的用户放弃办理",
        "root_cause": "需要填写过多信息，身份验证流程复杂",
        "suggestion": "引入一键授权登录，减少表单字段，优化流程至3步内完成",
    },
    {
        "stage": "客服咨询",
        "issue": "客服响应慢",
        "impact": "中",
        "drop_rate": 22.2,
        "affected_users": "22%的用户等待超时后离开",
        "root_cause": "人工客服排队时间长，智能客服解答率低",
        "suggestion": "升级AI客服知识库，增加常见问题快速回复，优化排队机制",
    },
    {
        "stage": "信息搜索",
        "issue": "搜索结果不精准",
        "impact": "中",
        "drop_rate": 35.0,
        "affected_users": "35%的用户未找到所需信息",
        "root_cause": "搜索引擎匹配度低，关键词覆盖不足",
        "suggestion": "引入NLP语义搜索，优化搜索词库，增加热门搜索引导",
    },
    {
        "stage": "续费/流失",
        "issue": "携号转网门槛",
        "impact": "极高",
        "drop_rate": 50.0,
        "affected_users": "50%的流失用户选择携号转网",
        "root_cause": "竞品套餐更有吸引力，转网流程简化",
        "suggestion": "设计针对性挽留套餐，提前识别高风险用户主动关怀",
    },
]


def create_journey_map():
    """创建客户旅程地图 (主图)"""
    print("\n   📊 生成客户旅程地图...")
    time.sleep(0.3)

    fig = plt.figure(figsize=(18, 10), facecolor="#fafafa")
    gs = fig.add_gridspec(2, 2, height_ratios=[2, 1], hspace=0.3, wspace=0.3)

    # ── 图1: 旅程全景图 (大图) ──────────────────────
    ax1 = fig.add_subplot(gs[0, :])

    stages_list = list(STAGES)
    n_stages = len(stages_list)
    x_pos = np.arange(n_stages)

    # 每阶段满意度颜色映射
    stage_satisfaction = []
    for s in stages_list:
        tps = TOUCHPOINTS[s]
        avg_s = np.mean([t["satisfaction"] for t in tps])
        stage_satisfaction.append(avg_s)

    colors = []
    for v in stage_satisfaction:
        if v < 3.0:
            colors.append("#e53935")  # 红 - 差
        elif v < 3.5:
            colors.append("#ff9800")  # 橙 - 一般
        elif v < 4.0:
            colors.append("#4caf50")  # 绿 - 好
        else:
            colors.append("#1565c0")  # 蓝 - 优秀

    # 绘制阶段背景
    for i, (stage, color) in enumerate(zip(stages_list, colors)):
        rect = FancyBboxPatch((i - 0.35, 0.5), 0.7, 4.8,
                              boxstyle="round,pad=0.08", facecolor=color,
                              alpha=0.12, edgecolor=color, linewidth=2)
        ax1.add_patch(rect)
        ax1.text(i, 5.55, stage, ha="center", va="center",
                fontproperties=CN_FONT_LG, fontweight="bold", color=color)

    # 绘制各阶段触点
    for i, stage in enumerate(stages_list):
        tps = TOUCHPOINTS[stage]
        for j, tp in enumerate(tps):
            y_pos = 5.0 - j * 1.2
            # 触点气泡大小映射访问量
            size = max(80, tp["volume"] * 0.8)
            alpha_val = min(0.95, 0.5 + tp["satisfaction"] / 10)
            if tp["satisfaction"] < 3.0:
                tp_color = "#e53935"
            elif tp["satisfaction"] < 3.5:
                tp_color = "#ff9800"
            else:
                tp_color = "#43a047"

            ax1.scatter(i, y_pos, s=size, c=tp_color, alpha=alpha_val,
                       edgecolors="white", linewidth=1.5, zorder=5)
            ax1.text(i, y_pos - 0.25, tp["name"], ha="center", va="top",
                    fontproperties=CN_FONT_SM, fontsize=8, color="#333")
            # 满意度小标签
            ax1.text(i, y_pos + 0.25, f'{tp["satisfaction"]:.1f}',
                    ha="center", va="bottom", fontsize=7,
                    fontweight="bold", color=tp_color)

    ax1.set_ylim(-0.2, 5.8)
    ax1.set_xlim(-0.6, n_stages - 0.4)
    ax1.set_xticks([])
    ax1.set_yticks([])
    ax1.set_frame_on(False)

    # 图例
    legend_elements = [
        mpatches.Patch(facecolor="#e53935", alpha=0.3, label="满意度<3.0 (差)"),
        mpatches.Patch(facecolor="#ff9800", alpha=0.3, label="满意度3.0-3.5 (一般)"),
        mpatches.Patch(facecolor="#43a047", alpha=0.3, label="满意度>3.5 (良好)"),
    ]
    ax1.legend(handles=legend_elements, loc="upper right", prop=CN_FONT_SM,
              framealpha=0.8, edgecolor="#ddd")

    ax1.set_title("客户旅程全景地图 - 各阶段触点与满意度分布",
                 fontproperties=CN_FONT_TITLE, fontweight="bold", pad=15, color="#333")

    # ── 图2: 转化漏斗 ──────────────────────────────
    ax2 = fig.add_subplot(gs[1, 0])

    stages_names = [f[0] for f in FUNNEL_DATA]
    values = [f[1] for f in FUNNEL_DATA]
    rates = [f[2] for f in FUNNEL_DATA]
    indicators = [f[3] for f in FUNNEL_DATA]

    bar_colors = []
    for ind in indicators:
        if ind == "🔴":
            bar_colors.append("#e53935")
        elif ind == "⚠️":
            bar_colors.append("#ff9800")
        else:
            bar_colors.append("#43a047")

    bars = ax2.barh(range(len(stages_names)), values, height=0.6, color=bar_colors,
                    alpha=0.85, edgecolor="white", linewidth=1.5)

    # 标注流失率
    for i, (v, r) in enumerate(zip(values, rates)):
        if i > 0:
            prev_v = values[i - 1]
            drop = (prev_v - v) / prev_v * 100
            ax2.text(v + 20, i, f"↓{drop:.1f}%", va="center", fontsize=9,
                    fontweight="bold", color="#e53935", fontproperties=CN_FONT_SM)

    ax2.set_yticks(range(len(stages_names)))
    ax2.set_yticklabels(stages_names, fontproperties=CN_FONT)
    ax2.set_xlabel("用户数", fontproperties=CN_FONT)
    ax2.set_title("转化漏斗 - 各阶段用户留存", fontproperties=CN_FONT_LG,
                 fontweight="bold", color="#333")
    ax2.invert_yaxis()
    ax2.spines["top"].set_visible(False)
    ax2.spines["right"].set_visible(False)

    # ── 图3: 薄弱环节热力图 ────────────────────────
    ax3 = fig.add_subplot(gs[1, 1])

    # 构建热力图数据: 阶段 x 触点类型
    touch_types = ["digital", "social", "offline", "phone", "core"]
    heatmap_data = np.zeros((len(stages_list), len(touch_types)))

    for i, stage in enumerate(stages_list):
        for tp in TOUCHPOINTS[stage]:
            j = touch_types.index(tp["type"]) if tp["type"] in touch_types else 0
            # 用(5-满意度)表示痛点程度
            heatmap_data[i, j] = (5.0 - tp["satisfaction"]) * tp["volume"] / 100

    im = ax3.imshow(heatmap_data.T, cmap="YlOrRd", aspect="auto", interpolation="bilinear")

    ax3.set_xticks(range(len(stages_list)))
    ax3.set_xticklabels(stages_list, fontproperties=CN_FONT_SM, rotation=30, ha="right")
    ax3.set_yticks(range(len(touch_types)))
    ax3.set_yticklabels(["数字渠道", "社交渠道", "线下渠道", "电话渠道", "核心服务"],
                       fontproperties=CN_FONT_SM)
    ax3.set_title("痛点热力图 - 深色区域为高风险环节", fontproperties=CN_FONT_LG,
                 fontweight="bold", color="#333")

    cbar = plt.colorbar(im, ax=ax3, shrink=0.8)
    cbar.set_label("痛点指数", fontproperties=CN_FONT_SM)

    fig.suptitle("中国移动客户旅程分析系统",
                fontproperties=FontProperties(fname=FONT_PATH, size=20) if FONT_PATH else FontProperties(size=20),
                fontweight="bold", y=1.01, color="#1a237e")

    plt.tight_layout()
    path1 = os.path.join(OUTPUT_DIR, "journey_map_overview.png")
    fig.savefig(path1, dpi=150, bbox_inches="tight", facecolor="#fafafa")
    print(f"   ✅ 旅程全景图已保存: {path1}")
    plt.close(fig)
    return path1


def create_funnel_chart():
    """创建详细的漏斗分析图"""
    print("   📊 生成转化漏斗详细分析...")
    time.sleep(0.3)

    fig, ax = plt.subplots(figsize=(10, 7), facecolor="white")

    labels = [f"{f[0]}\n({f[1]}人)" for f in FUNNEL_DATA]
    values = [f[1] for f in FUNNEL_DATA]
    indicators = [f[3] for f in FUNNEL_DATA]

    colors_funnel = []
    for ind in indicators:
        if ind == "🔴":
            colors_funnel.append("#ef5350")
        elif ind == "⚠️":
            colors_funnel.append("#ffa726")
        else:
            colors_funnel.append("#66bb6a")

    # 绘制漏斗
    max_width = values[0]
    for i, (v, label) in enumerate(zip(values, labels)):
        width_ratio = v / max_width
        left = (1 - width_ratio) / 2
        rect = FancyBboxPatch((left, 6 - i), width_ratio, 0.8,
                              boxstyle="round,pad=0.05", facecolor=colors_funnel[i],
                              alpha=0.85, edgecolor="white", linewidth=2)
        ax.add_patch(rect)
        ax.text(0.5, 6.4 - i, label, ha="center", va="center",
               fontproperties=CN_FONT, fontweight="bold", color="white",
               fontsize=11)

        if i > 0:
            drop_rate = (values[i-1] - v) / values[i-1] * 100
            ax.annotate(f"流失 {drop_rate:.1f}%",
                       xy=(0.5, 6 - i + 0.4), xytext=(0.85, 6 - i + 0.4),
                       fontsize=10, color="#e53935", fontweight="bold",
                       fontproperties=CN_FONT_SM,
                       arrowprops=dict(arrowstyle="->", color="#e53935", lw=1.5))

    ax.set_xlim(0, 1)
    ax.set_ylim(0, 8)
    ax.set_frame_on(False)
    ax.set_xticks([])
    ax.set_yticks([])

    ax.set_title("客户旅程转化漏斗 - 从认知到续费的用户流转",
                fontproperties=CN_FONT_TITLE, fontweight="bold", pad=15)

    path2 = os.path.join(OUTPUT_DIR, "funnel_analysis.png")
    fig.savefig(path2, dpi=150, bbox_inches="tight", facecolor="white")
    print(f"   ✅ 漏斗分析图已保存: {path2}")
    plt.close(fig)
    return path2


def create_pain_point_analysis():
    """创建薄弱环节分析图"""
    print("   📊 生成薄弱环节与断点分析...")
    time.sleep(0.3)

    fig, axes = plt.subplots(2, 2, figsize=(16, 10), facecolor="white")

    # ── 子图1: 流失率柱状图 ─────────────────────────
    ax1 = axes[0, 0]
    stages_pp = [pp["stage"] for pp in PAIN_POINTS]
    drop_rates = [pp["drop_rate"] for pp in PAIN_POINTS]
    impacts = [pp["impact"] for pp in PAIN_POINTS]

    bar_colors_pp = []
    for imp in impacts:
        if imp == "极高":
            bar_colors_pp.append("#b71c1c")
        elif imp == "高":
            bar_colors_pp.append("#e53935")
        else:
            bar_colors_pp.append("#ff9800")

    bars = ax1.bar(range(len(stages_pp)), drop_rates, color=bar_colors_pp,
                   edgecolor="white", linewidth=1.5, width=0.6)
    ax1.set_xticks(range(len(stages_pp)))
    ax1.set_xticklabels(stages_pp, fontproperties=CN_FONT_SM)
    ax1.set_ylabel("流失率 (%)", fontproperties=CN_FONT)
    ax1.set_title("各阶段关键流失率", fontproperties=CN_FONT_LG, fontweight="bold")
    ax1.spines["top"].set_visible(False)
    ax1.spines["right"].set_visible(False)

    # 在柱状图上标注百分比
    for bar, rate in zip(bars, drop_rates):
        ax1.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.8,
                f"{rate:.1f}%", ha="center", fontweight="bold", color="#333",
                fontsize=10)

    # ── 子图2: 影响矩阵 ────────────────────────────
    ax2 = axes[0, 1]
    # X: 流失率, Y: 影响程度
    x_vals = [pp["drop_rate"] for pp in PAIN_POINTS]
    y_vals = []
    for pp in PAIN_POINTS:
        if pp["impact"] == "极高":
            y_vals.append(4.0)
        elif pp["impact"] == "高":
            y_vals.append(3.0)
        else:
            y_vals.append(2.0)

    sizes = [max(100, pp["drop_rate"] * 8) for pp in PAIN_POINTS]
    colors_scatter = ["#b71c1c", "#e53935", "#e53935", "#ff9800", "#b71c1c"]

    for i, pp in enumerate(PAIN_POINTS):
        ax2.scatter(x_vals[i], y_vals[i], s=sizes[i], c=colors_scatter[i],
                   alpha=0.7, edgecolors="white", linewidth=1.5)
        ax2.annotate(pp["issue"], (x_vals[i], y_vals[i]),
                    textcoords="offset points", xytext=(10, 10),
                    fontproperties=CN_FONT_SM, fontsize=9,
                    arrowprops=dict(arrowstyle="->", color="#666", lw=0.8))

    ax2.set_xlabel("流失率 (%)", fontproperties=CN_FONT)
    ax2.set_ylabel("影响程度", fontproperties=CN_FONT)
    ax2.set_yticks([2, 3, 4])
    ax2.set_yticklabels(["中", "高", "极高"], fontproperties=CN_FONT_SM)
    ax2.set_title("痛点影响矩阵", fontproperties=CN_FONT_LG, fontweight="bold")
    ax2.spines["top"].set_visible(False)
    ax2.spines["right"].set_visible(False)
    ax2.grid(True, alpha=0.3, linestyle="--")

    # ── 子图3: 用户满意度雷达图 ────────────────────
    ax3 = axes[1, 0]
    # 使用子图方式做简单的雷达图效果
    # 按阶段做满意度趋势
    stages_radar = list(STAGES)
    avg_satisfaction = []
    for s in stages_radar:
        tps = TOUCHPOINTS[s]
        avg = np.mean([t["satisfaction"] for t in tps])
        avg_satisfaction.append(avg)

    # 分渠道满意度
    digital_sat = []
    offline_sat = []
    for s in stages_radar:
        d_tps = [t for t in TOUCHPOINTS[s] if t["type"] in ("digital", "core")]
        o_tps = [t for t in TOUCHPOINTS[s] if t["type"] in ("offline", "phone")]
        digital_sat.append(np.mean([t["satisfaction"] for t in d_tps]) if d_tps else 0)
        offline_sat.append(np.mean([t["satisfaction"] for t in o_tps]) if o_tps else 0)

    x_idx = range(len(stages_radar))
    ax3.plot(x_idx, avg_satisfaction, "o-", color="#1a237e", linewidth=2.5,
            markersize=8, label="综合满意度", zorder=5)
    ax3.plot(x_idx, digital_sat, "s--", color="#43a047", linewidth=2,
            markersize=6, label="数字渠道")
    ax3.plot(x_idx, offline_sat, "^--", color="#ff9800", linewidth=2,
            markersize=6, label="线下/电话渠道")

    # 标注高风险区域
    ax3.axhline(y=3.0, color="#e53935", linestyle=":", alpha=0.6)
    ax3.fill_between(x_idx, 1.5, 3.0, alpha=0.08, color="#e53935")
    ax3.text(len(stages_radar) - 0.5, 2.85, "高风险区", fontsize=9, color="#e53935",
            fontproperties=CN_FONT_SM)

    ax3.set_xticks(range(len(stages_radar)))
    ax3.set_xticklabels(stages_radar, fontproperties=CN_FONT_SM, rotation=30)
    ax3.set_ylim(1.5, 5.0)
    ax3.set_ylabel("满意度 (5分制)", fontproperties=CN_FONT)
    ax3.set_title("各阶段满意度趋势对比", fontproperties=CN_FONT_LG, fontweight="bold")
    ax3.legend(loc="lower left", prop=CN_FONT_SM, framealpha=0.8)
    ax3.spines["top"].set_visible(False)
    ax3.spines["right"].set_visible(False)
    ax3.grid(True, alpha=0.3, linestyle="--")

    # ── 子图4: 改进建议优先级 ──────────────────────
    ax4 = axes[1, 1]
    ax4.set_xlim(0, 10)
    ax4.set_ylim(0, len(PAIN_POINTS) * 1.5 + 0.5)
    ax4.set_frame_on(False)
    ax4.set_xticks([])
    ax4.set_yticks([])

    # 按影响程度排序
    sorted_pp = sorted(PAIN_POINTS, key=lambda x: x["drop_rate"], reverse=True)

    for i, pp in enumerate(sorted_pp):
        y = len(sorted_pp) * 1.5 - i * 1.5
        priority_color = "#b71c1c" if pp["impact"] in ("极高", "高") else "#e65100"

        # 优先级标记
        ax4.text(0.2, y, f"#{i+1}", fontsize=18, fontweight="bold",
                color=priority_color, va="center", ha="center")

        # 问题描述框
        rect = FancyBboxPatch((1.0, y - 0.4), 8.8, 1.0,
                              boxstyle="round,pad=0.05", facecolor="white",
                              edgecolor="#ddd", linewidth=1)
        ax4.add_patch(rect)

        ax4.text(1.3, y + 0.2, f"【{pp['stage']}】{pp['issue']}",
                fontproperties=CN_FONT_LG, fontweight="bold", color="#333", va="center")
        ax4.text(1.3, y - 0.15, f"根因: {pp['root_cause']}",
                fontproperties=CN_FONT_SM, color="#666", va="center", fontsize=9)
        ax4.text(8.5, y + 0.15, f"流失率 {pp['drop_rate']:.1f}%",
                fontsize=10, fontweight="bold", color=priority_color, va="center")

    ax4.set_title("改进建议优先级排序 (Top 5)", fontproperties=CN_FONT_LG,
                 fontweight="bold")

    fig.suptitle("客户旅程断点与薄弱环节 AI 分析报告",
                fontproperties=CN_FONT_TITLE, fontweight="bold", y=1.01, color="#1a237e")

    plt.tight_layout()
    path3 = os.path.join(OUTPUT_DIR, "pain_point_analysis.png")
    fig.savefig(path3, dpi=150, bbox_inches="tight", facecolor="white")
    print(f"   ✅ 薄弱环节分析图已保存: {path3}")
    plt.close(fig)
    return path3


def create_churn_prediction():
    """创建流失预测与预警仪表盘"""
    print("   📊 生成流失预测仪表盘...")
    time.sleep(0.3)

    fig, axes = plt.subplots(1, 2, figsize=(14, 6), facecolor="white")

    # ── 子图1: 流失风险构成 ────────────────────────
    ax1 = axes[0]
    risk_labels = ["低风险\n(留存)", "中低风险\n(观望)", "中风险\n(摇摆)",
                   "中高风险\n(可能流失)", "高风险\n(即将流失)"]
    risk_values = [250, 280, 220, 150, 100]  # 对应800用户
    risk_colors = ["#66bb6a", "#aed581", "#ffb74d", "#ff8a65", "#e53935"]
    explode = (0, 0, 0, 0.05, 0.1)

    wedges, texts, autotexts = ax1.pie(
        risk_values, explode=explode, labels=risk_labels,
        colors=risk_colors, autopct="%1.1f%%",
        startangle=90, pctdistance=0.6,
        textprops={"fontproperties": CN_FONT_SM, "fontsize": 10}
    )
    for at in autotexts:
        at.set_fontweight("bold")
        at.set_fontsize(10)
    ax1.set_title("用户流失风险构成", fontproperties=CN_FONT_LG, fontweight="bold")

    # ── 子图2: 月度流失趋势预测 ────────────────────
    ax2 = axes[1]
    months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月"]
    churn_actual = [12, 14, 11, 15, 18, 22, 0, 0]  # 最近6个月实际 + 预测
    churn_predicted = [12, 14, 11, 15, 18, 22, 28, 35]  # 预测值

    ax2.fill_between(range(len(months)), churn_actual[:6] + [np.nan, np.nan],
                     alpha=0.3, color="#43a047", label="实际流失")
    ax2.plot(range(len(months)), churn_predicted, "o-", color="#e53935",
            linewidth=2.5, markersize=8, label="预测流失")
    ax2.plot([5, 6, 7], churn_predicted[5:], "s--", color="#e53935",
            linewidth=2, markersize=10, markerfacecolor="yellow", markeredgecolor="#e53935")

    # 高亮预测区
    ax2.axvspan(5.5, 7.5, alpha=0.08, color="#e53935")
    ax2.text(6.5, max(churn_predicted) - 2, "⚠ 预测区间", ha="center",
            fontsize=11, color="#e53935", fontweight="bold", fontproperties=CN_FONT_SM)

    ax2.set_xticks(range(len(months)))
    ax2.set_xticklabels(months, fontproperties=CN_FONT_SM)
    ax2.set_ylabel("月度流失用户数", fontproperties=CN_FONT)
    ax2.set_title("流失趋势预测 (未来2个月)", fontproperties=CN_FONT_LG, fontweight="bold")
    ax2.legend(prop=CN_FONT_SM)
    ax2.spines["top"].set_visible(False)
    ax2.spines["right"].set_visible(False)
    ax2.grid(True, alpha=0.3, linestyle="--")

    fig.suptitle("流失预警与预测分析",
                fontproperties=CN_FONT_TITLE, fontweight="bold", y=1.01, color="#1a237e")

    plt.tight_layout()
    path4 = os.path.join(OUTPUT_DIR, "churn_prediction.png")
    fig.savefig(path4, dpi=150, bbox_inches="tight", facecolor="white")
    print(f"   ✅ 流失预测仪表盘已保存: {path4}")
    plt.close(fig)
    return path4


def print_analysis_report():
    """打印AI分析文本报告"""
    print("\n" + "=" * 62)
    print("  🤖 AI 断点分析报告")
    print("=" * 62)

    print("""
  ┌─────────────────────────────────────────────────────────┐
  │              🔴 关键发现 (Critical Findings)              │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │  1. 【续费/流失阶段】流失率最高 (50.0%)                   │
  │     ─ 竞品携号转网流程简化，用户流失加速                   │
  │     ─ 建议: 建立高价值用户预警系统，提前30天主动关怀       │
  │                                                         │
  │  2. 【比较评估阶段】35.4%用户在对比阶段放弃                │
  │     ─ 套餐信息展示不够直观，对比功能不友好                 │
  │     ─ 建议: 引入AI智能推荐，一键对比核心差异               │
  │                                                         │
  │  3. 【购买办理阶段】33.3%用户办理途中放弃                  │
  │     ─ 身份验证流程繁琐，表单字段过多                       │
  │     ─ 建议: 优化至3步内完成，支持人脸识别快速认证          │
  │                                                         │
  │  4. 【信息搜索阶段】35.0%的用户未找到有效信息              │
  │     ─ 搜索引擎匹配精度不足                                │
  │     ─ 建议: 升级NLP语义搜索，增加智能导航                  │
  │                                                         │
  │  5. 【客服咨询阶段】智能客服一次解决率有待提升              │
  │     ─ 复杂问题需要多次转人工                              │
  │     ─ 建议: 扩展知识库，引入大模型提供更精准回复           │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
""")

    print("  ┌─────────────────────────────────────────────────────────┐")
    print("  │           📊 关键指标 (KPIs)                            │")
    print("  ├─────────────────────────────────────────────────────────┤")
    print("  │                                                         │")
    print(f"  │  总用户数:             {TOTAL_USERS}                           │")
    print(f"  │  高风险流失用户:       100 (12.5%)                     │")
    print(f"  │  中高风险用户:         150 (18.8%)                     │")
    print(f"  │  预测下月流失:         28 人                            │")
    print(f"  │  预测再下月流失:       35 人                            │")
    print(f"  │  平均满意度:           {np.mean([np.mean([t['satisfaction'] for t in TOUCHPOINTS[s]]) for s in STAGES]):.2f}/5.0")
    print(f"  │  最薄弱环节:           续费/流失 (满意度 2.97/5.0)     │")
    print(f"  │  最强环节:             认知发现 (满意度 3.57/5.0)      │")
    print(f"  │  整体转化率:           {FUNNEL_DATA[-1][1]/FUNNEL_DATA[0][1]*100:.1f}%                        │")
    print("  │                                                         │")
    print("  └─────────────────────────────────────────────────────────┘")


# ── 主流程 ─────────────────────────────────────────────

TOTAL_USERS = 1000  # 与feature1保持一致的分析口径


def main():
    print("\n" + "=" * 62)
    print("  功能点3: 客户旅程可视化与断点分析")
    print("  Customer Journey Visualization & Breakpoint Analysis")
    print("=" * 62)

    print("\n📊 正在分析用户旅程数据...")
    time.sleep(0.3)

    # 生成各类可视化图表
    paths = {}
    paths["journey_map"] = create_journey_map()
    paths["funnel"] = create_funnel_chart()
    paths["pain_points"] = create_pain_point_analysis()
    paths["churn"] = create_churn_prediction()

    # 打印AI分析报告
    print_analysis_report()

    print("\n" + "=" * 62)
    print("  📁 生成的可视化文件:")
    for name, path in paths.items():
        print(f"     {name}: {path}")
    print("=" * 62)

    # 显示图表 (依次弹出)
    print("\n📺 正在展示可视化图表...")
    time.sleep(0.5)

    for name, path in paths.items():
        print(f"   展示: {os.path.basename(path)}")
        try:
            img = plt.imread(path)
            fig = plt.figure(figsize=(14, 8), facecolor="white")
            plt.imshow(img)
            plt.axis("off")
            plt.title(f"功能点3 - {name}", fontproperties=CN_FONT_TITLE if FONT_PATH else None,
                     fontweight="bold", pad=10)
            plt.tight_layout()
            plt.show(block=False)
            plt.waitforbuttonpress(3)  # 3秒后自动关闭
            plt.close()
        except Exception as e:
            print(f"   ⚠️ 图表展示跳过: {e}")

    print("\n" + "=" * 62)
    print("  ✅ 功能点3 完成: 客户旅程可视化与断点分析")
    print("=" * 62)
    time.sleep(1)

    return paths


if __name__ == "__main__":
    main()
