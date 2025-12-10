# Tone & FLO

UX Writing 도우미 - AI 기반 UX 라이팅 제안, 검토, 의사결정 지원 서비스

## 주요 기능

- **제안받기**: 상황에 맞는 UX 문구 제안
- **검토하기**: 작성한 문구 분석 및 개선안 제공
- **결정하기**: 여러 문구 옵션 비교 및 추천
- **관리자 설정**: 전사 가이드라인 및 사례 관리

## 기술 스택

- **Frontend**: React + TypeScript + Vite
- **AI Model**: 사내 GPT OSS 120b (`http://10.1.22.181:11434/api/chat`)
- **Styling**: Vanilla CSS

## 실행 방법

**필수 요구사항:** Node.js

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
```

서버는 `http://localhost:3000`에서 실행됩니다.

## 관리자 접근

- **경로**: `/admin`
- **비밀번호**: `2025PDtone&flo`
- **기능**: 가이드라인 관리, 사용자 의견 확인

## 배포

- **프로덕션 URL**: https://flo-ux-write-k387.vercel.app
- **자동 배포**: `main` 브랜치에 푸시 시 자동 배포됨
- **플랫폼**: Vercel
