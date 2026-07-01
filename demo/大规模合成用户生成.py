"""
╔══════════════════════════════════════════════════════════════╗
║  功能点1: 大规模合成用户生成                                   ║
║  Large-Scale Synthetic User Persona Generation              ║
╚══════════════════════════════════════════════════════════════╝

演示如何自动生成成百上千个具有不同用户画像(Persona)的用户数据。
"""
import random
import csv
import os
import time
import sys
import io

# 修复 Windows GBK 编码问题
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# ── 配置 ───────────────────────────────────────────────
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)
CSV_PATH = os.path.join(OUTPUT_DIR, "synthetic_users.csv")

TOTAL_USERS = 800  # 生成800个合成用户

# ── 数据字典 ───────────────────────────────────────────
PROVINCES = [
    "北京", "上海", "广东", "浙江", "江苏", "四川", "湖北", "湖南",
    "河南", "山东", "福建", "安徽", "辽宁", "重庆", "陕西", "河北",
    "江西", "天津", "云南", "贵州", "黑龙江", "吉林", "山西", "广西",
    "内蒙古", "甘肃", "海南", "新疆", "宁夏", "青海", "西藏"
]

CITIES_BY_PROVINCE = {
    "北京": ["朝阳区", "海淀区", "丰台区", "东城区", "西城区"],
    "上海": ["浦东新区", "黄浦区", "徐汇区", "静安区", "长宁区"],
    "广东": ["广州", "深圳", "东莞", "佛山", "珠海"],
    "浙江": ["杭州", "宁波", "温州", "嘉兴", "绍兴"],
    "江苏": ["南京", "苏州", "无锡", "常州", "南通"],
    "四川": ["成都", "绵阳", "德阳", "宜宾", "南充"],
    "湖北": ["武汉", "宜昌", "襄阳", "荆州", "黄石"],
    "湖南": ["长沙", "株洲", "湘潭", "衡阳", "岳阳"],
    "河南": ["郑州", "洛阳", "开封", "南阳", "新乡"],
    "山东": ["济南", "青岛", "烟台", "潍坊", "临沂"],
    "福建": ["福州", "厦门", "泉州", "漳州", "莆田"],
    "安徽": ["合肥", "芜湖", "蚌埠", "安庆", "马鞍山"],
    "辽宁": ["沈阳", "大连", "鞍山", "抚顺", "锦州"],
    "重庆": ["渝中区", "江北区", "南岸区", "沙坪坝区", "九龙坡区"],
    "陕西": ["西安", "宝鸡", "咸阳", "渭南", "延安"],
    "河北": ["石家庄", "唐山", "保定", "邯郸", "廊坊"],
    "江西": ["南昌", "九江", "赣州", "景德镇", "宜春"],
    "天津": ["和平区", "河西区", "南开区", "河东区", "河北区"],
    "云南": ["昆明", "大理", "丽江", "曲靖", "玉溪"],
    "贵州": ["贵阳", "遵义", "六盘水", "安顺", "毕节"],
    "黑龙江": ["哈尔滨", "齐齐哈尔", "牡丹江", "大庆", "佳木斯"],
    "吉林": ["长春", "吉林", "四平", "延边", "通化"],
    "山西": ["太原", "大同", "阳泉", "长治", "临汾"],
    "广西": ["南宁", "桂林", "柳州", "北海", "玉林"],
    "内蒙古": ["呼和浩特", "包头", "鄂尔多斯", "赤峰", "通辽"],
    "甘肃": ["兰州", "天水", "白银", "酒泉", "张掖"],
    "海南": ["海口", "三亚", "琼海", "儋州", "文昌"],
    "新疆": ["乌鲁木齐", "克拉玛依", "石河子", "喀什", "伊犁"],
    "宁夏": ["银川", "石嘴山", "吴忠", "固原", "中卫"],
    "青海": ["西宁", "海东", "格尔木", "德令哈", "玉树"],
    "西藏": ["拉萨", "日喀则", "林芝", "山南", "昌都"],
}

PERSONA_TYPES = [
    {"name": "商务精英", "age_range": (28, 55), "gender_weight": [0.6, 0.4],
     "avg_arpu": (128, 588), "data_usage_gb": (20, 100), "call_minutes": (300, 2000),
     "features": ["5G极速套餐", "国际漫游", "商务彩铃", "云存储", "企业VPN"],
     "weight": 0.15},
    {"name": "潮流青年", "age_range": (16, 28), "gender_weight": [0.45, 0.55],
     "avg_arpu": (38, 128), "data_usage_gb": (30, 150), "call_minutes": (50, 300),
     "features": ["流量不限量", "视频会员", "游戏加速", "音乐畅听", "社交免流"],
     "weight": 0.25},
    {"name": "家庭用户", "age_range": (30, 50), "gender_weight": [0.4, 0.6],
     "avg_arpu": (88, 238), "data_usage_gb": (10, 60), "call_minutes": (200, 800),
     "features": ["家庭共享套餐", "宽带融合", "亲情号码", "智能家居", "儿童手表"],
     "weight": 0.22},
    {"name": "银发一族", "age_range": (55, 80), "gender_weight": [0.5, 0.5],
     "avg_arpu": (18, 58), "data_usage_gb": (0.5, 5), "call_minutes": (100, 600),
     "features": ["语音畅聊包", "健康监测", "紧急呼叫", "防诈提醒", "大字版APP"],
     "weight": 0.13},
    {"name": "学生群体", "age_range": (12, 22), "gender_weight": [0.5, 0.5],
     "avg_arpu": (18, 58), "data_usage_gb": (20, 80), "call_minutes": (20, 150),
     "features": ["校园流量包", "学习APP免流", "夜间流量", "假期短号", "兼职通话"],
     "weight": 0.15},
    {"name": "蓝领工人", "age_range": (22, 50), "gender_weight": [0.7, 0.3],
     "avg_arpu": (38, 98), "data_usage_gb": (10, 40), "call_minutes": (200, 600),
     "features": ["语音优惠", "闲时流量", "视频通话", "老乡号码", "务工套餐"],
     "weight": 0.10},
]

CHANNELS = ["APP", "微信公众号", "营业厅", "10086热线", "网上营业厅", "短信营业厅"]
DEVICES = ["iPhone 15 Pro", "iPhone 14", "华为Mate 60", "华为P60", "小米14",
           "小米13", "OPPO Find X6", "vivo X100", "荣耀Magic6", "三星S24",
           "Redmi Note 12", "realme GT5", "iPhone SE", "华为畅享"]
PLANS = ["动感地带18元", "神州行38元", "全球通88元", "全球通128元", "全球通188元",
         "全球通288元", "全球通388元", "动感地带校园版", "神州行孝心卡", "5G智享套餐",
         "移动大流量卡", "移动畅享套餐", "和家庭168", "和家庭198", "5G融合套餐299"]
SATISFACTION_LEVELS = ["非常满意", "满意", "一般", "不满意", "非常不满意"]
SATISFACTION_WEIGHTS = [0.12, 0.33, 0.30, 0.18, 0.07]
CHURN_RISK_LEVELS = ["低风险", "中低风险", "中风险", "中高风险", "高风险"]
CHURN_WEIGHTS = [0.25, 0.28, 0.22, 0.15, 0.10]


def weighted_choice(items, weights):
    return random.choices(items, weights=weights, k=1)[0]


def generate_persona(persona_type, user_id):
    p = persona_type
    gender = random.choices(["男", "女"], weights=p["gender_weight"], k=1)[0]
    age = random.randint(*p["age_range"])
    tenure_months = random.randint(1, 240)
    province = random.choice(PROVINCES)
    city = random.choice(CITIES_BY_PROVINCE.get(province, ["市区"]))
    arpu = round(random.uniform(*p["avg_arpu"]), 2)
    data_gb = round(random.uniform(*p["data_usage_gb"]), 1)
    call_min = random.randint(*p["call_minutes"])
    features = random.sample(p["features"], min(3, len(p["features"])))
    plan = random.choice(PLANS)
    device = random.choice(DEVICES)
    pref_channel = random.choice(CHANNELS)
    satisfaction = weighted_choice(SATISFACTION_LEVELS, SATISFACTION_WEIGHTS)
    churn_risk = weighted_choice(CHURN_RISK_LEVELS, CHURN_WEIGHTS)

    interaction_count = max(1, int(random.gauss(15, 8)))
    last_interaction_days = max(0, int(random.expovariate(1 / 30)))

    return {
        "user_id": f"CM{user_id:06d}",
        "persona_type": p["name"],
        "gender": gender,
        "age": age,
        "province": province,
        "city": city,
        "tenure_months": tenure_months,
        "arpu_yuan": arpu,
        "data_usage_gb": data_gb,
        "call_minutes": call_min,
        "current_plan": plan,
        "device": device,
        "preferred_channel": pref_channel,
        "interested_features": "|".join(features),
        "satisfaction": satisfaction,
        "churn_risk": churn_risk,
        "interaction_count": interaction_count,
        "last_interaction_days": last_interaction_days,
    }


def print_progress_bar(current, total, prefix="", suffix="", length=50):
    percent = int(100 * current / total)
    filled = int(length * current / total)
    bar = "█" * filled + "░" * (length - filled)
    sys.stdout.write(f"\r{prefix}|{bar}| {percent}% {suffix}")
    sys.stdout.flush()


# ── 主流程 ─────────────────────────────────────────────

print("\n" + "=" * 62)
print("  功能点1: 大规模合成用户画像生成系统")
print("  Large-Scale Synthetic User Persona Generator")
print("=" * 62)

print("\n📊 初始化用户画像模板...")
print(f"   已加载 {len(PERSONA_TYPES)} 种用户画像类型:")
for pt in PERSONA_TYPES:
    bar = "█" * int(pt["weight"] * 40)
    print(f"   · {pt['name']:6s}  {bar} ({pt['weight']:.0%})")

print(f"\n⚙️  开始生成 {TOTAL_USERS} 个合成用户...")
time.sleep(0.5)

users = []
persona_counts = {p["name"]: 0 for p in PERSONA_TYPES}

for i in range(TOTAL_USERS):
    # 按权重选择画像类型
    ptype = random.choices(
        PERSONA_TYPES,
        weights=[p["weight"] for p in PERSONA_TYPES],
        k=1
    )[0]
    user = generate_persona(ptype, i + 1)
    users.append(user)
    persona_counts[ptype["name"]] += 1
    print_progress_bar(i + 1, TOTAL_USERS, prefix="   生成进度 ", suffix=f"{i+1}/{TOTAL_USERS}")

print("\n")

# ── 写入CSV ───────────────────────────────────────────
print(f"💾 保存到文件: {CSV_PATH}")
time.sleep(0.3)

fieldnames = list(users[0].keys())
with open(CSV_PATH, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(users)

file_size = os.path.getsize(CSV_PATH) / 1024
print(f"   文件大小: {file_size:.1f} KB  |  行数: {TOTAL_USERS + 1} (含表头)")

# ── 统计摘要 ───────────────────────────────────────────
print("\n" + "─" * 62)
print("  📈 生成数据统计分析")
print("─" * 62)

print(f"\n  【用户画像分布】")
for name, count in persona_counts.items():
    bar = "█" * int(count / TOTAL_USERS * 40)
    print(f"   {name:8s}  {bar}  {count:4d} ({count/TOTAL_USERS:.1%})")

males = sum(1 for u in users if u["gender"] == "男")
females = TOTAL_USERS - males
print(f"\n  【性别分布】  男: {males} ({males/TOTAL_USERS:.1%})  "
      f"女: {females} ({females/TOTAL_USERS:.1%})")

avg_age = sum(u["age"] for u in users) / TOTAL_USERS
avg_arpu = sum(u["arpu_yuan"] for u in users) / TOTAL_USERS
avg_data = sum(u["data_usage_gb"] for u in users) / TOTAL_USERS
avg_tenure = sum(u["tenure_months"] for u in users) / TOTAL_USERS

print(f"\n  【核心指标均值】")
print(f"   平均年龄:     {avg_age:.1f} 岁")
print(f"   平均ARPU:     ¥{avg_arpu:.2f}")
print(f"   平均流量:     {avg_data:.1f} GB/月")
print(f"   平均在网时长: {avg_tenure:.0f} 个月")

# 满意度分布
sat_counts = {lvl: 0 for lvl in SATISFACTION_LEVELS}
for u in users:
    sat_counts[u["satisfaction"]] += 1
print(f"\n  【满意度分布】")
for lvl in SATISFACTION_LEVELS:
    bar = "█" * int(sat_counts[lvl] / TOTAL_USERS * 40)
    print(f"   {lvl:6s}  {bar}  {sat_counts[lvl]:4d} ({sat_counts[lvl]/TOTAL_USERS:.1%})")

# 流失风险分布
churn_counts = {lvl: 0 for lvl in CHURN_RISK_LEVELS}
for u in users:
    churn_counts[u["churn_risk"]] += 1
print(f"\n  【流失风险分布】")
for lvl in CHURN_RISK_LEVELS:
    bar = "█" * int(churn_counts[lvl] / TOTAL_USERS * 40)
    print(f"   {lvl:6s}  {bar}  {churn_counts[lvl]:4d} ({churn_counts[lvl]/TOTAL_USERS:.1%})")

# 渠道偏好
chan_counts = {}
for u in users:
    ch = u["preferred_channel"]
    chan_counts[ch] = chan_counts.get(ch, 0) + 1
print(f"\n  【渠道偏好分布】")
for ch in CHANNELS:
    cnt = chan_counts.get(ch, 0)
    bar = "█" * int(cnt / TOTAL_USERS * 40)
    print(f"   {ch:10s}  {bar}  {cnt:4d} ({cnt/TOTAL_USERS:.1%})")

# ARPU分档
arpu_bins = {"0-50元": 0, "50-100元": 0, "100-200元": 0, "200-400元": 0, "400元+": 0}
for u in users:
    a = u["arpu_yuan"]
    if a < 50: arpu_bins["0-50元"] += 1
    elif a < 100: arpu_bins["50-100元"] += 1
    elif a < 200: arpu_bins["100-200元"] += 1
    elif a < 400: arpu_bins["200-400元"] += 1
    else: arpu_bins["400元+"] += 1
print(f"\n  【ARPU分档】")
for label in ["0-50元", "50-100元", "100-200元", "200-400元", "400元+"]:
    cnt = arpu_bins[label]
    bar = "█" * int(cnt / TOTAL_USERS * 40)
    print(f"   {label:10s}  {bar}  {cnt:4d} ({cnt/TOTAL_USERS:.1%})")

print("\n" + "=" * 62)
print("  ✅ 功能点1 完成: 成功生成 {} 个合成用户画像".format(TOTAL_USERS))
print(f"     输出文件: {CSV_PATH}")
print("=" * 62)
time.sleep(1)
