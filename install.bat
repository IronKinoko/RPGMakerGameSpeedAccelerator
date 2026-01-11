@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo RPGMaker 游戏变速器自动安装脚本
echo ========================================
echo.

:: 获取当前脚本所在目录
set "SCRIPT_DIR=%~dp0"
cd /d "!SCRIPT_DIR!"

:: 检查 GameSpeedAccelerator.js 是否存在
if not exist "GameSpeedAccelerator.js" (
    echo [错误] 找不到 GameSpeedAccelerator.js 文件
    echo 请确保此脚本与 GameSpeedAccelerator.js 在同一目录下
    pause
    exit /b 1
)

:: 提示用户输入游戏路径
echo 请将游戏根目录拖拽到此窗口，然后按回车
echo.
set /p SEARCH_PATH="游戏路径: "

:: 移除路径两端的引号
set SEARCH_PATH=!SEARCH_PATH:"=!

:: 检查是否输入了路径
if "!SEARCH_PATH!"=="" (
    echo [错误] 必须提供游戏路径
    pause
    exit /b 1
)

:: 检查路径是否存在
if not exist "!SEARCH_PATH!" (
    echo [错误] 指定的路径不存在: !SEARCH_PATH!
    pause
    exit /b 1
)

echo.
echo 正在搜索 plugins.js 文件...
echo.

:: 递归搜索 plugins.js
set "PLUGINS_JS_PATH="
set "FOUND_COUNT=0"

for /f "delims=" %%F in ('dir /s /b "!SEARCH_PATH!\plugins.js" 2^>nul') do (
    set /a FOUND_COUNT+=1
    set "PLUGINS_JS_PATH=%%F"
    echo [!FOUND_COUNT!] %%F
)

if !FOUND_COUNT! equ 0 (
    echo [错误] 在指定目录下未找到 plugins.js 文件
    echo 请确保搜索路径正确
    pause
    exit /b 1
)

:: 如果找到多个，让用户选择
if !FOUND_COUNT! gtr 1 (
    echo.
    echo 找到多个 plugins.js 文件，请选择要安装的目标:
    set /p SELECT_NUM="请输入编号 (1-!FOUND_COUNT!): "
    
    set "CURRENT_NUM=0"
    for /f "delims=" %%F in ('dir /s /b "!SEARCH_PATH!\plugins.js" 2^>nul') do (
        set /a CURRENT_NUM+=1
        if !CURRENT_NUM! equ !SELECT_NUM! (
            set "PLUGINS_JS_PATH=%%F"
        )
    )
)

echo.
echo 选择的文件: !PLUGINS_JS_PATH!

:: 获取 plugins.js 所在目录
for %%F in ("!PLUGINS_JS_PATH!") do set "PLUGINS_JS_DIR=%%~dpF"

:: 检查 plugins 文件夹（应该在 plugins.js 同一目录下）
set "PLUGINS_DIR=!PLUGINS_JS_DIR!plugins"
if not exist "!PLUGINS_DIR!" (
    echo [错误] 在 plugins.js 同级目录下找不到 plugins 文件夹
    echo 路径: !PLUGINS_DIR!
    pause
    exit /b 1
)

echo.
echo [1/2] 正在复制插件文件...
copy /Y "!SCRIPT_DIR!GameSpeedAccelerator.js" "!PLUGINS_DIR!\GameSpeedAccelerator.js" >nul
if !errorlevel! neq 0 (
    echo [错误] 复制文件失败
    pause
    exit /b 1
)
echo ✓ 插件文件已复制到: !PLUGINS_DIR!

echo.
echo [2/2] 正在修改 plugins.js 文件...

:: 备份原文件
copy /Y "!PLUGINS_JS_PATH!" "!PLUGINS_JS_PATH!.backup" >nul
echo ✓ 已创建备份文件: plugins.js.backup

:: 检查是否已经安装
findstr /C:"GameSpeedAccelerator" "!PLUGINS_JS_PATH!" >nul 2>&1
if not errorlevel 1 (
    echo.
    echo [警告] 检测到 plugins.js 中已包含 GameSpeedAccelerator 配置
    echo 是否要重新添加？^(输入 Y 继续，任意其他键跳过^)
    set /p CHOICE="选择: "
    if /i "!CHOICE!" neq "Y" (
        echo 已跳过修改 plugins.js
        goto :done
    )
)

:: 获取短路径名（8.3格式），避免特殊字符问题
for %%F in ("!PLUGINS_JS_PATH!") do set "PLUGINS_JS_SHORT=%%~sF"

:: 读取文件内容，找到最后的 ]
set "TEMP_FILE=!PLUGINS_JS_DIR!plugins_temp.js"
set "FOUND_END=0"
set "LINE_COUNT=0"

for /f "usebackq delims=" %%i in ("!PLUGINS_JS_SHORT!") do (
    set /a LINE_COUNT+=1
    set "LINE=%%i"
    echo !LINE! | findstr /R "\]" >nul 2>&1
    if not errorlevel 1 (
        set FOUND_END=1
        set LAST_BRACKET_LINE=!LINE_COUNT!
    )
)

if !FOUND_END! equ 0 (
    echo [错误] 无法在 plugins.js 中找到正确的插入位置
    echo 请手动按照 README.md 的指引进行安装
    pause
    exit /b 1
)

:: 重新读取文件并在正确位置插入配置
set "CURRENT_LINE=0"
(for /f "usebackq delims=" %%i in ("!PLUGINS_JS_SHORT!") do (
    set /a CURRENT_LINE+=1
    if !CURRENT_LINE! equ !LAST_BRACKET_LINE! (
        echo ,{
        echo   "name": "GameSpeedAccelerator",
        echo   "status": true,
        echo   "description": "游戏变速器插件",
        echo   "parameters": {
        echo     "defaultSpeed": "1.0",
        echo     "speedStep": "0.5"
        echo   }
        echo }
    )
    echo %%i
)) > "!TEMP_FILE!"

:: 替换原文件
move /Y "!TEMP_FILE!" "!PLUGINS_JS_PATH!" >nul
if !errorlevel! neq 0 (
    echo [错误] 更新 plugins.js 失败
    echo 正在恢复备份...
    copy /Y "!PLUGINS_JS_PATH!.backup" "!PLUGINS_JS_PATH!" >nul
    pause
    exit /b 1
)

echo ✓ plugins.js 已更新

:done
echo.
echo ========================================
echo 安装完成！
echo ========================================
echo.
echo 快捷键说明:
echo   Shift + Z : 重置为 1.0x
echo   Shift + X : 减速  
echo   Shift + C : 加速
echo.
echo 如有问题，可以使用备份文件恢复:
echo   备份位置: !PLUGINS_JS_PATH!.backup
echo.
pause
