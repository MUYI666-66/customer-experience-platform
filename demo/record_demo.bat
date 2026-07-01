@echo off
chcp 65001 >nul
REM ╔══════════════════════════════════════════════════════════════╗
REM ║  DEMO 视频录制脚本 (使用 ffmpeg gdigrab)                     ║
REM ║  录制整个桌面的演示过程为一个MP4文件                          ║
REM ╚══════════════════════════════════════════════════════════════╝

setlocal enabledelayedexpansion

set OUTPUT_DIR=%~dp0output
set VIDEO_FILE=%OUTPUT_DIR%\demo_video.mp4

if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo.
echo ╔══════════════════════════════════════════════╗
echo ║   中国移动客户体验分析平台 DEMO 录制          ║
echo ╚══════════════════════════════════════════════╝
echo.
echo   录制文件: %VIDEO_FILE%
echo   录制时长: 约10分钟 (硬限制600秒)
echo.
echo   ⚠️  确保 ffmpeg 已安装且可在PATH中找到
echo   ⚠️  录制过程中请勿操作鼠标键盘
echo.
echo   按任意键开始录制...
pause >nul

echo.
echo [%time%] 开始录制...
echo.

REM 使用 ffmpeg gdigrab 录制整个桌面
REM -f gdigrab: Windows屏幕捕获
REM -framerate 10: 10fps (演示够用,减小文件大小)
REM -i desktop: 捕获整个桌面
REM -t 600: 最长10分钟
REM -c:v libx264: H.264编码
REM -preset fast: 快速编码
REM -crf 24: 较好的压缩质量
REM -pix_fmt yuv420p: 兼容性
REM -y: 覆盖已存在的文件

"D:\ffmpeg\ffmpeg\bin\ffmpeg.exe" -f gdigrab -framerate 10 -i desktop ^
       -t 600 ^
       -c:v libx264 -preset fast -crf 24 -pix_fmt yuv420p ^
       -loglevel warning -stats ^
       -y "%VIDEO_FILE%"

echo.
echo [%time%] 录制完成!
echo.
echo   视频文件: %VIDEO_FILE%
echo.

REM 显示文件信息
ffprobe -v quiet -show_entries format=duration,size -of default=noprint_wrappers=1 "%VIDEO_FILE%"

echo.
echo   按任意键退出...
pause >nul
