"""
╔══════════════════════════════════════════════════════════════════╗
║  DEMO 总控脚本 - 顺序运行三个功能点演示                           ║
║  Master Orchestration Script for All 3 Demo Features            ║
╚══════════════════════════════════════════════════════════════════╝

运行方式:
  python demo/run_demo.py

如需录制视频, 请使用:
  demo/record_demo.bat
"""
import os
import sys
import io
import time
import subprocess
import signal

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

DEMO_DIR = os.path.dirname(__file__)
PROJECT_DIR = os.path.dirname(DEMO_DIR)
OUTPUT_DIR = os.path.join(DEMO_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def clear_screen():
    os.system("cls" if sys.platform == "win32" else "clear")


def print_banner(num, title, subtitle):
    clear_screen()
    banner = f"""
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   功能点 {num}: {title:<48s} ║
║   {subtitle:<62s} ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
"""
    print(banner)
    time.sleep(2)


def run_python_script(script_path, description=""):
    """运行Python脚本并等待完成"""
    print(f"\n{'=' * 62}")
    print(f"  ▶ 运行: {description or os.path.basename(script_path)}")
    print(f"{'=' * 62}\n")

    abs_path = os.path.join(PROJECT_DIR, script_path)
    result = subprocess.run(
        [sys.executable, abs_path],
        cwd=PROJECT_DIR,
        capture_output=False,
        text=True,
        timeout=300  # 5分钟超时
    )
    return result.returncode


def start_mock_server():
    """启动Mock APP服务器"""
    print("\n   🔧 启动Mock中国移动APP服务器...")
    server_script = os.path.join(DEMO_DIR, "feature2_app", "mock_app.py")
    process = subprocess.Popen(
        [sys.executable, server_script],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=PROJECT_DIR,
    )
    time.sleep(2)  # 等待服务器启动
    print(f"   ✅ 服务器已启动 (PID: {process.pid})")
    return process


def stop_mock_server(process):
    """停止Mock APP服务器"""
    if process:
        print("\n   🔧 停止Mock APP服务器...")
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        print("   ✅ 服务器已停止")


def main():
    print_banner(0, "中国移动客户体验分析平台 DEMO", "China Mobile CX Analysis Platform Demo")
    print("  即将依次演示以下三个功能点:\n")
    print("  1️⃣  大规模合成用户生成 (800个用户画像)")
    print("  2️⃣  交互式任务模拟 (中国移动APP操作模拟)")
    print("  3️⃣  旅程可视化与断点分析 (AI分析报告)")
    print(f"\n  输出目录: {OUTPUT_DIR}")
    print("\n  ▶ 自动模式: 开始演示...")
    time.sleep(1)

    mock_server = None

    try:
        # ── 功能点1: 大规模合成用户生成 ─────────────────
        print_banner(1, "大规模合成用户画像生成",
                     "Large-Scale Synthetic User Persona Generation")
        run_python_script("demo/大规模合成用户生成.py",
                         "Feature 1 - 用户画像生成")
        print("\n  ▶ 自动模式: 进入下一个功能点...")
        time.sleep(1)

        # ── 功能点2: 交互式任务模拟 ─────────────────────
        print_banner(2, "交互式任务模拟",
                     "Interactive Task Simulation on Mock China Mobile APP")

        # 启动Mock服务器
        mock_server = start_mock_server()
        time.sleep(1)

        run_python_script("demo/任务模拟.py",
                         "Feature 2 - 交互式任务模拟")

        time.sleep(1)
        stop_mock_server(mock_server)
        mock_server = None

        # ── 功能点3: 旅程可视化与断点分析 ─────────────
        print_banner(3, "客户旅程可视化与断点分析",
                     "Customer Journey Visualization & Breakpoint Analysis")
        run_python_script("demo/旅程可视化与断点分析.py",
                         "Feature 3 - 旅程可视化与分析")

    except KeyboardInterrupt:
        print("\n\n  ⚠️  演示被用户中断")
    except Exception as e:
        print(f"\n\n  ❌ 演示出错: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if mock_server:
            stop_mock_server(mock_server)

    # ── 完成 ───────────────────────────────────────────
    clear_screen()
    print(f"""
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║                     ✅ DEMO 演示完成!                             ║
║                                                                  ║
║   功能点1: 生成 {800} 个合成用户画像                                ║
║   输出文件: synthetic_users.csv                                  ║
║                                                                  ║
║   功能点2: 模拟用户在中国移动APP上的完整交互旅程                   ║
║   截图保存: output/screenshots/                                   ║
║   交互日志: output/interaction_log.jsonl                          ║
║                                                                  ║
║   功能点3: 生成客户旅程可视化地图和AI断点分析报告                  ║
║   可视化: output/journey_map_overview.png                         ║
║          output/funnel_analysis.png                               ║
║          output/pain_point_analysis.png                           ║
║          output/churn_prediction.png                              ║
║                                                                  ║
║   所有输出文件位于: {OUTPUT_DIR}                                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
""")

    # 自动打开输出目录
    if sys.platform == "win32":
        os.startfile(OUTPUT_DIR)
    else:
        subprocess.run(["open", OUTPUT_DIR])

    print("\n  感谢观看! 🎉\n")


if __name__ == "__main__":
    main()
