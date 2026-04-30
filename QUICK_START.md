# 빠른 시작 가이드 (Quick Start)

## 🚀 3가지 방법으로 서버 시작하기

### 방법 1️⃣: 배치 파일 (가장 간단함) ⭐ **추천**
```bash
./run-web.bat
```

**만약 "포트 3000이 이미 사용 중입니다" 에러가 나면:**
```bash
# 먼저 포트를 정리하세요:
./cleanup-port.bat

# 그 다음 다시 시작하세요:
./run-web.bat
```

---

### 방법 2️⃣: PowerShell (가장 안정적) ✨ **추천**

1. **PowerShell을 관리자로 실행**합니다
   - Windows 검색: `PowerShell` 입력
   - 우클릭 → "관리자로 실행"

2. **프로젝트 디렉토리로 이동**:
```powershell
cd C:\Users\Sang\Desktop\professor-assistant
```

3. **서버 시작 스크립트 실행**:
```powershell
.\start-server.ps1
```

**참고:** 실행 정책 오류가 나면:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### 방법 3️⃣: 수동으로 시작 (세밀한 제어)

**터미널 1 - 백엔드 시작:**
```bash
cd web/server
npm install  # 처음만
npm start
```

**터미널 2 - 프론트엔드 빌드 (이미 빌드됨):**
```bash
cd web/client
npm run build  # 이미 빌드되어 있으므로 생략 가능
```

---

## 🌐 브라우저에서 열기

모든 방법이 성공하면:

```
http://localhost:3000
```

위 주소를 브라우저에 입력하고 Enter를 누릅니다.

---

## ✅ 확인 사항

### 서버가 제대로 시작되었다면:
```
===================================
  Professor Assistant Web Server
===================================

[4/4] Starting server...

===================================
  Server is ready!
  URL: http://localhost:3000
===================================

Press Ctrl+C to stop
```

### 브라우저에서:
- ✅ "🎓 Professor Assistant" 페이지가 보임
- ✅ "Franchise Management" 교과목 카드가 보임
- ✅ 진행률 (22%) 표시가 보임

---

## 🐛 문제 해결

### 문제 1: "포트 3000이 이미 사용 중입니다"

**빠른 해결:**
```bash
./cleanup-port.bat
./run-web.bat
```

**또는 PowerShell에서:**
```powershell
# 포트 3000을 사용 중인 모든 프로세스 종료
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { 
    Stop-Process -Id $_.OwningProcess -Force 
}
```

---

### 문제 2: "npm: 명령을 찾을 수 없습니다"

**해결:** Node.js 재설치
1. https://nodejs.org 에서 LTS 버전 다운로드
2. 설치 후 터미널 재시작

---

### 문제 3: 브라우저에서 페이지가 안 열림

**확인:**
1. 주소 확인: `http://localhost:3000` (https 아님)
2. 브라우저 새로고침: `F5` 또는 `Ctrl+F5`
3. 콘솔 확인: `F12` → Console 탭
4. 방화벽 확인

---

### 문제 4: "명령을 실행할 수 없습니다"

**배치 파일 권한 문제:**
1. `run-web.bat` 우클릭
2. "속성" 클릭
3. "일반" 탭에서 "차단 해제" 체크
4. "적용" → "확인"

또는 PowerShell 사용:
```powershell
powershell -ExecutionPolicy Bypass -File .\start-server.ps1
```

---

## 📋 기본 사용 흐름

```
1. 서버 시작 (./run-web.bat 또는 .\start-server.ps1)
   ↓
2. 브라우저에서 http://localhost:3000 열기
   ↓
3. "Franchise Management" 교과목 카드 클릭
   ↓
4. 4개 탭에서 기능 사용:
   - [개요] — 과목 정보 확인
   - [교재 관리] — 목차 파일 업로드
   - [작업 목록] — 강의안 생성 (프롬프트 복사)
   - [파일 다운로드] — Word 파일 다운로드
```

---

## 💡 팁

1. **포트 변경하기:**
   ```bash
   cd web/server
   PORT=3001 npm start
   ```
   그 후 `http://localhost:3001` 으로 접속

2. **개발 모드 (자동 새로고침):**
   ```bash
   cd web/server
   npm run dev
   ```

3. **프론트엔드 개발 모드:**
   ```bash
   cd web/client
   npm run dev
   ```

---

## 🆘 추가 도움

- **상세 가이드:** `TESTING_GUIDE.md` 참고
- **API 문서:** `WEB_APP.md` 참고
- **테스트 보고서:** `FINAL_TEST_REPORT.md` 참고

---

**즐거운 사용 되세요! 🎓**
