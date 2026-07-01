"""Generate 500+ telecom optimization cases for the case library."""
import json, random, sys, os
from datetime import datetime, timedelta

regions = ["深圳市", "广州市", "佛山市", "珠海市", "东莞市", "惠州市", "中山市", "江门市"]
categories = {
    "覆盖优化": {"tags": ["弱覆盖", "深度覆盖", "室分", "城中村", "高层住宅", "地下室", "隧道", "电梯"], "problems": [
        "{loc}RSRP低于-110dBm，室内信号弱导致VoLTE掉话率上升",
        "{loc}高层住宅小区深度覆盖不足，居民投诉上网体验差",
        "{loc}地下室停车场无信号覆盖，紧急呼叫失败",
        "{loc}新建地铁线路隧道内覆盖盲区，用户投诉频繁",
        "{loc}城中村房屋密集遮挡严重，室外覆盖难以穿透",
        "{loc}商业中心电梯内无覆盖，影响高端用户体验",
        "{loc}沿海区域由于海面反射导致覆盖空洞",
        "{loc}山区地形遮挡导致部分村庄信号弱",
    ], "solutions": [
        "增补微站+N78频段室分系统，优化天线下倾角",
        "部署BookRRU/LampSite方案，结合宏站补盲",
        "使用射灯天线+美化天线解决物业协调难题",
        "调整站点位置+使用高增益天线增强覆盖",
        "部署分布式皮基站+协调新增抱杆资源",
        "采用多波束天线+调整方位角优化覆盖范围",
    ], "effects": [
        "MR覆盖率从{from}%提升至{to}%，投诉量下降{down}%",
        "RSRP均值提升{up}dB，掉话率从{from}%降至{to}%",
        "用户感知速率提升{rate}倍，满意度评分提高{score}分",
        "覆盖盲区消除，日均流量增长{growth}%",
        "VoLTE接通率提升至{to}%，室内体验显著改善",
    ]},
    "容量扩容": {"tags": ["容量", "载波聚合", "PRB", "高负荷", "高校", "商圈", "高铁", "演唱会"], "problems": [
        "{loc}商圈晚忙时PRB利用率超90%，用户速率严重下降",
        "{loc}高校开学季用户数激增300%，基站过载",
        "{loc}演唱会/大型活动短时大量用户接入导致拥塞",
        "{loc}高铁站候车区忙时用户感知极差",
        "{loc}住宅区晚高峰时段视频卡顿率超15%",
        "{loc}工业园区上班时段上行容量不足影响视频会议",
    ], "solutions": [
        "开启载波聚合(CA)+增开2.1G/3.5G频点扩容",
        "部署Massive MIMO+小区分裂提升容量3倍",
        "应急通信车+临时小站保障大型活动",
        "负载均衡优化+硬扩容增加载波License",
        "开启UL/DL decoupling+SUL技术改善上行",
        "QoS策略优化+差异化限速保障基本业务",
    ], "effects": [
        "忙时速率从{from}Mbps提升至{to}Mbps，提升{rate}倍",
        "PRB利用率降至{to}%以下，用户感知显著改善",
        "容量提升{rate}倍，承载用户数从{from}增至{to}",
        "视频1080P流畅播放占比从{from}%升至{to}%",
        "高峰期投诉量月均下降{down}%",
    ]},
    "干扰排查": {"tags": ["干扰", "底噪", "天馈", "频谱", "屏蔽器", "雷达"], "problems": [
        "{loc}区域上行底噪异常抬升8dB，MOS评分劣化",
        "{loc}附近考场/监狱私装屏蔽器导致大面积干扰",
        "{loc}基站扇区反向频谱异常，疑似外部干扰源",
        "{loc}5G TDD帧失步导致交叉时隙干扰",
        "{loc}沿海区域受海上导航雷达脉冲干扰",
        "{loc}广电700M频段异系统干扰导致4G性能下降",
    ], "solutions": [
        "使用扫频仪定位干扰源+联合无委执法清除",
        "部署IRC/eLAA干扰抑制算法+调整频点",
        "更换抗干扰天线+部署干扰随机化技术",
        "TDD帧结构对齐+GP符号优化消除交叉干扰",
        "协调关闭非法屏蔽器+部署干扰规避调度",
    ], "effects": [
        "干扰底噪降低{down}dB，SINR均值提升{up}dB",
        "MOS评分从{from}提升至{to}，语音质量恢复",
        "干扰源清除后，用户投诉量下降{down}%",
        "PRB效率提升{up}%，频谱利用率恢复至正常水平",
    ]},
    "切换优化": {"tags": ["切换", "邻区", "高铁", "高速", "A3/A5", "CIO"], "problems": [
        "{loc}高铁沿线频繁切换导致掉话率超3%",
        "{loc}高速移动场景A3事件频繁触发乒乓切换",
        "{loc}室内外切换边界信号陡降导致掉话",
        "{loc}异频切换门限设置不当导致UE滞留弱覆盖小区",
        "{loc}NSA/SA双模组网切换失败率高",
        "{loc}跨厂家边界切换成功率仅91%",
    ], "solutions": [
        "优化邻区关系+调整A3/A5切换门限及CIO偏置",
        "高铁专用小区+小区合并减少切换次数",
        "异频测量GAP优化+缩短切换时延",
        "双连接切换优化+NR邻区精细化配置",
        "跨厂家X2接口参数对齐+切换序列优化",
    ], "effects": [
        "切换成功率从{from}%提升至{to}%",
        "掉话率从{from}%降至{to}%，高铁用户体验显著改善",
        "乒乓切换次数减少{down}%，信令负荷降低",
        "室内外切换成功率提升至{to}%，边界体验连续",
    ]},
    "故障处理": {"tags": ["故障", "告警", "退服", "光缆", "电源", "板卡"], "problems": [
        "{loc}基站批量退服，影响{size}平方公里区域",
        "{loc}传输光缆被施工挖断导致大面积断站",
        "{loc}基站电源模块故障导致RRU频繁重启",
        "{loc}基站板卡温度过高导致设备自动降功率",
        "{loc}BBU与RRU之间CPRI光链路中断",
        "{loc}天线馈线进水导致驻波比告警",
    ], "solutions": [
        "紧急抢修+临时微波传输恢复业务",
        "更换故障板卡+升级散热系统",
        "重新熔接光缆+增加路由保护",
        "更换RRU设备+升级电源模块冗余",
        "应急发电车+UPS保障电源连续性",
    ], "effects": [
        "故障修复时间从{from}分钟缩短至{to}分钟",
        "基站可用率恢复至{to}%，业务影响降到最低",
        "建立双路由保护后同类故障再未发生",
    ]},
    "语音优化": {"tags": ["VoLTE", "VoNR", "MOS", "Jitter", "丢包"], "problems": [
        "{loc}区域VoLTE单通/断续投诉集中爆发",
        "{loc}VoNR切换至VoLTE时呼叫中断",
        "{loc}高铁场景VoLTE语音断续、杂音严重",
        "{loc}跨境VoLTE互通成功率仅85%",
        "{loc}VoLTE高清语音编码协商失败率偏高",
    ], "solutions": [
        "QCI1专载优化+ROHC头压缩开启",
        "EPS Fallback流程优化+VoNR邻区配置",
        "AMR-WB编码+Jitter Buffer参数调优",
        "跨PLMN路由优化+信令面SBC配置调整",
    ], "effects": [
        "VoLTE接通率从{from}%提升至{to}%",
        "MOS评分从{from}提升至{to}，语音质量优良",
        "单通投诉清零，VOLTE掉话率降至{to}%",
    ]},
    "物联网优化": {"tags": ["NB-IoT", "Cat1", "物联网", "PSM", "eDRX"], "problems": [
        "{loc}智能水表NB-IoT终端接入成功率低",
        "{loc}共享单车Cat1终端功耗过高续航不足",
        "{loc}工业物联网URLLC时延不达标",
        "{loc}大规模物联网终端同时注册导致RACH拥塞",
        "{loc}地下管廊物联网覆盖不足数据中断",
    ], "solutions": [
        "NB-IoT覆盖增强+重复传输次数优化",
        "PSM/eDRX节电参数调优延长终端续航",
        "上行免调度Grant Free+PDCCH聚合提升可靠性",
        "RACH资源池扩容+ACB接入控制优化",
    ], "effects": [
        "终端接入成功率从{from}%提升至{to}%",
        "终端功耗降低{down}%，续航时间延长至{months}个月",
        "URLLC时延从{from}ms降至{to}ms，满足工业控制要求",
    ]},
    "业务优化": {"tags": ["视频", "游戏", "直播", "微信", "抖音", "CDN"], "problems": [
        "{loc}区域抖音/快手视频首帧加载时间超3秒",
        "{loc}手游王者荣耀时延波动大导致卡顿",
        "{loc}企业视频会议卡顿、花屏影响办公",
        "{loc}微信图片/视频发送缓慢用户体验差",
        "{loc}在线教育直播课视频卡顿投诉集中",
    ], "solutions": [
        "CDN本地节点下沉+TCP优化算法",
        "游戏加速专载+上行预调度优化",
        "视频QoS保障+缓存预加载策略",
        "DPI业务识别+差异化调度策略",
    ], "effects": [
        "视频首帧加载时间从{from}s降至{to}s",
        "游戏时延从{from}ms降至{to}ms，卡顿率下降{down}%",
        "视频会议MOS评分提升至{to}，用户体验显著改善",
    ]},
    "频率优化": {"tags": ["频谱", "重耕", "CA", "EN-DC", "载波"], "problems": [
        "{loc}区域频谱资源紧张导致容量瓶颈",
        "{loc}2.1G NR重耕后与4G DSS互干扰",
        "{loc}EN-DC组合锚点选择不当导致5G体验差",
        "{loc}载波聚合辅载波激活率低导致CA增益不足",
        "{loc}2.6G与4.9G频段间负载不均衡",
    ], "solutions": [
        "动态频谱共享(DSS)+频谱重耕策略优化",
        "NR载波聚合组合优化+SCell添加门限调整",
        "多层网频率策略+负载均衡参数调优",
        "EN-DC锚点优选+SCG添加成功率优化",
    ], "effects": [
        "频谱效率提升{up}%，单载波速率提升{rate}倍",
        "CA激活率从{from}%提升至{to}%",
        "5G用户平均速率提升{up}%，分流效果显著",
    ]},
    "用户沟通": {"tags": ["投诉安抚", "满意度回访", "客户关怀", "不满意修复"], "problems": [
        "{loc}某VIP客户频繁投诉网络质量要求退网",
        "{loc}集团客户不满网络稳定性威胁转网",
        "{loc}批量用户投诉费用争议引发舆情风险",
        "{loc}历史不满意用户未及时跟进导致投诉升级",
        "{loc}某小区居民集体投诉基站辐射要求拆除",
    ], "solutions": [
        "上门检测+网络优化+个性化套餐推荐",
        "定期回访+网络问题优先解决+客户关系维护",
        "主动通知+透明沟通+专属客服通道",
        "不满意用户专项修复+满意度回访+闭环跟踪",
    ], "effects": [
        "客户满意度评分从{from}分提升至{to}分",
        "投诉升级率降低{down}%，客户留存率提升{up}%",
        "用户主动撤诉，舆情风险成功化解",
        "不满意用户修复成功率{to}%，转推荐意愿提升",
    ]},
}

loc_names = {
    "深圳市": ["南山科技园", "福田CBD", "宝安西乡", "龙华民治", "罗湖东门", "龙岗坂田", "坪山比亚迪"],
    "广州市": ["天河珠江新城", "越秀北京路", "番禺大学城", "白云机场", "黄埔科学城", "海珠琶洲"],
    "佛山市": ["顺德大良", "南海桂城", "禅城祖庙", "三水乐平", "高明荷城"],
    "珠海市": ["香洲吉大", "横琴新区", "金湾航空城", "斗门井岸", "高新区唐家湾"],
    "东莞市": ["南城CBD", "虎门镇", "长安镇", "松山湖", "厚街镇"],
    "惠州市": ["惠城江北", "惠阳淡水", "大亚湾", "仲恺高新区"],
    "中山市": ["东区CBD", "小榄镇", "古镇镇", "火炬开发区"],
    "江门市": ["蓬江万达", "新会枢纽", "台山广海", "开平水口"],
}

def random_value(template: str) -> str:
    result = template
    result = result.replace("{from}", str(random.randint(60, 94)))
    result = result.replace("{to}", str(random.randint(95, 100)))
    result = result.replace("{up}", str(random.randint(3, 15)))
    result = result.replace("{down}", str(random.randint(30, 80)))
    result = result.replace("{rate}", str(round(random.uniform(1.5, 5.0), 1)))
    result = result.replace("{score}", str(round(random.uniform(5, 15), 1)))
    result = result.replace("{growth}", str(random.randint(50, 200)))
    result = result.replace("{months}", str(random.randint(12, 36)))
    result = result.replace("{size}", str(random.randint(5, 50)))
    return result

def generate_cases(count: int) -> list[dict]:
    cases = []
    cat_keys = list(categories.keys())
    base = datetime(2024, 1, 1)
    for i in range(count):
        cat = random.choice(cat_keys)
        c = categories[cat]
        region = random.choice(regions)
        loc = random.choice(loc_names[region])
        problem_tpl = random.choice(c["problems"]).replace("{loc}", loc)
        solution = random.choice(c["solutions"])
        effect = random.choice(c["effects"])
        tags = random.sample(c["tags"], min(3, len(c["tags"])))
        date = base + timedelta(days=random.randint(0, 900))
        case = {
            "id": f"C{i+1:04d}",
            "title": f"{loc}{cat}典型案例",
            "category": cat,
            "tags": tags,
            "problem": random_value(problem_tpl),
            "solution": random_value(solution),
            "effect": random_value(effect),
            "region": region,
            "createTime": date.strftime("%Y-%m-%d"),
        }
        cases.append(case)
    return cases

if __name__ == "__main__":
    cases = generate_cases(500)
    output_path = os.path.join(os.path.dirname(__file__), 'cases_output.txt')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("import type { CaseItem } from '@/types/domain';\n\n")
        f.write("export const caseItems: CaseItem[] = [\n")
        for c in cases:
            line = f"  {{ id: '{c['id']}', title: '{c['title']}', category: '{c['category']}', tags: {json.dumps(c['tags'], ensure_ascii=False)}, problem: '{c['problem']}', solution: '{c['solution']}', effect: '{c['effect']}', region: '{c['region']}', createTime: '{c['createTime']}' }},\n"
            f.write(line)
        f.write("];\n")
    print(f"Written {len(cases)} cases to {output_path}")
