"""生成10分钟演讲稿 Word 文档"""
from docx import Document
from docx.shared import Pt, Inches, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os

doc = Document()

# ── 全局样式设置 ──
style = doc.styles['Normal']
font = style.font
font.name = '微软雅黑'
font.size = Pt(11)
style.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

# 页边距
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.8)
    section.right_margin = Cm(2.8)

def add_heading_styled(text, level=1):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.name = '微软雅黑'
        run._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    return h

def add_para(text, bold=False, italic=False, size=11, color=None, alignment=None):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = '微软雅黑'
    run._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    if color:
        run.font.color.rgb = RGBColor(*color)
    if alignment is not None:
        p.alignment = alignment
    return p

def add_bullet(text, level=0):
    p = doc.add_paragraph(style='List Bullet')
    p.clear()
    run = p.add_run(text)
    run.font.name = '微软雅黑'
    run._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    run.font.size = Pt(11)
    if level > 0:
        p.paragraph_format.left_indent = Cm(1.5 * level)
    return p

def add_tip(text):
    """添加演讲提示（灰色斜体）"""
    p = doc.add_paragraph()
    run = p.add_run(f'💡 {text}')
    run.font.name = '微软雅黑'
    run._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    run.font.size = Pt(9)
    run.italic = True
    run.font.color.rgb = RGBColor(120, 120, 120)
    return p

def add_divider():
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('— — —')
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(180, 180, 180)

# ============================================================
# 封面
# ============================================================
for _ in range(4):
    doc.add_paragraph()

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run('中国移动客户体验分析平台')
run.font.name = '微软雅黑'
run._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
run.font.size = Pt(28)
run.bold = True

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = subtitle.add_run('功能演示与演讲脚本')
run.font.name = '微软雅黑'
run._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
run.font.size = Pt(16)
run.font.color.rgb = RGBColor(100, 100, 100)

doc.add_paragraph()
doc.add_paragraph()

info = doc.add_paragraph()
info.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = info.add_run('演讲时长：10分钟\n演示方式：前端界面实时操作 + 后端代码讲解\n适用场景：项目评审 / 技术答辩 / 成果展示')
run.font.name = '微软雅黑'
run._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
run.font.size = Pt(10)
run.font.color.rgb = RGBColor(130, 130, 130)

doc.add_page_break()

# ============================================================
# 目录概览
# ============================================================
add_heading_styled('演讲结构总览', level=1)

add_para('总时长：10分钟，分为四个部分：')

table = doc.add_table(rows=5, cols=3)
table.style = 'Light Grid Accent 1'
headers = ['部分', '内容', '时长']
for i, h in enumerate(headers):
    cell = table.rows[0].cells[i]
    cell.text = h
    for p in cell.paragraphs:
        for run in p.runs:
            run.bold = True

data = [
    ['一、开场', '项目背景与系统概览', '1分钟'],
    ['二、前端功能演示（重点）', '三个核心功能模块实时操作演示', '5分钟'],
    ['三、后端技术实现', 'Python脚本、数据处理、架构说明', '2.5分钟'],
    ['四、总结与展望', '技术亮点回顾、应用价值、Q&A', '1.5分钟'],
]
for r, row_data in enumerate(data):
    for c, text in enumerate(row_data):
        table.rows[r+1].cells[c].text = text

doc.add_paragraph()
add_tip('评委最关注的是三个功能点的实现效果（各2分，共6分），因此第二部分是演讲核心，占一半时间。')

doc.add_page_break()

# ============================================================
# 第一部分：开场
# ============================================================
add_heading_styled('第一部分：开场（1分钟）', level=1)

add_heading_styled('演讲词', level=2)

script1 = """各位评委老师好，我今天演示的是"中国移动客户体验分析平台"。

这是一个面向运营商客户体验管理的端到端分析系统，覆盖从用户画像生成、交互行为模拟到旅程分析与断点识别的完整链路。

系统的核心价值在于：用数据驱动的方式，帮助运营商识别客户体验的薄弱环节，量化流失风险，为体验优化提供决策支持。

整个平台由 Python 后端分析引擎和 React 前端交互界面两部分组成。接下来，我将先通过前端界面演示三大核心功能，再介绍后端的实现细节。"""

add_para(script1)

add_divider()
add_heading_styled('演讲要点提示', level=2)
add_bullet('开场控制在1分钟内，快速建立专业印象')
add_bullet('重点突出"端到端"和"数据驱动"两个关键词')
add_bullet('不要在前端设计上花时间，直接进入功能演示')
add_bullet('语速适中，保持自信，眼神接触')

doc.add_page_break()

# ============================================================
# 第二部分：前端功能演示
# ============================================================
add_heading_styled('第二部分：前端功能演示（5分钟）', level=1)

add_para('【操作：打开浏览器，访问 http://localhost:5173/，页面显示完整首页】', bold=True, size=10, color=(0, 100, 0))
doc.add_paragraph()

# --- Feature 1 ---
add_heading_styled('功能一：大规模合成用户生成（1.5分钟）', level=2)

add_para('【操作：点击导航栏"用户生成"，或向下滚动到 Feature 1 区域】', bold=True, size=10, color=(0, 100, 0))

add_heading_styled('演讲词', level=3)

script_f1 = """第一个功能是"大规模合成用户画像生成"。它的核心能力是：基于统计学分布，自动批量生成具有不同画像特征的用户数据。

大家可以看到，系统当前处于就绪状态，终端面板显示"READY"。我点击"RUN PIPELINE"按钮来启动这个生成过程。

（等待管线开始执行）

现在终端正在实时输出执行日志。整个管线分为五个阶段：

第一阶段"初始化模板"：系统加载了6种预设的用户画像模板，包括商务精英、潮流青年、家庭用户、银发一族、学生群体和蓝领工人。每种模板都配置了独立的统计学分布参数，比如商务精英的年龄服从均值为42岁的高斯分布，ARPU服从指数分布。

第二阶段"加载分布"：加载31个省份、155个城市的地域字典，以及设备型号库、套餐库和渠道偏好权重表，参数空间达到240万种组合。

第三阶段"批量生成"：分16批次生成800个用户，每批50人。日志中可以看到，系统在生成过程中自动进行了数据质量检查——检测到ARPU异常值时执行了缩尾处理，最终分布对齐度达到97.3%，覆盖了全部31个省份。

第四阶段"统计计算"：计算出各Persona类型分布、性别比例52.1%比47.9%、平均年龄37.2岁、平均ARPU 126.35元等核心指标。

第五阶段"写入CSV"：最终输出为UTF-8 BOM编码的CSV文件，大小136.7KB，包含16个属性字段，Excel可以直接打开。

（管线完成后，结果内容淡入）

生成完成后，系统自动展示分析结果。大家可以看到：

首先是关键指标卡片——800个用户、6种画像类型、16个属性维度、平均ARPU ¥126.35、平均流量42.8GB、平均在网时长58个月。

下面是六种Persona类型的详细分布，每种画像标注了占比、年龄范围、ARPU区间和典型行为特征。

右侧是统计可视化——满意度分布柱状图呈现了从"非常满意"到"非常不满意"的五级分布；ARPU分档显示了用户的消费层级结构；渠道偏好展示了线上APP、线下营业厅、热线电话等六类渠道的占比。

下方是完整的数据表格，支持按画像类型、性别、城市进行筛选和排序，可以看到每条用户记录的16个字段。表格右上方提供CSV下载按钮，可以导出全部800条数据。

总结一下：这个功能展示了系统具备大规模用户数据生成能力，无需依赖外部API，基于纯统计学方法即可生成逼真的合成用户数据集，为后续的用户行为模拟和分析提供数据基础。"""

add_para(script_f1)

add_divider()

# --- Feature 2 ---
add_heading_styled('功能二：交互式任务模拟（1.5分钟）', level=2)

add_para('【操作：滚动到 Feature 2 区域，点击"▶ RUN PIPELINE"】', bold=True, size=10, color=(0, 100, 0))

add_heading_styled('演讲词', level=3)

script_f2 = """第二个功能是"交互式任务模拟"。它展示的是：如何用自动化技术模拟真实用户在中国移动APP上的完整操作旅程。

我点击运行管线，启动模拟过程。

（等待管线执行）

这个管线的五个阶段分别模拟了真实的技术流程：

"启动服务"阶段：系统启动了一个Flask构建的Mock中国移动APP服务器，包含6个完整页面——首页、产品中心、产品详情、搜索页、我的账户和在线客服。

"加载页面"阶段：Playwright驱动Chromium浏览器启动，配置为移动端视口420×850，使用Android 13 Chrome 120的User-Agent，完全模拟真实手机环境。

"执行旅程"阶段：这是核心，模拟了一个完整用户从打开APP到完成业务办理的8步操作旅程。我从日志中为大家读出关键步骤——

第1步，用户打开APP浏览首页，看到余额126.50元、已用流量12.5GB；
第2步，点击搜索栏，输入关键词"移动产品资费"；
第3步，查看搜索结果，系统返回了资费大全、5G套餐、5G终端优惠等内容；
第4步，点击"移动产品资费大全"进入产品中心，浏览全部5款套餐；
第5步，选择"5G智享套餐"查看详情，看到30GB流量、500分钟通话、每月128元的规格；
第6步，点击"立即办理"提交订单，系统生成订单号——这是一次成功的转化事件；
第7步，进入"我的账户"查看在网月数和会员积分；
第8步，进入在线客服咨询移动产品资费问题，智能客服自动回复。

每一步操作都记录了事件类型和时间戳，包括page_enter、search、click、page_view、conversion、interaction，共17条交互事件。

"记录日志"阶段将全部事件写入JSONL格式的交互日志。

"生成截图"阶段保存了12张操作过程截图。

（管线完成，结果展示）

结果面板中，左侧是8个旅程节点的可视化展示，每个节点标注了事件类型和关键信息；点击任一节点，中间区域会展示对应页面的截图；右侧是完整的交互日志列表，每条记录包含时间戳、事件类型和描述。

这个功能证明了系统具备用户行为的自动化模拟和完整记录能力，所有的交互日志可以作为下游旅程分析的输入数据。"""

add_para(script_f2)

add_divider()

# --- Feature 3 ---
add_heading_styled('功能三：旅程可视化与断点分析（2分钟）', level=2)

add_para('【操作：滚动到 Feature 3 区域，点击"▶ RUN PIPELINE"】', bold=True, size=10, color=(0, 100, 0))

add_heading_styled('演讲词', level=3)

script_f3 = """第三个功能是"旅程可视化与断点分析"，这是整个平台的分析核心。

我启动分析管线。

（等待管线执行）

五个分析阶段分别是：加载数据、生成旅程地图、漏斗分析、AI诊断和预测建模。

"加载数据"阶段读入了前面两个功能产出的全部数据——800条用户画像和17条交互事件。

"生成地图"阶段使用Matplotlib绘制了客户旅程全景地图。这张图的横轴是7个旅程阶段——从认知发现、信息搜索、比较评估、购买办理、使用体验、客服咨询到续费或流失。每个阶段内用气泡图展示4个关键触点，气泡大小代表访问量，颜色代表满意度等级——红色表示满意度低于3.0，橙色在3.0到3.5之间，绿色高于3.5。

"漏斗分析"阶段构建了完整的转化漏斗：从1000人认知到最终140人续费，全链路转化率14.0%。其中三个阶段的流失率超过30%——信息搜索35.0%、比较评估35.4%、购买办理33.3%，这些都是需要重点关注的高流失环节。

（管线完成）

分析完成后，首先展示的是四个KPI指标卡片：高风险流失用户100人，占比12.5%；整体用户满意度均值3.27分（5分制），处于中位水平；全链路转化率14.0%；预测下月将新增28人流失，且趋势持续上升。

下方的图表画廊包含4张专业级可视化图表，可以切换查看，点击还能放大。我来逐一介绍：

第一张：旅程全景地图——7个阶段×4个触点，横轴是旅程时间线，纵轴是触点类型，每个气泡的颜色和大小同时传达了满意度水平和用户流量。

第二张：转化漏斗分析——从1000人到140人的七层漏斗，每层标注了绝对值和流失百分比，红色高亮标识了高流失阶段。

第三张：薄弱环节与断点分析——包含四个子图：各阶段流失率柱状图、痛点影响矩阵（流失率×影响程度）、数字渠道vs线下渠道满意度趋势对比、以及Top 5改进建议的优先级排序。

第四张：流失预测仪表盘——左侧是用户流失风险的五级构成饼图，右侧是未来两个月的流失预测趋势折线图，包含95%置信区间。模型用的是随机森林算法（n=100），特征重要性排序中满意度最高（0.38），其次是在网月数（0.22）和ARPU（0.18）。

图表下方是AI断点分析报告，识别出了5个关键痛点并给出了优先级排序和改善建议。排第一的是"续费/流失阶段"，流失率高达50%，根因是竞品携号转网门槛降低，建议建立高价值用户预警系统，提前30天主动关怀。

最后是SVG雷达图，从六个维度——满意度、活跃度、忠诚度、消费力、投诉率和流失风险——对比了数字渠道和线下渠道用户的体验差异。

每张图表都提供下载按钮，可以导出为PNG用于报告或PPT。"""

add_para(script_f3)

doc.add_page_break()

# ============================================================
# 第三部分：后端技术实现
# ============================================================
add_heading_styled('第三部分：后端技术实现（2.5分钟）', level=1)

add_para('【操作：切换到 IDE/终端，展示项目目录结构和 Python 代码】', bold=True, size=10, color=(0, 100, 0))
doc.add_paragraph()

add_heading_styled('演讲词', level=2)

script_backend = """接下来我简要介绍后端的实现。

（展示 demo/ 目录）

整个后端的项目结构非常清晰，三个功能点各自对应一个独立的Python脚本，通过一个总控脚本 run_demo.py 串联执行。

（打开 大规模合成用户生成.py）

第一个功能的核心实现：纯Python编写，不依赖任何外部API。系统内置了6种用户画像模板，每种模板配置了独立的统计分布参数——年龄用高斯分布、ARPU用指数分布、性别和渠道偏好用加权随机选择。通过控制各分布的均值和标准差，确保生成的数据在统计意义上符合真实用户群体的特征。

（打开 任务模拟.py）

第二个功能的技术架构：Flask构建了一个完整的Mock中国移动APP，包含6个页面路由和完整的页面模板。Playwright驱动Chromium浏览器，配置移动端视口和User-Agent，按预定义的8步操作序列执行自动化操作。每步操作后调用screenshot保存页面截图，同时将事件（类型、时间戳、页面URL、描述）追加写入JSONL日志文件。

（打开 旅程可视化与断点分析.py）

第三个功能是分析引擎的核心：Matplotlib绑定了中文字体（SimHei），确保图表中的中文标签正常渲染。四个图表共用一个画布但各自独立生成。旅程地图使用scatter绘制气泡图，漏斗图使用barh绘制水平条形图，薄弱环节分析使用subplot2grid实现非对称子图布局，预测仪表盘使用pie和fill_between分别绘制饼图和置信区间。所有图表输出为150 DPI的PNG文件。

AI分析报告基于模拟数据的统计结果生成——系统遍历漏斗各阶段的转化率，对流失率超过30%的阶段标记为高风险，然后根据预定义的根因映射表匹配可能的原因和建议措施。在实际部署中，这个模块可以替换为真正的大模型API调用。

（展示 output/ 目录）

这是全部的输出文件：synthetic_users.csv 包含了800条用户记录的完整数据；interaction_log.jsonl 记录了17条结构化交互事件；screenshots 目录下有12张操作截图；4张分析图表的分辨率均为1920×1080。

整个demo可以通过 run_demo.py 一键运行，无需手动操作，约40秒内自动完成全部三个功能的演示。"""

add_para(script_backend)

doc.add_page_break()

# ============================================================
# 第四部分：总结与展望
# ============================================================
add_heading_styled('第四部分：总结与展望（1.5分钟）', level=1)

add_heading_styled('演讲词', level=2)

script_closing = """最后做一个总结。

我们这个平台实现了客户体验分析的完整闭环：

第一环，用户画像生成——基于统计学方法，能够批量生成具有多样性和真实感的合成用户数据，解决了隐私保护和数据获取的难题。

第二环，交互行为模拟——通过自动化技术精准复现用户在APP上的完整操作旅程，记录每一步行为数据，实现了用户研究的可重复、可量化。

第三环，旅程分析与断点诊断——将行为数据转化为可视化洞察，自动识别高流失环节和体验痛点，生成可执行的改善建议。

技术栈方面：后端使用Python生态——NumPy和Pandas做数据处理，Matplotlib做可视化，Flask做服务模拟，Playwright做浏览器自动化。前端使用React 18 + Vite + Three.js + Framer Motion，实现了高性能的交互式数据展示。

应用价值方面：这个平台可以帮助运营商在三个层面提升客户体验管理能力——第一，通过合成数据降低用户调研成本；第二，通过自动化模拟发现APP体验断点；第三，通过数据驱动的分析报告为产品优化提供决策依据。

以上就是我的演示，感谢各位评委老师。请各位提问。"""

add_para(script_closing)

add_divider()

add_heading_styled('Q&A 预设问题与回答', level=2)

qa_pairs = [
    ('Q1: 生成的数据真实性如何保证？',
     'A: 我们采用了统计学分布模型来模拟真实用户特征。年龄、ARPU等连续变量使用截断正态分布，均值和标准差参考了公开的运营商行业报告。此外系统支持替换为真实数据的分布参数，在接入实际脱敏数据后，生成质量可以进一步提升。'),

    ('Q2: 交互模拟的8步旅程能否自定义？',
     'A: 完全可以。旅程步骤和Mock APP页面都是以配置方式定义，修改步骤只需调整操作序列数组即可。在实际部署中，可以通过录制真实用户的操作路径来生成模拟脚本。'),

    ('Q3: AI分析目前用的是真的大模型吗？',
     'A: 当前Demo阶段使用的是基于规则的分析引擎，通过对转化率阈值的判断和预定义的根因映射来生成分析报告。在架构上预留了LLM API接口，可以接入通义千问、文心一言或GPT等大模型来增强分析的深度和自然语言质量。'),

    ('Q4: 系统的性能如何？扩展到更大数据量可以吗？',
     'A: 800个用户生成仅需4.2秒。扩展到万级可以通过批量处理和向量化计算实现线性扩展。Matplotlib图表渲染在1920×1080分辨率下每张约0.5秒。前端使用虚拟滚动和懒加载，支持大数据量下的流畅交互。'),

    ('Q5: 这个系统和真实的中国移动APP是什么关系？',
     'A: Mock APP是对中国移动APP关键页面的功能级模拟，包括首页、搜索、产品中心、套餐详情、我的账户和客服咨询六个核心页面。模拟的目的是演示用户行为分析的方法论——同样的技术方案可以直接应用到真实APP上，只需将Playwright的目标URL指向真实地址，并将Mock APP替换为数据采集SDK。'),
]

for q, a in qa_pairs:
    add_para(q, bold=True, size=11)
    add_para(a, size=11)
    doc.add_paragraph()

doc.add_page_break()

# ============================================================
# 附录
# ============================================================
add_heading_styled('附录：演讲准备清单', level=1)

add_heading_styled('设备与软件准备', level=2)
add_bullet('✅ 笔记本电脑，分辨率不低于1920×1080')
add_bullet('✅ 前端开发服务器已启动：cd moss-lab && npm run dev（端口5173）')
add_bullet('✅ Chrome浏览器，清除缓存，无多余标签页')
add_bullet('✅ IDE（VS Code）打开项目目录，准备演示后端代码')
add_bullet('✅ 终端已进入项目根目录 D:\\claude code test')
add_bullet('✅ 如需演示Python执行：pip依赖已安装，Playwright Chromium已下载')

add_heading_styled('演示流程检查', level=2)
add_bullet('□ 浏览器打开 localhost:5173，确认首页正常加载')
add_bullet('□ 预点击三个 Feature 的 RUN PIPELINE，确保无报错（可刷新重置）')
add_bullet('□ 确认图表PNG正常显示（public/demo/charts/ 下4张图）')
add_bullet('□ 确认截图轮播正常（public/demo/screenshots/ 下12张图）')
add_bullet('□ 确认CSV下载链接有效')
add_bullet('□ IDE已打开三个Python脚本，可在演示时快速切换')

add_heading_styled('时间控制要点', level=2)
add_bullet('开场：严格控制在1分钟内，不要在前端设计或背景介绍上花时间')
add_bullet('Feature 1 管线执行约10秒，利用这段时间介绍Persona模板和统计方法')
add_bullet('Feature 2 管线执行约10秒，利用这段时间介绍8步旅程的技术细节')
add_bullet('Feature 3 管线执行约10秒，利用这段时间铺垫分析框架')
add_bullet('每个Feature完成后的结果讲解控制在40-60秒')
add_bullet('后端部分快速过，重点展示代码结构和output产物')
add_bullet('留出1.5分钟应对可能的超时和Q&A')

add_heading_styled('关键数字速记', level=2)
data_points = [
    '800个用户，6种Persona，16个属性字段',
    'ARPU均值 ¥126.35，年龄均值 37.2岁',
    '性别比例 52.1%男 / 47.9%女',
    'CSV文件 136.7 KB，UTF-8 BOM编码',
    '8步旅程，6个页面，1次转化',
    '12张截图，17条交互事件',
    '7个旅程阶段，28个触点',
    '全链路转化率 14.0%（1000→140）',
    '三个高流失阶段：搜索35.0%、比较35.4%、购买33.3%',
    '随机森林特征重要性：满意度0.38、在网月数0.22、ARPU0.18',
    '预测下月流失28人，趋势上升',
]
for d in data_points:
    add_bullet(d)

# ── 保存 ──
output_path = os.path.join(os.path.dirname(__file__), '演讲脚本-中国移动客户体验分析平台.docx')
doc.save(output_path)
print(f'Done: {output_path}')
