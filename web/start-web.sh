#!/bin/bash

echo "🎓 Professor Assistant Web Server 시작..."
echo ""

# Check if node_modules exists for server
if [ ! -d "web/server/node_modules" ]; then
  echo "📦 백엔드 의존성 설치 중..."
  cd web/server
  npm install
  cd ../..
fi

# Check if node_modules exists for client
if [ ! -d "web/client/node_modules" ]; then
  echo "📦 프론트엔드 의존성 설치 중..."
  cd web/client
  npm install
  cd ../..
fi

# Build client if dist doesn't exist
if [ ! -d "web/client/dist" ]; then
  echo "🏗️  프론트엔드 빌드 중..."
  cd web/client
  npm run build
  cd ../..
fi

echo ""
echo "✓ 준비 완료"
echo ""
echo "🚀 웹 서버 시작..."
echo "   URL: http://localhost:3000"
echo ""
echo "Ctrl+C로 중지할 수 있습니다"
echo ""

cd web/server
node server.js
