# 서버 시작 방법 (가장 간단함!)

## 🚀 3가지 방법 (난이도 순)

---

## 방법 1️⃣: 배치 파일 (가장 간단) ⭐⭐⭐

### Windows 명령 프롬프트에서:

```bash
cd C:\Users\Sang\Desktop\professor-assistant
run-web.bat
```

또는 파일 탐색기에서 `run-web.bat` **더블클릭**

**문제가 나면:**
```bash
cleanup-port.bat
run-web.bat
```

---

## 방법 2️⃣: PowerShell (가장 안정적) ⭐⭐⭐⭐⭐

### 1단계: PowerShell 시작
- **Windows 시작 메뉴**에서 `PowerShell` 검색
- **Windows PowerShell** 우클릭 → **"관리자 권한으로 실행"** 클릭

### 2단계: 폴더 이동
```powershell
cd C:\Users\Sang\Desktop\professor-assistant
```

### 3단계: 스크립트 실행

**다음 명령 중 하나를 복사 & 붙여넣기:**

#### 옵션 A: 권한 설정 후 실행 (한 번만 설정)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
.\start-server.ps1
```

#### 옵션 B: 한 번만 실행 (권한 설정 안 함)
```powershell
powershell -ExecutionPolicy Bypass -File .\start-server.ps1
```

---

## 방법 3️⃣: 수동 시작 (세밀한 제어)

### 터미널 1 - 백엔드 시작:
```bash
cd C:\Users\Sang\Desktop\professor-assistant\web\server
npm install
npm start
```

---

## 🌐 브라우저에서 열기

모든 방법이 성공하면, 브라우저에 다음 주소를 입력:

```
http://localhost:3000
```

그러면 이런 화면이 보입니다:
```
🎓 Professor Assistant
AI 기반 교수 지원 시스템

[Franchise Management 카드]
진행률: 22%
```

---

## ✅ 성공 확인

### 터미널에 이런 메시지가 보이면 성공:
```
===================================
  Server is ready!
  URL: http://localhost:3000
===================================
```

### 브라우저에 이런 화면이 보이면 성공:
- 페이지 제목: "🎓 Professor Assistant"
- 교과목 카드: "Franchise Management"
- 진행률: "22% (11/50)"

---

## 🆘 문제 해결

### Q: "포트 3000이 이미 사용 중입니다" 에러

**A: 포트 정리 후 다시 시작**

#### 방법 1 (배치 파일 - 가장 간단):
```bash
cleanup-port.bat
run-web.bat
```

#### 방법 2 (PowerShell - 추천):
```powershell
# 모든 node.exe 종료
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# 1초 대기
Start-Sleep -Seconds 1

# 다시 시작
.\start-server.ps1
```

#### 방법 3 (작업 관리자):
1. `Ctrl + Shift + Esc` 누르기
2. "node.exe" 찾기
3. 우클릭 → "작업 종료"
4. `run-web.bat` 다시 실행

---

### Q: PowerShell에서 "파일을 로드할 수 없습니다" 에러

**A: 다음 명령 실행**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

그 다음:
```powershell
.\start-server.ps1
```

---

### Q: 브라우저에서 페이지가 안 열립니다

**확인할 것:**
1. 주소 확인: `http://localhost:3000` (https 아님!)
2. 브라우저 새로고침: `F5` 또는 `Ctrl+Shift+R`
3. 다른 브라우저 시도: Chrome, Firefox, Edge 등
4. 방화벽 확인: 포트 3000 차단 여부

---

## 💡 팁

### 포트를 다른 번호로 변경하고 싶으면:

```bash
cd web\server
PORT=3001 npm start
```

그 후 `http://localhost:3001` 으로 접속

---

## 📋 체크리스트

서버를 시작할 때 확인하세요:

- [ ] PowerShell 또는 명령 프롬프트 실행
- [ ] 프로젝트 폴더로 이동 (`cd C:\Users\Sang\Desktop\professor-assistant`)
- [ ] `run-web.bat` 실행 또는 `.\start-server.ps1` 실행
- [ ] "Server is ready!" 메시지 확인
- [ ] 브라우저에서 `http://localhost:3000` 열기
- [ ] 페이지 로드 확인

---

## 🎓 시작하기!

이제 준비가 되었습니다! 🚀

**가장 간단한 방법:**
```bash
run-web.bat
```

**그 다음:**
```
http://localhost:3000
```

**완료!** 🎉
