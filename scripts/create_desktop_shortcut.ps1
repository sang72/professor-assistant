# Create desktop shortcuts for Professor Assistant

$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ProfDir = Split-Path -Parent $PSScriptRoot
$BatchFile = Join-Path $ProfDir "Professor Assistant.bat"

# 배치 파일 바로가기 생성
$shell = New-Object -ComObject WScript.Shell
$shortcutPath = Join-Path $DesktopPath "Professor Assistant.lnk"
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $BatchFile
$shortcut.WorkingDirectory = $ProfDir
$shortcut.Description = "Professor Assistant — 강의 제작 시스템"
$shortcut.IconLocation = "C:\Windows\System32\cmd.exe,0"
$shortcut.Save()

Write-Host "✅ 바탕화면 바로가기 생성 완료!" -ForegroundColor Green
Write-Host "   위치: $shortcutPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "이제 바탕화면의 'Professor Assistant' 아이콘을 더블클릭하면 자동 시작됩니다!" -ForegroundColor Green
