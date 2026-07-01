{
  "web_system_frontend_prompts": [
    {
      "module": "核心功能模块",
      "name": "大规模用户生成",
      "goal": "演示系统使用已有 Python 脚本生成 800 个不同用户画像，包括性别、年龄、地区、ARPU、流量、通话时长、套餐、设备偏好、渠道偏好、满意度和流失风险。",
      "prompts": [
        "使用用户画像类型权重生成 800 个合成用户。",
        "每个用户包含: user_id, persona_type, gender, age, province, city, tenure_months, arpu_yuan, data_usage_gb, call_minutes, current_plan, device, preferred_channel, interested_features, satisfaction, churn_risk, interaction_count, last_interaction_days。",
        "动态展示生成进度条，实时显示已生成用户数量。",
        "统计并显示各Persona类型分布、性别比例、平均年龄、平均ARPU、平均流量、满意度分布和流失风险分布。",
        "导出CSV文件到 output/synthetic_users.csv。"
      ],
      "demo_effects": [
        "前端表格显示所有生成用户，支持按Persona类型、性别、城市筛选和排序。",
        "进度条动画显示用户生成进度。",
        "柱状图和饼图展示满意度、流失风险、渠道偏好、ARPU分档等统计信息。",
        "提供CSV下载按钮，下载生成用户数据。"
      ]
    },
    {
      "module": "核心功能模块",
      "name": "交互式任务模拟",
      "goal": "演示用户在 Mock 中国移动APP 上执行完整操作旅程，包括首页浏览、搜索移动产品资费、浏览套餐详情、办理套餐、查看订单、在线客服咨询等。",
      "prompts": [
        "模拟用户在 APP 上浏览首页、滚动页面、点击搜索栏、输入关键词 '移动产品资费' 并点击搜索。",
        "进入产品中心，浏览5G套餐详情并点击 '立即办理'。",
        "返回首页进入个人中心查看账户信息，进入在线客服咨询移动产品资费。",
        "记录每步操作事件，包括 page_enter, page_view, click, scroll, conversion, interaction。",
        "生成交互日志 JSON 或 CSV 文件，用于后续旅程分析。"
      ],
      "demo_effects": [
        "动态演示用户操作动画，突出点击、搜索和跳转路径。",
        "侧边栏显示交互日志，记录每步操作时间和类型。",
        "截图演示每步关键页面（screenshots/01_home.png 到 12_banner_click.png）。",
        "统计总交互步骤、访问页面数、搜索次数、转化动作次数，并可下载交互日志。"
      ]
    },
    {
      "module": "核心功能模块",
      "name": "旅程可视化与断点分析",
      "goal": "使用现有 Python 脚本生成客户旅程全景图、转化漏斗、薄弱环节热力图和流失预测仪表盘，并输出 AI 分析报告。",
      "prompts": [
        "生成客户旅程地图：展示每阶段触点、用户量和满意度。",
        "生成转化漏斗：显示从认知到续费各阶段用户流失及流失率。",
        "生成薄弱环节热力图：按触点类型和满意度计算痛点指数，高风险环节深色显示。",
        "生成流失预测仪表盘：展示流失风险构成和月度流失预测趋势。",
        "生成文本 AI 报告，总结关键发现、KPIs 和改进建议。",
        "输出图表 PNG 文件到 output 文件夹。"
      ],
      "demo_effects": [
        "前端显示旅程全景图，漏斗图和薄弱环节热力图，可缩放和点击查看详情。",
        "雷达图展示各阶段满意度趋势，并区分数字渠道与线下渠道。",
        "流失预测仪表盘显示风险分布和未来2个月预测流失。",
        "AI 分析报告以文本卡片形式展示关键发现和改进建议。",
        "PNG 图表可下载，展示整体旅程分析结果。"
      ]
    }
  ]
}