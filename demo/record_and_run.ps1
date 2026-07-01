# ╔══════════════════════════════════════════════════════════════╗
# ║  DEMO 自动录制+演示脚本 (PowerShell)                          ║
# ║  同时录制屏幕并运行三个功能点演示                              ║
# ╚══════════════════════════════════════════════════════════════╝

$ErrorActionPreference = "Stop"
$DemoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $DemoDir
$OutputDir = Join-Path $DemoDir "output"
$VideoFile = Join-Path $OutputDir "demo_video.mp4"

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Clear-Host
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗"
Write-Host "║  中国移动客户体验分析平台 - DEMO 自动录制     ║"
Write-Host "╚══════════════════════════════════════════════╝"
Write-Host ""
Write-Host "  视频输出: $VideoFile"
Write-Host "  最长时长: 10分钟(600秒)"
Write-Host ""
Write-Host "  ⚠️  请关闭不必要的窗口，保持桌面整洁"
Write-Host "  ⚠️  录制过程中请勿操作鼠标键盘"
Write-Host ""
Write-Host "  按 ENTER 开始..."
Read-Host

# 启动 ffmpeg 录制 (后台进程)
Write-Host ""
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 启动屏幕录制..."
$ffmpegArgs = @(
    "-f", "gdigrab",
    "-framerate", "10",
    "-i", "desktop",
    "-t", "600",
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "24",
    "-pix_fmt", "yuv420p",
    "-loglevel", "warning",
    "-stats",
    "-y",
    $VideoFile
)

$ffmpegProc = Start-Process -FilePath "D:\ffmpeg\ffmpeg\bin\ffmpeg.exe" `
    -ArgumentList $ffmpegArgs `
    -NoNewWindow `
    -PassThru

Write-Host "   ffmpeg 录制进程 PID: $($ffmpegProc.Id)"
Start-Sleep -Seconds 2

try {
    # 运行 Python 演示
    Write-Host ""
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 开始运行演示..."
    Write-Host ""

    $pythonScript = Join-Path $DemoDir "run_demo.py"
    $proc = Start-Process -FilePath "python" `
        -ArgumentList "`"$pythonScript`"" `
        -NoNewWindow `
        -Wait `
        -PassThru

    Write-Host ""
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 演示运行完成 (exit code: $($proc.ExitCode))"

} finally {
    # 停止 ffmpeg 录制
    Write-Host ""
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 停止录制..."

    if (-not $ffmpegProc.HasExited) {
        # 发送 Ctrl+C 等效信号
        $ffmpegProc.CloseMainWindow() | Out-Null
        Start-Sleep -Seconds 2
        if (-not $ffmpegProc.HasExited) {
            Stop-Process -Id $ffmpegProc.Id -Force -ErrorAction SilentlyContinue
        }
    }

    Write-Host "   录制已停止"
}

# 检查视频文件
if (Test-Path $VideoFile) {
    $size = (Get-Item $VideoFile).Length / 1MB
    Write-Host ""
    Write-Host "   ✅ 视频录制成功!"
    Write-Host "   文件: $VideoFile"
    Write-Host "   大小: $([math]::Round($size, 1)) MB"

    # 可选: 获取时长
    $durationInfo = ffprobe -v quiet -show_entries format=duration `
        -of default=noprint_wrappers=1:nokey=1 $VideoFile 2>$null
    if ($durationInfo) {
        $mins = [math]::Floor([double]$durationInfo / 60)
        $secs = [math]::Round([double]$durationInfo % 60, 0)
        Write-Host "   时长: ${mins}分${secs}秒"
    }
} else {
    Write-Host ""
    Write-Host "   ❌ 视频文件未生成，请检查 ffmpeg 是否正常工作"
}

Write-Host ""
Write-Host "  按 ENTER 退出..."
Read-Host
