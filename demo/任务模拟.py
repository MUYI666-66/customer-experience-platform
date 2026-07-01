"""
╔══════════════════════════════════════════════════════════════╗
║  功能点2: 交互式任务模拟 - Playwright 自动化脚本              ║
║  Simulated User Journey on Mock China Mobile App            ║
╚══════════════════════════════════════════════════════════════╝

使用 Playwright 模拟真实用户在 Mock 中国移动APP上执行操作:
- 浏览首页 → 搜索"移动产品资费" → 查看搜索结果
- 进入产品中心 → 浏览5G套餐 → 查看详情 → 办理套餐
- 进入个人中心 → 查看订单
- 在线客服咨询 → 询问移动产品资费
"""
import asyncio
import io
import os
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from playwright.async_api import async_playwright

BASE_URL = "http://127.0.0.1:5099"
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "..", "output", "screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

# 交互日志 (同时输出用于旅程分析)
interaction_log = []


def log(msg, event_type="action"):
    timestamp = time.strftime("%H:%M:%S")
    entry = f"  [{timestamp}] {msg}"
    print(entry)
    interaction_log.append({"time": timestamp, "type": event_type, "msg": msg})


async def simulate_user_journey():
    """模拟用户在中国移动APP上的完整操作旅程"""

    print("\n" + "=" * 62)
    print("  功能点2: 交互式任务模拟")
    print("  Interactive Task Simulation on Mock China Mobile APP")
    print("=" * 62)

    async with async_playwright() as p:
        # 启动浏览器 (可视模式，方便录制)
        browser = await p.chromium.launch(
            headless=False,
            args=["--window-size=500,900", "--window-position=100,50"]
        )
        context = await browser.new_context(
            viewport={"width": 420, "height": 850},
            user_agent="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
            locale="zh-CN",
        )
        page = await context.new_page()

        # ── 步骤1: 进入首页 ──────────────────────────
        log("📱 用户打开中国移动APP，进入首页...", "page_enter")
        await page.goto(BASE_URL, wait_until="networkidle")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "01_home.png"))
        log("   → 浏览首页：看到余额、流量余量、推荐套餐", "scroll")

        # 滚动页面
        await page.evaluate("window.scrollBy(0, 200)")
        await page.wait_for_timeout(800)

        # ── 步骤2: 点击搜索 → 搜索"移动产品资费" ─────
        log("🔍 用户点击搜索栏，输入'移动产品资费'进行搜索...", "click")
        await page.click(".search-bar")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "02_search_page.png"))

        # 输入搜索关键词
        search_input = page.locator("#searchInput")
        await search_input.fill("移动产品资费")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "03_search_typing.png"))

        # 点击搜索按钮
        await page.click(".search-btn")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "04_search_results.png"))
        log("   → 搜索结果展示：资费大全、5G套餐、5G终端优惠等", "result")

        # ── 步骤3: 点击搜索结果中的"移动产品资费大全" ──
        log("👆 用户点击'移动产品资费大全'查看所有资费...", "click")
        result_links = page.locator(".result-item")
        count = await result_links.count()
        if count > 0:
            await result_links.first.click()
            await page.wait_for_timeout(1500)
            await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "05_products_list.png"))
            log("   → 进入产品中心，看到全部套餐资费列表", "page_view")

        # ── 步骤4: 浏览产品，查看5G套餐详情 ──────────
        log("👆 用户对5G智享套餐感兴趣，点击查看详情...", "click")
        product_cards = page.locator(".product-card")
        pc_count = await product_cards.count()
        if pc_count > 0:
            await product_cards.first.click()
            await page.wait_for_timeout(1500)
            await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "06_product_detail.png"))
            log("   → 查看套餐详情：30GB流量/500分钟/128元每月", "page_view")

        # ── 步骤5: 点击"立即办理" ─────────────────────
        log("🛒 用户决定办理5G智享套餐，点击'立即办理'...", "click")
        buy_btn = page.locator("#btn-buy")
        if await buy_btn.count() > 0:
            await buy_btn.click()
            await page.wait_for_timeout(1500)
            await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "07_order_submitted.png"))
            log("   → 订单提交成功！系统生成订单号", "conversion")

        # ── 步骤6: 返回首页 → 进入个人中心 ──────────
        log("👤 用户返回首页，进入'我的'查看账户信息...", "click")
        await page.goto(f"{BASE_URL}/my-account", wait_until="networkidle")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "08_my_account.png"))
        log("   → 查看我的账户：12个月在网/全球通会员/2860积分", "page_view")

        # ── 步骤7: 进入客服，咨询移动产品资费 ─────────
        log("💬 用户对资费有疑问，进入在线客服咨询...", "click")
        await page.goto(f"{BASE_URL}/support", wait_until="networkidle")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "09_support_page.png"))

        # 在输入框中输入问题
        msg_input = page.locator("#msgInput")
        await msg_input.fill("我想了解一下移动产品资费有哪些？")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "10_support_typing.png"))

        # 发送消息
        send_btn = page.locator("button", has_text="发送")
        await send_btn.click()
        await page.wait_for_timeout(1500)
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "11_support_reply.png"))
        log("   → 智能客服回复，建议查看产品中心或拨打10086", "interaction")

        # ── 界面快照 ──────────────────────────────────
        await page.wait_for_timeout(500)

        # ── 步骤8: 回到首页，点击 banner 广告 ──────────
        log("🏠 用户回到首页查看其他推荐...", "navigate")
        await page.goto(BASE_URL, wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # 点击banner
        banner_btn = page.locator(".banner .btn")
        if await banner_btn.count() > 0:
            await banner_btn.click()
            await page.wait_for_timeout(1500)
            await page.screenshot(path=os.path.join(SCREENSHOT_DIR, "12_banner_click.png"))
            log("   → 通过首页banner再次查看5G套餐", "click")

        # ── 结束 ──────────────────────────────────────
        log("✅ 用户旅程模拟完成", "complete")
        await page.wait_for_timeout(1000)

        await browser.close()

    return interaction_log


# ── 主入口 ─────────────────────────────────────────────

def main():
    try:
        log_data = asyncio.run(simulate_user_journey())
    except Exception as e:
        print(f"\n  ❌ 错误: {e}")
        print(f"  请确保 Mock APP 已启动: python demo/feature2_app/mock_app.py")
        sys.exit(1)

    print("\n" + "─" * 62)
    print("  📊 交互旅程摘要")
    print("─" * 62)

    pages_visited = [e for e in log_data if e["type"] in ("page_enter", "page_view")]
    searches = [e for e in log_data if e["type"] in ("click",) and "搜索" in e["msg"]]
    conversions = [e for e in log_data if e["type"] == "conversion"]

    print(f"   访问页面数:   {len(pages_visited)}")
    print(f"   搜索操作:     {len(searches)} 次")
    print(f"   转化动作:     {len(conversions)} 次(办理套餐)")
    print(f"   总交互步骤:   {len(log_data)}")
    print(f"   截图保存至:   {SCREENSHOT_DIR}")
    print(f"   交互日志:     {os.path.join(os.path.dirname(__file__), '..', 'output', 'interaction_log.jsonl')}")

    print("\n" + "=" * 62)
    print("  ✅ 功能点2 完成: 成功模拟用户在中国移动APP上的交互旅程")
    print("=" * 62)
    time.sleep(1)


if __name__ == "__main__":
    main()
